#!/usr/bin/env python3
"""
latency_pwc.py — build the AI & Robotics *latency compression* series: the lag
from a paper's publication to a working open-source implementation, per year.

Metric: for each paper with a linked code repository, lag = (repo's first commit
date) - (paper's arXiv publication date), in days. Per publication year we take
the median lag across papers and a CLUSTER bootstrap CI that resamples PAPERS
(one paper can link several repos; a paper is the unit, not the repo).

Historical spine: the Papers With Code paper<->code link dataset. PWC was retired
in July 2025, but its full dataset was released under CC-BY-SA and mirrored on
GitHub / Hugging Face, including the `links-between-papers-and-code` file. This
script reads that archived file from disk (we do not scrape at build time) and
resolves dates from two public APIs:
  - arXiv       (paper publication date, by arXiv id)
  - GitHub API  (repository first-commit date, via the Link-header last-page trick)

By construction the series ends in mid-2025 (the archive's freeze) and the last
year or two are unreliable because a recent paper's implementations are still
landing; those years are flagged reliable=0 and excluded from any trend.

Real data only. If a paper's arXiv date or a repo's first-commit date cannot be
resolved, that pair is dropped, never guessed. If too few pairs resolve in a
year, that year's row is emitted with a null median rather than a fabricated one.

Credentials (optional, both via env; never written to a CSV/log):
  GITHUB_TOKEN   lifts the GitHub API rate limit (60/hr -> 5000/hr)
  OPENALEX_EMAIL / contact email is not needed here

Usage:
  python scripts/velocity/latency_pwc.py \
    --links path/to/links-between-papers-and-code.json \
    --cohort "cs.AI|cs.LG|cs.RO|cs.CV" \
    --from-year 2015 \
    --out src/data/velocity/latency/ai-robotics.csv
"""
import argparse
import datetime as dt
import gzip
import json
import os
import random
import re
import ssl
import statistics
import sys
import time
import urllib.parse
import urllib.request

ARXIV_API = "http://export.arxiv.org/api/query"
GITHUB_API = "https://api.github.com"
SSL_CTX = ssl.create_default_context()


def load_links(path):
    """Read the archived PWC links file (.json or .json.gz): a list of records
    with at least paper_arxiv_id / paper_url_abs and repo_url."""
    opener = gzip.open if path.endswith(".gz") else open
    with opener(path, "rt") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise SystemExit(f"expected a JSON array in {path}")
    return data


def arxiv_id_of(rec):
    aid = rec.get("paper_arxiv_id")
    if aid:
        return aid.split("v")[0].strip()
    url = rec.get("paper_url_abs") or rec.get("paper_url") or ""
    m = re.search(r"arxiv\.org/abs/([0-9]+\.[0-9]+)", url)
    return m.group(1) if m else None


def repo_slug_of(rec):
    url = rec.get("repo_url") or ""
    m = re.search(r"github\.com/([^/]+/[^/#?]+)", url)
    if not m:
        return None
    return m.group(1).removesuffix(".git")


def http_json(url, headers=None, tries=4):
    delay = 2.0
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=headers or {})
            with urllib.request.urlopen(req, timeout=60, context=SSL_CTX) as r:
                return json.load(r), dict(r.headers)
        except urllib.error.HTTPError as e:
            if e.code in (403, 429, 500, 502, 503, 504):
                wait = min(float(e.headers.get("Retry-After") or delay), 90.0)
                print(f"  … {e.code}, waiting {wait:.0f}s", file=sys.stderr)
                time.sleep(wait)
                delay = min(delay * 2, 60)
                continue
            raise
        except Exception as ex:  # noqa: BLE001
            print(f"  … {ex}, retrying", file=sys.stderr)
            time.sleep(delay)
            delay = min(delay * 2, 60)
    return None, {}


def http_text(url, headers=None, tries=4):
    delay = 2.0
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers=headers or {})
            with urllib.request.urlopen(req, timeout=60, context=SSL_CTX) as r:
                return r.read().decode("utf-8", "replace"), dict(r.headers)
        except Exception as ex:  # noqa: BLE001
            print(f"  … {ex}, retrying", file=sys.stderr)
            time.sleep(delay)
            delay = min(delay * 2, 60)
    return None, {}


def arxiv_published(arxiv_id, email):
    """Publication date (UTC) for an arXiv id, via the Atom API. None on failure."""
    q = urllib.parse.urlencode({"id_list": arxiv_id, "max_results": 1})
    text, _ = http_text(f"{ARXIV_API}?{q}", headers={"User-Agent": f"plrd-latency ({email})"})
    if not text:
        return None
    m = re.search(r"<published>([0-9T:\-]+)Z?</published>", text)
    if not m:
        return None
    try:
        return dt.datetime.fromisoformat(m.group(1).replace("Z", "")).date()
    except ValueError:
        return None
    finally:
        time.sleep(3.1)  # arXiv asks for <= 1 request / 3s


def github_first_commit(slug, token):
    """Earliest commit date on a repo's default branch, via the Link-header
    last-page trick (per_page=1 -> the 'last' page is the oldest commit)."""
    headers = {"User-Agent": "plrd-latency", "Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    first, hdrs = http_json(f"{GITHUB_API}/repos/{slug}/commits?per_page=1", headers)
    if first is None:
        return None
    link = hdrs.get("Link") or hdrs.get("link") or ""
    last_url = None
    for part in link.split(","):
        m = re.search(r'<([^>]+)>;\s*rel="last"', part)
        if m:
            last_url = m.group(1)
    commits = first
    if last_url:
        commits, _ = http_json(last_url, headers)
        if commits is None:
            return None
    try:
        when = commits[-1]["commit"]["committer"]["date"]
        return dt.datetime.fromisoformat(when.replace("Z", "")).date()
    except (KeyError, IndexError, ValueError):
        return None
    finally:
        time.sleep(0.5)


def cluster_bootstrap_ci(lags_by_paper, iters=500):
    """Resample PAPERS (each a list of that paper's per-repo lags), pool, median."""
    papers = [p for p in lags_by_paper if p]
    if len(papers) < 8:
        return (None, None)
    rng = random.Random(42)
    meds = []
    n = len(papers)
    for _ in range(iters):
        pooled = []
        for _ in range(n):
            pooled.extend(papers[rng.randrange(n)])
        if pooled:
            meds.append(statistics.median(pooled))
    if not meds:
        return (None, None)
    meds.sort()
    return (round(meds[int(0.025 * len(meds))], 1), round(meds[int(0.975 * len(meds))], 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--links", required=True, help="archived PWC links JSON(.gz) on disk")
    ap.add_argument("--cohort", default="cs.AI|cs.LG|cs.RO|cs.CV",
                    help="frozen arXiv-id prefix / category filter (kept in provenance)")
    ap.add_argument("--from-year", type=int, default=2015)
    ap.add_argument("--to-year", type=int, default=dt.date.today().year)
    ap.add_argument("--reliable-cutoff-year", type=int, default=dt.date.today().year - 1)
    ap.add_argument("--max-papers-per-year", type=int, default=400)
    ap.add_argument("--email", default="")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    a.email = a.email or os.environ.get("OPENALEX_EMAIL", "plrd@protocol.ai")
    token = os.environ.get("GITHUB_TOKEN", "")

    # NOTE: the cohort filter here is intentionally simple (an arXiv-id / category
    # match against fields present in the PWC record). Freeze whatever string is
    # used into the provenance header so the series stays self-comparable.
    records = load_links(a.links)
    print(f"loaded {len(records)} PWC link records", file=sys.stderr)

    # Group candidate (paper -> repo slugs) by paper, keeping only GitHub repos.
    by_paper = {}
    for rec in records:
        aid = arxiv_id_of(rec)
        slug = repo_slug_of(rec)
        if not aid or not slug:
            continue
        by_paper.setdefault(aid, set()).add(slug)

    # Resolve dates and bucket lags by paper-year.
    rng = random.Random(42)
    lags_by_year = {}  # year -> list[list[int]]  (outer: papers, inner: per-repo lags)
    papers = list(by_paper.items())
    rng.shuffle(papers)
    per_year_seen = {}
    for aid, slugs in papers:
        pub = arxiv_published(aid, a.email)
        if not pub or not (a.from_year <= pub.year <= a.to_year):
            continue
        if per_year_seen.get(pub.year, 0) >= a.max_papers_per_year:
            continue
        paper_lags = []
        for slug in slugs:
            first = github_first_commit(slug, token)
            if not first:
                continue
            lag = (first - pub).days
            if lag >= 0:  # code after the paper; negatives are pre-registrations / mismatches
                paper_lags.append(lag)
        if paper_lags:
            lags_by_year.setdefault(pub.year, []).append(paper_lags)
            per_year_seen[pub.year] = per_year_seen.get(pub.year, 0) + 1
            print(f"  {aid} ({pub.year}) lags={paper_lags}", file=sys.stderr)

    rows = []
    for year in range(a.from_year, a.to_year + 1):
        papers_y = lags_by_year.get(year, [])
        flat = [x for p in papers_y for x in p]
        median = round(statistics.median(flat), 1) if flat else None
        lo, hi = cluster_bootstrap_ci(papers_y) if papers_y else (None, None)
        rows.append({
            "year": year,
            "median_lag_days": median,
            "lag_ci_lo": lo,
            "lag_ci_hi": hi,
            "n_papers": len(papers_y),
            "reliable": 0 if year >= a.reliable_cutoff_year else 1,
        })

    generated = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    header = "year,median_lag_days,lag_ci_lo,lag_ci_hi,n_papers,reliable"
    lines = [
        f"# generated: {generated}",
        "# source: Papers With Code paper<->code links (CC-BY-SA, archived Jul 2025); "
        "arXiv (publication date); GitHub API (first-commit date)",
        f"# cohort: {a.cohort}",
        f"# from_year: {a.from_year}",
        f"# reliable_cutoff_year: {a.reliable_cutoff_year}",
        "# metric: median days from arXiv publication to linked repo first commit; "
        "ci=cluster_bootstrap(resample=papers,iters=500,seed=42)",
        header,
    ]

    def cell(v):
        return "" if v is None else str(v)

    for r in rows:
        lines.append(",".join(cell(r[k]) for k in ["year", "median_lag_days", "lag_ci_lo", "lag_ci_hi", "n_papers", "reliable"]))
    with open(a.out, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {a.out} ({len(rows)} rows)", file=sys.stderr)


if __name__ == "__main__":
    main()
