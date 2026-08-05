"use client"

// Project-page detail for a hypercert, ported from researchretreat.org:
// a photo hero (shared-layout morph from the card), claim meta, funding
// economics, and an evidence timeline that merges the retreat's own
// curated entries with live community evidence pulled from the ATProto
// network via Constellation. Restyled to the plrd.org design system.

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { EvidenceEntry, EvidenceKind, Hypercert } from "@/data/hypercerts"
import {
  Avatar,
  CommentsSection,
  authorLabel,
  profileLinkActor,
  useActorProfiles,
  useLiveActivity,
} from "@/components/hypercerts/HypercertCommunity"
import type { LiveEvidence } from "@/lib/hypercerts-live"
import { ProgressiveBlur } from "@/components/hypercerts/HypercertCard"

const KIND_LABEL: Record<EvidenceKind, string> = {
  milestone: "Milestone",
  session: "Working session",
  publication: "Publication",
  artifact: "Artifact",
  release: "Release",
}

const KIND_GLYPH: Record<EvidenceKind, string> = {
  milestone: "◆",
  session: "▚",
  publication: "❑",
  artifact: "◈",
  release: "⤴",
}

function kindLabel(kind: string): string {
  return KIND_LABEL[kind as EvidenceKind] ?? kind
}

function kindGlyph(kind: string): string {
  return KIND_GLYPH[kind as EvidenceKind] ?? "◈"
}

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12 + i * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

const eyebrow = "text-[10px] font-semibold uppercase tracking-[0.16em]"

function EvidenceRow({ entry, index }: { entry: EvidenceEntry; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <motion.article
      custom={index + 2}
      variants={fade}
      initial="hidden"
      animate="show"
      className="relative border-l border-gray-200 pl-6"
    >
      <span
        aria-hidden
        className="absolute -left-[6.5px] top-1 grid h-3 w-3 place-items-center rounded-full bg-blue text-[7px] text-white"
      >
        {kindGlyph(entry.kind)}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="block w-full cursor-pointer pb-6 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${eyebrow} text-blue`}>{kindLabel(entry.kind)}</span>
          {entry.badge && (
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue">
              {entry.badge}
            </span>
          )}
          <span className={`${eyebrow} text-gray-500`}>{entry.dateLabel}</span>
        </div>
        <h4 className="mt-1.5 font-serif text-[18px] leading-snug tracking-tight text-black">
          {entry.title}
        </h4>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-gray-600">
            {entry.description}
          </p>
        </motion.div>
      </button>
    </motion.article>
  )
}

function LiveEvidenceRow({ entry }: { entry: LiveEvidence }) {
  const [open, setOpen] = useState(false)
  const date = new Date(entry.createdAt)
  const dateLabel = Number.isNaN(date.getTime())
    ? entry.createdAt
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

  // Profile links render as contributor avatar chips; the rest stay
  // plain links.
  const contributorActors = entry.links
    .map(profileLinkActor)
    .filter((a): a is string => a !== null)
  const plainLinks = entry.links.filter((l) => profileLinkActor(l) === null)
  const contributorProfiles = useActorProfiles(contributorActors)

  return (
    <article className="relative border-l border-gray-200 pl-6">
      <span
        aria-hidden
        className="absolute -left-[6.5px] top-1 grid h-3 w-3 place-items-center rounded-full border border-blue bg-white text-[7px] text-blue"
      >
        {kindGlyph(entry.kind)}
      </span>

      <div className="pb-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="block w-full cursor-pointer text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${eyebrow} text-blue`}>{kindLabel(entry.kind)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 py-0.5 pl-1 pr-2 text-[10px] font-semibold tracking-wide text-blue">
              <Avatar author={entry.author} size={16} />
              community · {authorLabel(entry.author)}
            </span>
            <span className={`${eyebrow} text-gray-500`}>{dateLabel}</span>
          </div>
          <h4 className="mt-1.5 font-serif text-[18px] leading-snug tracking-tight text-black">
            {entry.title}
          </h4>
        </button>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          {entry.description && (
            <p className="mt-2 max-w-xl whitespace-pre-wrap text-[14px] leading-relaxed text-gray-600">
              {entry.description}
            </p>
          )}
          {contributorActors.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {contributorActors.map((actor) => {
                const p = contributorProfiles.get(actor)
                const label = p?.displayName || p?.handle || actor
                return (
                  <a
                    key={actor}
                    href={`https://bsky.app/profile/${actor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 py-1 pl-1 pr-2.5 text-[12px] text-black transition hover:border-blue/40"
                  >
                    <Avatar
                      author={{
                        did: p?.did ?? actor,
                        handle: p?.handle ?? actor,
                        displayName: p?.displayName ?? null,
                        avatar: p?.avatar ?? null,
                      }}
                      size={20}
                    />
                    {label}
                  </a>
                )
              })}
            </div>
          )}
          {plainLinks.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {plainLinks.map((l) => (
                <a
                  key={l}
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[12px] text-blue hover:underline"
                >
                  {l} ↗
                </a>
              ))}
            </div>
          )}
          <div className="mt-2">
            <a
              href={`https://pdsls.dev/${entry.uri}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${eyebrow} text-gray-400 transition hover:text-blue`}
            >
              View ATProto record ↗
            </a>
          </div>
        </motion.div>
      </div>
    </article>
  )
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={`${eyebrow} text-gray-500`}>{label}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-black">{children}</p>
    </div>
  )
}

type TimelineItem =
  | { date: string; type: "static"; entry: EvidenceEntry }
  | { date: string; type: "live"; entry: LiveEvidence }

export function HypercertDetail({
  cert,
  onClose,
}: {
  cert: Hypercert
  onClose: () => void
}) {
  const { data: activity, loading } = useLiveActivity(cert)

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const timeline: TimelineItem[] = [
    ...cert.evidence.map((entry) => ({
      date: entry.date,
      type: "static" as const,
      entry,
    })),
    ...activity.evidence.map((entry) => ({
      date: entry.createdAt.slice(0, 10),
      type: "live" as const,
      entry,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-y-auto bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-6 lg:px-10">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15 } }}
          exit={{ opacity: 0 }}
          className="mb-5 flex flex-wrap items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={onClose}
            className={`${eyebrow} inline-flex cursor-pointer items-center gap-2 text-gray-600 transition hover:text-blue`}
          >
            <span aria-hidden>←</span> Back to hypercerts
          </button>
          {cert.claim && (
            <a
              href={`https://pdsls.dev/${cert.claim.uri}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${eyebrow} text-gray-400 transition hover:text-blue`}
            >
              View claim record ↗
            </a>
          )}
        </motion.div>

        {/* Hero (shared-layout morph from the card photo) */}
        <motion.div
          layoutId={`cert-media-${cert.rkey}`}
          className="hypercert-on-photo relative overflow-hidden"
          style={{ borderRadius: 26, aspectRatio: "16 / 9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.image}
            alt={cert.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Progressive blur — same treatment as the card, so the
              shared-layout morph feels continuous. */}
          <ProgressiveBlur
            variant="hero"
            tint="linear-gradient(to bottom, transparent 0%, rgba(19,19,22,0.12) 45%, rgba(19,19,22,0.38) 78%, rgba(19,19,22,0.55) 100%)"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
                <span
                  aria-hidden
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#1982F4" }}
                />
                Hypercert · {cert.dateLabel}
              </span>
              {cert.status === "upcoming" && (
                <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
                  In planning
                </span>
              )}
            </div>
            <h1 className="mt-3 max-w-2xl font-serif text-[clamp(24px,3.4vw,40px)] leading-[1.06] tracking-tight text-white">
              {cert.title}
            </h1>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {cert.location}
            </p>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div>
            <p className="text-[15.5px] leading-relaxed text-gray-600">
              {cert.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[...cert.workScope, ...cert.impactScope].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-blue"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 border-t border-gray-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <Meta label="Record">
              <span className="break-all font-mono text-[11px]">{cert.collection}</span>
            </Meta>
            <Meta label="Timeframe">
              <span className="font-mono text-[12px]">
                {cert.startDate} → {cert.endDate}
              </span>
            </Meta>
            <Meta label="Rights">{cert.rights}</Meta>
            <Meta label="Retreat">
              <a
                href={cert.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue hover:underline"
              >
                See event →
              </a>
            </Meta>
            <div className="col-span-2">
              <Meta label="Contributors">
                <span className="text-gray-600">
                  {cert.contributors.map((c) => c.name).join(" · ")}
                </span>
              </Meta>
            </div>
          </div>
        </motion.div>

        {/* Funding economics */}
        {cert.funding && (
          <motion.div
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-10 rounded-2xl border border-gray-200 bg-gray-100 p-6 lg:p-8"
          >
            <p className={`${eyebrow} text-blue`}>Return on impact</p>
            <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="font-serif text-[clamp(34px,4.5vw,52px)] leading-none tracking-tight text-black">
                  {cert.funding.roiLabel}
                </p>
                <p className={`${eyebrow} mt-1.5 text-gray-500`}>RoI to date</p>
              </div>
              <div>
                <p className="font-serif text-[clamp(34px,4.5vw,52px)] leading-none tracking-tight text-black">
                  {cert.funding.costLabel}
                </p>
                <p className={`${eyebrow} mt-1.5 text-gray-500`}>USD invested</p>
              </div>
              <p className="max-w-md flex-1 basis-64 text-[13.5px] leading-relaxed text-gray-600">
                {cert.funding.roiNote}
              </p>
            </div>
          </motion.div>
        )}

        {/* Evidence timeline */}
        <motion.div
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-14"
        >
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[clamp(20px,2.4vw,30px)] leading-tight tracking-tight text-black">
              Evidence <span className="italic text-blue">timeline</span>
            </h2>
            <span className={`${eyebrow} text-gray-500`}>
              {timeline.length} entries
              {loading ? " · syncing…" : ""}
            </span>
          </div>
          <div className="flex flex-col">
            {timeline.map((item, i) =>
              item.type === "static" ? (
                <EvidenceRow
                  key={`s-${item.entry.date}-${item.entry.title}`}
                  entry={item.entry}
                  index={i}
                />
              ) : (
                <LiveEvidenceRow key={item.entry.uri} entry={item.entry} />
              ),
            )}
          </div>

          {/* Provenance: what on this timeline is an actual ATProto record */}
          <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-gray-400">
            The{" "}
            <code className="text-[0.9em]">org.hypercerts.claim.activity</code>{" "}
            record for this retreat is published on the ATProto network
            {cert.published ? " and served from the hypercerts indexer" : ""}.
            Entries labeled{" "}
            <span className="text-[0.9em] font-semibold uppercase tracking-wide text-blue">
              community
            </span>{" "}
            are{" "}
            <code className="text-[0.9em]">org.hypercerts.context.attachment</code>{" "}
            records living on their authors&apos; own PDSs, discovered through
            the Constellation backlink index. Curated entries come from the
            retreat organizers.
          </p>
        </motion.div>

        {/* Comments */}
        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-14 border-t border-gray-200 pt-10"
        >
          <CommentsSection cert={cert} activity={activity} loading={loading} />
        </motion.div>
      </div>
    </motion.div>
  )
}
