#!/usr/bin/env python3
"""
field_velocity_openalex.py — build one field-velocity CSV per focus area from
OpenAlex (CC0). Real data only; no synthesised values.

Per publication year Y it emits:
  year,field_works,all_works,corpus_share_per_100k,first_time_authors,
  idea_vintage_median_years,vintage_ci_lo,vintage_ci_hi,n_refs_sampled,reliable

Idea vintage = the median AGE of the references cited by new work in year Y,
where age = Y - (referenced work's publication year). We draw a random sample of
works per year (OpenAlex `sample`), resolve their referenced works' years in
batches, pool the ages, take the median, and bootstrap a 95% CI.

Recent years (>= reliable_cutoff_year) are undercounted by OpenAlex indexing lag
and are flagged reliable=0.

Queries hit the FILTER cluster (`filter=title_and_abstract.search:...`), not the
anonymous fulltext `search=` cluster, which is currently rate-limited. `|` ORs
the frozen terms. A free API key (--api-key) lifts rate limits but is optional.

Usage:
  python scripts/velocity/field_velocity_openalex.py \
    --search "content addressing|peer-to-peer network|censorship resistance|decentralized storage" \
    --from-year 2005 --email lukas@protocol.ai \
    --out src/data/velocity/digital-human-rights.csv
"""
import argparse
import datetime as dt
import json
import random
import ssl
import statistics
import sys
import time
import urllib.parse
import urllib.request

API = "https://api.openalex.org/works"


def ssl_context(insecure=False):
    if insecure:
        return ssl._create_unverified_context()  # noqa: S323 — only for broken CA envs
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:  # noqa: BLE001
        return ssl.create_default_context()


SSL_CTX = ssl.create_default_context()


def build_url(params):
    return API + "?" + urllib.parse.urlencode(params, safe="|:,")


def fetch(params, email, api_key, tries=6):
    params = dict(params)
    if email:
        params["mailto"] = email
    if api_key:
        params["api_key"] = api_key
    url = build_url(params)
    delay = 2.0
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": f"plrd-field-velocity (mailto:{email})"})
            with urllib.request.urlopen(req, timeout=60, context=SSL_CTX) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 500, 502, 504):
                retry = e.headers.get("retryAfter") or e.headers.get("Retry-After")
                # Cap the wait: anonymous search can hand back multi-hour backoffs.
                # Fail fast instead of sleeping for hours; use an API key to lift limits.
                wait = min(float(retry) + 1 if retry else delay, 120.0)
                print(f"  … {e.code}, waiting {wait:.0f}s (attempt {attempt+1})", file=sys.stderr)
                time.sleep(wait)
                delay = min(delay * 2, 60)
                continue
            raise
        except Exception as ex:  # noqa: BLE001
            print(f"  … {ex}, retrying (attempt {attempt+1})", file=sys.stderr)
            time.sleep(delay)
            delay = min(delay * 2, 60)
    raise RuntimeError(f"failed after {tries} attempts: {url}")


def count(filt, email, api_key):
    d = fetch({"filter": filt, "per-page": 1}, email, api_key)
    return d["meta"]["count"]


def resolve_ref_years(ref_ids, email, api_key, batch=50):
    years = {}
    for i in range(0, len(ref_ids), batch):
        chunk = ref_ids[i : i + batch]
        d = fetch(
            {"filter": "openalex_id:" + "|".join(chunk), "select": "id,publication_year", "per-page": batch},
            email,
            api_key,
        )
        for w in d.get("results", []):
            wid = w["id"].split("/")[-1]
            if w.get("publication_year"):
                years[wid] = w["publication_year"]
        time.sleep(0.2)
    return years


def bootstrap_ci(ages, iters=500):
    if len(ages) < 8:
        return (None, None)
    rng = random.Random(42)
    meds = []
    n = len(ages)
    for _ in range(iters):
        sample = [ages[rng.randrange(n)] for _ in range(n)]
        meds.append(statistics.median(sample))
    meds.sort()
    return (round(meds[int(0.025 * iters)], 2), round(meds[int(0.975 * iters)], 2))


def year_row(year, search, all_works, works_per_year, max_refs, email, api_key):
    field_filt = f"title_and_abstract.search:{search},publication_year:{year}"
    field_works = count(field_filt, email, api_key)
    corpus_share = round(field_works / all_works * 1e5, 3) if all_works else 0.0

    # Random sample of works this year, with their references + authors.
    d = fetch(
        {
            "filter": field_filt,
            "sample": min(works_per_year, max(field_works, 1)),
            "seed": 42,
            "per-page": min(works_per_year, 200),
            "select": "id,publication_year,referenced_works",
            "mailto": email,
        },
        email,
        api_key,
    )
    works = d.get("results", [])

    ref_ids = []
    for w in works:
        refs = [r.split("/")[-1] for r in (w.get("referenced_works") or [])]
        ref_ids += refs[:max_refs]
    ref_ids = list(dict.fromkeys(ref_ids))  # dedupe, keep order

    ref_years = resolve_ref_years(ref_ids, email, api_key) if ref_ids else {}
    ages = [year - y for y in ref_years.values() if y and 1900 <= y <= year]
    median = round(statistics.median(ages), 2) if ages else None
    lo, hi = bootstrap_ci(ages) if ages else (None, None)

    return {
        "year": year,
        "field_works": field_works,
        "all_works": all_works,
        "corpus_share_per_100k": corpus_share,
        "idea_vintage_median_years": median,
        "vintage_ci_lo": lo,
        "vintage_ci_hi": hi,
        "n_refs_sampled": len(ages),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--search", required=True, help="frozen query, | = OR")
    ap.add_argument("--from-year", type=int, required=True)
    ap.add_argument("--to-year", type=int, default=dt.date.today().year)
    ap.add_argument("--email", default="")
    ap.add_argument("--api-key", default="")
    ap.add_argument("--works-per-year", type=int, default=120)
    ap.add_argument("--max-refs-per-work", type=int, default=60)
    ap.add_argument("--reliable-cutoff-year", type=int, default=dt.date.today().year - 2)
    ap.add_argument("--insecure", action="store_true", help="skip TLS verification (broken CA bundles only)")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    global SSL_CTX
    SSL_CTX = ssl_context(a.insecure)

    all_works_by_year = {}
    rows = []
    for year in range(a.from_year, a.to_year + 1):
        if year not in all_works_by_year:
            all_works_by_year[year] = count(f"publication_year:{year}", a.email, a.api_key)
        print(f"[{year}] querying…", file=sys.stderr)
        row = year_row(year, a.search, all_works_by_year[year], a.works_per_year, a.max_refs_per_work, a.email, a.api_key)
        # first_time_authors is left blank: a robust population-level count needs
        # per-author first-in-field history (not a constant-size sample), so we do
        # not emit a biased proxy. idea vintage is the wired signal here.
        row["first_time_authors"] = ""
        row["reliable"] = 0 if year >= a.reliable_cutoff_year else 1
        rows.append(row)
        print(
            f"    field_works={row['field_works']} median={row['idea_vintage_median_years']} "
            f"n_refs={row['n_refs_sampled']}",
            file=sys.stderr,
        )

    generated = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    header = (
        "year,field_works,all_works,corpus_share_per_100k,first_time_authors,"
        "idea_vintage_median_years,vintage_ci_lo,vintage_ci_hi,n_refs_sampled,reliable"
    )
    lines = [
        f"# generated: {generated}",
        "# source: OpenAlex (https://openalex.org, CC0)",
        f"# query: {a.search}",
        f"# from_year: {a.from_year}",
        f"# reliable_cutoff_year: {a.reliable_cutoff_year}",
        f"# sample: works_per_year={a.works_per_year}; max_refs_per_work={a.max_refs_per_work}; "
        "cluster=title_and_abstract.search; note=first_time_authors intentionally blank (needs per-author history)",
        header,
    ]

    def cell(v):
        return "" if v is None else str(v)

    for r in rows:
        lines.append(
            ",".join(
                cell(r[k])
                for k in [
                    "year",
                    "field_works",
                    "all_works",
                    "corpus_share_per_100k",
                    "first_time_authors",
                    "idea_vintage_median_years",
                    "vintage_ci_lo",
                    "vintage_ci_hi",
                    "n_refs_sampled",
                    "reliable",
                ]
            )
        )
    with open(a.out, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {a.out} ({len(rows)} rows)", file=sys.stderr)


if __name__ == "__main__":
    main()
