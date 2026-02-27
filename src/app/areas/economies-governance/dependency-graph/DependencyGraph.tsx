'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { forceX, forceY, forceCollide, forceRadial } from 'd3-force'
import { allTooltips, expandedConfigs } from './data'

// --- Color palette adapted to site design language ---
const COLORS = {
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#131316',
  textMuted: '#737680',
  textDim: '#7F818B',
  edgeDefault: '#131316',
  edgeHL: '#131316',
  ip1: '#B07D10',
  ip2: '#7C52C9',
  ip3: '#1982F4',
  ip4: '#2D8A50',
  cross: '#9B4D5E',
  gate: '#C03A2A',
  bn: '#8B6340',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E5E7EB',
  tooltipShadow: 'rgba(0,0,0,0.08)',
  feedback: '#0D9488',
}

// --- Types ---
export type TooltipEntry = {
  title: string
  body: string
  context: string
}

export type BottleneckConfig = {
  id: string
  label: string
}

export type GateConfig = {
  id: string
  label: string
  quarter: string
}

export type StrandConfig = {
  id: string
  label: string
  sub: string
}

export type InterventionConfig = {
  id: string
  label: string
  sub: string
  strands: string[]
}

export type FeedbackLoop = {
  id: string
  from: string   // node id (strand or intervention)
  to: string     // node id (bottleneck, gate, or strand)
  label: string  // short label like 'Evidence compounds'
}

export type IPConfig = {
  id: string
  label: string
  sub: string
  color: string
  num: string
  bottlenecks: BottleneckConfig[]
  gates: GateConfig[]
  strands: StrandConfig[]
  interventions: InterventionConfig[]
  feedbackLoops?: FeedbackLoop[]
}

type LayoutMode = 'force' | 'dag' | 'radial' | 'cluster' | 'spread'

// --- Graph node/link types ---
type NodeType = 'ip' | 'bottleneck' | 'gate' | 'strand' | 'intervention' | 'feedback'

interface GraphNode {
  id: string
  label: string
  sub?: string
  nodeType: NodeType
  color: string
  quarter?: string
  feedbackLabel?: string
  feedbackFrom?: string
  feedbackTo?: string
  ipColor?: string
  // force-graph injects these
  x?: number
  y?: number
  vx?: number
  vy?: number
  [key: string]: any
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  linkType: 'flow' | 'feedback-in' | 'feedback-out'
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// Layer X positions for left-to-right layout
const LAYER_X: Record<NodeType, number> = {
  ip: -500,
  bottleneck: -250,
  gate: 0,
  feedback: 150,
  strand: 300,
  intervention: 500,
}

// Node dimensions per type (width x height)
const NODE_DIMS: Record<NodeType, { w: number; h: number }> = {
  ip: { w: 180, h: 60 },
  bottleneck: { w: 220, h: 48 },
  gate: { w: 200, h: 42 },
  strand: { w: 210, h: 48 },
  intervention: { w: 190, h: 44 },
  feedback: { w: 210, h: 48 },
}

// --- Lazy-load ForceGraph2D (preserves ref forwarding, avoids next/dynamic wrapper) ---
let _ForceGraph2DModule: React.ComponentType<any> | null = null

// --- Helper: wrap text into lines ---
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

// --- Helper: draw rounded rectangle path ---
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}


// Node type display labels
const NODE_TYPE_LABELS: Record<NodeType, string> = {
  ip: 'Inflection Point',
  bottleneck: 'Bottleneck',
  gate: 'Checkpoint',
  strand: 'Program Strand',
  intervention: 'Intervention',
  feedback: 'Reinforcing Loop',
}

// Color for a node type
function nodeColor(node: GraphNode, ipColor: string): string {
  if (node.nodeType === 'ip') return ipColor
  if (node.nodeType === 'bottleneck') return COLORS.bn
  if (node.nodeType === 'gate') return COLORS.gate
  if (node.nodeType === 'intervention') return COLORS.cross
  if (node.nodeType === 'feedback') return COLORS.feedback
  return ipColor // strand
}

// --- Tooltip component ---
function Tooltip({ node, x, y, config }: {
  node: GraphNode
  x: number
  y: number
  config: IPConfig
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!ref.current) return
    const tt = ref.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    // Position relative to viewport
    let nx = x + 14
    let ny = y - tt.height - 14
    if (nx + tt.width > vw - 16) nx = vw - tt.width - 16
    if (nx < 16) nx = 16
    if (ny < 16) ny = y + 28
    if (ny + tt.height > vh - 16) ny = vh - tt.height - 16
    setPos({ x: nx, y: ny })
  }, [x, y])

  // Feedback node tooltip
  if (node.nodeType === 'feedback') {
    const fromLabel = config.strands.find(s => s.id === node.feedbackFrom)?.label
      || config.interventions.find(i => i.id === node.feedbackFrom)?.label
      || node.feedbackFrom
    const toLabel = config.bottlenecks.find(b => b.id === node.feedbackTo)?.label
      || config.gates.find(g => g.id === node.feedbackTo)?.label
      || config.strands.find(s => s.id === node.feedbackTo)?.label
      || node.feedbackTo

    return (
      <div ref={ref} className="dep-graph-tooltip" style={{
        position: 'fixed', left: pos.x, top: pos.y, width: 300, zIndex: 100, pointerEvents: 'none',
        background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBorder}`,
        boxShadow: `0 8px 32px ${COLORS.tooltipShadow}, 0 2px 8px ${COLORS.tooltipShadow}`,
        borderRadius: 8, padding: '16px 18px',
      }}>
        <div style={{ width: 24, height: 2, background: COLORS.feedback, opacity: 0.5, marginBottom: 10, borderRadius: 1 }} />
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: COLORS.feedback, marginBottom: 6 }}>Reinforcing Loop</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, lineHeight: 1.35, marginBottom: 10, fontStyle: 'italic' }}>{node.feedbackLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.textMuted }}>
          <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '2px 6px', color: COLORS.feedback, fontWeight: 500 }}>
            {fromLabel}
          </span>
          <span style={{ color: COLORS.feedback, opacity: 0.5 }}>→</span>
          <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '2px 6px', color: COLORS.feedback, fontWeight: 500 }}>
            Loop
          </span>
          <span style={{ color: COLORS.feedback, opacity: 0.5 }}>→</span>
          <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '2px 6px', color: COLORS.feedback, fontWeight: 500 }}>
            {toLabel}
          </span>
        </div>
      </div>
    )
  }


  // Standard tooltip
  const td = allTooltips[node.id]
  const color = node.nodeType === 'ip' ? config.color
    : node.nodeType === 'bottleneck' ? COLORS.bn
    : node.nodeType === 'gate' ? COLORS.gate
    : node.nodeType === 'intervention' ? COLORS.cross
    : node.nodeType === 'strand' ? config.color
    : config.color
  const typeLabel = NODE_TYPE_LABELS[node.nodeType]

  // If no detailed tooltip data, show a minimal tooltip with type + label
  if (!td) {
    return (
      <div ref={ref} className="dep-graph-tooltip" style={{
        position: 'fixed', left: pos.x, top: pos.y, width: 280, zIndex: 100, pointerEvents: 'none',
        background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBorder}`,
        boxShadow: `0 8px 32px ${COLORS.tooltipShadow}, 0 2px 8px ${COLORS.tooltipShadow}`,
        borderRadius: 8, padding: '14px 16px',
      }}>
        <div style={{ width: 24, height: 2, background: color, opacity: 0.5, marginBottom: 10, borderRadius: 1 }} />
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color, marginBottom: 6, opacity: 0.7 }}>{typeLabel}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{node.label}</div>
        {node.sub && <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.4, marginTop: 4 }}>{node.sub}</div>}
      </div>
    )
  }

  return (
    <div ref={ref} className="dep-graph-tooltip" style={{
      position: 'fixed', left: pos.x, top: pos.y, width: 320, zIndex: 100, pointerEvents: 'none',
      background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBorder}`,
      boxShadow: `0 8px 32px ${COLORS.tooltipShadow}, 0 2px 8px ${COLORS.tooltipShadow}`,
      borderRadius: 8, padding: '18px 20px',
    }}>
      <div style={{ width: 24, height: 2, background: color, opacity: 0.5, marginBottom: 10, borderRadius: 1 }} />
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color, marginBottom: 6, opacity: 0.7 }}>{typeLabel}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, lineHeight: 1.25, marginBottom: 8 }}>{td.title}</div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 12 }}>{td.body}</div>
      <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 5 }}>Context</div>
        <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.45, fontStyle: 'italic' }}>{td.context}</div>
      </div>
    </div>
  )
}


// --- Node detail sidebar ---
function NodeDetailSidebar({ node, config, connectedNodes, onClose }: {
  node: GraphNode
  config: IPConfig
  connectedNodes: GraphNode[]
  onClose: () => void
}) {
  const color = nodeColor(node, config.color)
  const typeLabel = NODE_TYPE_LABELS[node.nodeType]
  const td = allTooltips[node.id]

  // For feedback nodes, resolve from/to labels
  const feedbackFromLabel = node.nodeType === 'feedback'
    ? (config.strands.find(s => s.id === node.feedbackFrom)?.label
      || config.interventions.find(i => i.id === node.feedbackFrom)?.label
      || node.feedbackFrom)
    : null
  const feedbackToLabel = node.nodeType === 'feedback'
    ? (config.bottlenecks.find(b => b.id === node.feedbackTo)?.label
      || config.gates.find(g => g.id === node.feedbackTo)?.label
      || config.strands.find(s => s.id === node.feedbackTo)?.label
      || node.feedbackTo)
    : null

  // Group connected nodes by type
  const grouped = new Map<NodeType, GraphNode[]>()
  connectedNodes.forEach(cn => {
    if (cn.id === node.id) return
    const list = grouped.get(cn.nodeType) || []
    list.push(cn)
    grouped.set(cn.nodeType, list)
  })

  return (
    <div className="dep-sidebar-enter" style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      borderLeft: `1px solid ${COLORS.border}`,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.06)',
      zIndex: 60, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ width: 28, height: 2.5, background: color, opacity: 0.5, marginBottom: 12, borderRadius: 2 }} />
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color, marginBottom: 8, opacity: 0.8 }}>{typeLabel}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>
              {td?.title || node.label}
            </div>
            {node.sub && !td && (
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4, lineHeight: 1.4 }}>{node.sub}</div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 6,
              width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.textMuted, flexShrink: 0, marginTop: 2,
            }}
            aria-label="Close detail panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="3" x2="11" y2="11" /><line x1="11" y1="3" x2="3" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
        {/* Description */}
        {td && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65 }}>{td.body}</div>
          </div>
        )}

        {/* Feedback loop chain */}
        {node.nodeType === 'feedback' && (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: `${COLORS.feedback}08`, borderRadius: 8, border: `1px solid ${COLORS.feedback}20` }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.feedback, marginBottom: 10, opacity: 0.8 }}>Loop Flow</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, lineHeight: 1.35, fontStyle: 'italic', marginBottom: 12 }}>{node.feedbackLabel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.textMuted, flexWrap: 'wrap' }}>
              <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '3px 8px', color: COLORS.feedback, fontWeight: 500 }}>
                {feedbackFromLabel}
              </span>
              <span style={{ color: COLORS.feedback, opacity: 0.5 }}>→</span>
              <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '3px 8px', color: COLORS.feedback, fontWeight: 500 }}>
                Loop
              </span>
              <span style={{ color: COLORS.feedback, opacity: 0.5 }}>→</span>
              <span style={{ background: `${COLORS.feedback}12`, border: `1px solid ${COLORS.feedback}30`, borderRadius: 4, padding: '3px 8px', color: COLORS.feedback, fontWeight: 500 }}>
                {feedbackToLabel}
              </span>
            </div>
          </div>
        )}

        {/* Context */}
        {td?.context && (
          <div style={{ marginBottom: 24, padding: '14px 16px', background: '#F9FAFB', borderRadius: 8, border: `1px solid ${COLORS.borderLight}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 8 }}>Context</div>
            <div style={{ fontSize: 12.5, color: COLORS.textDim, lineHeight: 1.55, fontStyle: 'italic' }}>{td.context}</div>
          </div>
        )}

        {/* Connected nodes */}
        {grouped.size > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 12 }}>Connected Nodes</div>
            {Array.from(grouped.entries()).map(([type, nodes]) => (
              <div key={type} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {NODE_TYPE_LABELS[type]}
                </div>
                {nodes.map(cn => {
                  const cnColor = nodeColor(cn, config.color)
                  return (
                    <div key={cn.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                      borderRadius: 6, marginBottom: 3,
                      background: '#FAFAFA', border: `1px solid ${COLORS.borderLight}`,
                    }}>
                      <div style={{ width: 3, height: 16, borderRadius: 1.5, background: cnColor, opacity: 0.5, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.35, fontWeight: 500, minWidth: 0 }}>
                        {cn.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Stable mode function (avoids re-init on re-render)
const REPLACE_MODE = () => 'replace' as const

// --- IPFigure: force-graph based component ---
export function IPFigure({ config, width: propWidth, height: propHeight }: {
  config: IPConfig
  width?: number
  height?: number
}) {
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: propWidth || 800, height: propHeight || 560 })

  const [userLayout, setUserLayout] = useState<LayoutMode>('radial')
  const [activeLayout, setActiveLayout] = useState<LayoutMode>('force')
  // layoutMode = what the simulation actually uses (activeLayout during bootstrap, userLayout after)
  const layoutMode = activeLayout

  // Lazy-load ForceGraph2D
  const [ForceGraph2D, setForceGraph2D] = useState<React.ComponentType<any> | null>(_ForceGraph2DModule)
  useEffect(() => {
    if (_ForceGraph2DModule) return
    import('react-force-graph-2d').then(mod => {
      _ForceGraph2DModule = mod.default || (mod as any)
      setForceGraph2D(() => _ForceGraph2DModule)
    })
  }, [])

  // Resize observer — track container size for responsive canvas
  useEffect(() => {
    if (propWidth && propHeight) return
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: rect.height || propHeight || 560,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [propWidth, propHeight])

  // Hover state via refs (avoids re-renders / simulation re-heat)
  const hoveredNodeRef = useRef<GraphNode | null>(null)
  const connectedIdsRef = useRef<Set<string>>(new Set())

  // Tooltip state (needs React state for DOM rendering)
  const [tooltipState, setTooltipState] = useState<{ node: GraphNode; x: number; y: number } | null>(null)

  // Selected node state (persistent click selection)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const selectedIdsRef = useRef<Set<string>>(new Set())

  // Build graph data from config
  const graphData: GraphData = useMemo(() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []

    // IP node
    nodes.push({
      id: config.id,
      label: config.label,
      sub: config.sub,
      nodeType: 'ip',
      color: config.color,
      ipColor: config.color,
    })

    // Bottleneck nodes
    config.bottlenecks.forEach(b => {
      nodes.push({ id: b.id, label: b.label, nodeType: 'bottleneck', color: COLORS.bn, ipColor: config.color })
      links.push({ source: config.id, target: b.id, linkType: 'flow' })
    })

    // Gate nodes
    config.gates.forEach(g => {
      nodes.push({ id: g.id, label: g.label, nodeType: 'gate', color: COLORS.gate, quarter: g.quarter, ipColor: config.color })
    })
    // Bottlenecks → gates
    config.bottlenecks.forEach(b => {
      config.gates.forEach(g => {
        links.push({ source: b.id, target: g.id, linkType: 'flow' })
      })
    })

    // Strand nodes
    config.strands.forEach(s => {
      nodes.push({ id: s.id, label: s.label, sub: s.sub, nodeType: 'strand', color: config.color, ipColor: config.color })
    })
    // Last gate → strands
    const lastGate = config.gates[config.gates.length - 1]
    config.strands.forEach(s => {
      links.push({ source: lastGate.id, target: s.id, linkType: 'flow' })
    })

    // Intervention nodes
    config.interventions.forEach(iv => {
      nodes.push({ id: iv.id, label: iv.label, sub: iv.sub, nodeType: 'intervention', color: COLORS.cross, ipColor: config.color })
      iv.strands.forEach(sid => {
        links.push({ source: sid, target: iv.id, linkType: 'flow' })
      })
    })

    // Feedback loop nodes
    ;(config.feedbackLoops ?? []).forEach(fl => {
      nodes.push({
        id: fl.id,
        label: fl.label,
        nodeType: 'feedback',
        color: COLORS.feedback,
        feedbackLabel: fl.label,
        feedbackFrom: fl.from,
        feedbackTo: fl.to,
        ipColor: config.color,
      })
      links.push({ source: fl.from, target: fl.id, linkType: 'feedback-in' })
      links.push({ source: fl.id, target: fl.to, linkType: 'feedback-out' })
    })

    return { nodes, links }
  }, [config])

  // Bootstrap: secretly run force layout for initial positions, then activate user's choice
  const bootstrapped = useRef(false)
  useEffect(() => {
    if (bootstrapped.current || !ForceGraph2D || !graphData.nodes.length) return
    // Poll until graph ref is mounted and simulation is running
    const poll = setInterval(() => {
      const fg = graphRef.current
      if (!fg || typeof fg.d3Force !== 'function') return
      clearInterval(poll)
      bootstrapped.current = true
      // Let force run briefly for good initial positions, then switch
      setTimeout(() => setActiveLayout(userLayout), 120)
    }, 20)
    return () => clearInterval(poll)
  }, [ForceGraph2D, graphData.nodes.length, userLayout])



  // Build connected-ids set for a given node
  const buildConnectedIds = useCallback((nodeId: string): Set<string> => {
    const ids = new Set<string>([nodeId])
    graphData.links.forEach(link => {
      const src = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source as string
      const tgt = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target as string
      if (src === nodeId) ids.add(tgt)
      if (tgt === nodeId) ids.add(src)
    })
    return ids
  }, [graphData])

  // Apply forces based on layout mode
  useEffect(() => {
    const fg = graphRef.current
    if (!fg || typeof fg.d3Force !== 'function') return

    // Clear custom forces from previous mode
    const clearCustomForces = () => {
      fg.d3Force('x', null)
      fg.d3Force('y', null)
      fg.d3Force('radial', null)
      fg.d3Force('collision', null)
    }

    // Clear fixed positions left from DAG mode
    const clearFixedPositions = () => {
      graphData.nodes.forEach((n: any) => { delete n.fx; delete n.fy })
    }

    if (layoutMode === 'dag') {
      // DAG: top-down hierarchy, strong repulsion
      clearCustomForces()
      fg.d3Force('charge')?.strength(-250).distanceMax(500)
      fg.d3Force('link')?.distance(120).strength(0.3)
      fg.d3Force('center')?.strength(0.015)
      fg.d3Force('collision',
        forceCollide<GraphNode>().radius(55).strength(0.8)
      )

    } else if (layoutMode === 'radial') {
      // Radial: concentric rings by dependency depth from IP node
      clearCustomForces()
      clearFixedPositions()

      // BFS from IP node to compute depth
      const depthMap = new Map<string, number>()
      const queue: string[] = [config.id]
      depthMap.set(config.id, 0)
      let qi = 0
      while (qi < queue.length) {
        const id = queue[qi++]
        const d = depthMap.get(id)!
        graphData.links.forEach(link => {
          const src = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source as string
          const tgt = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target as string
          if (src === id && !depthMap.has(tgt)) {
            depthMap.set(tgt, d + 1)
            queue.push(tgt)
          }
        })
      }
      // Store depth on nodes for radial force
      graphData.nodes.forEach((n: any) => { n._depth = depthMap.get(n.id) ?? 0 })

      const ringSpacing = Math.max(200, graphData.nodes.length * 8)

      fg.d3Force('charge')?.strength(-300).distanceMax(800)
      fg.d3Force('link')?.distance(150).strength(0.15)
      fg.d3Force('center')?.strength(0)
      fg.d3Force('radial',
        forceRadial(
          (node: any) => ((node as any)._depth || 0) * ringSpacing,
          0, 0
        ).strength(0.8)
      )
      fg.d3Force('collision',
        forceCollide<GraphNode>().radius(55).strength(0.9)
      )

    } else if (layoutMode === 'cluster') {
      // Cluster: group nodes by nodeType in a circle
      clearCustomForces()
      clearFixedPositions()

      const types: NodeType[] = ['ip', 'bottleneck', 'gate', 'feedback', 'strand', 'intervention']
      const radius = Math.max(400, graphData.nodes.length * 12)
      const typeCenters = new Map<NodeType, { x: number; y: number }>()
      types.forEach((t, i) => {
        const angle = (2 * Math.PI * i) / types.length - Math.PI / 2
        typeCenters.set(t, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
      })

      fg.d3Force('charge')?.strength(-200).distanceMax(600)
      fg.d3Force('link')?.distance(100).strength(0.15)
      fg.d3Force('center')?.strength(0)
      fg.d3Force('x',
        forceX<GraphNode>().x((n: GraphNode) => typeCenters.get(n.nodeType)?.x || 0).strength(0.5)
      )
      fg.d3Force('y',
        forceY<GraphNode>().y((n: GraphNode) => typeCenters.get(n.nodeType)?.y || 0).strength(0.5)
      )
      fg.d3Force('collision',
        forceCollide<GraphNode>().radius(55).strength(0.9)
      )

    } else if (layoutMode === 'spread') {
      // Spread: like force but maximally spaced, keep left-to-right layering
      clearCustomForces()
      clearFixedPositions()

      fg.d3Force('charge')?.strength(-400).distanceMax(600)
      fg.d3Force('link')?.distance(200).strength(0.3)
      fg.d3Force('center')?.strength(0.01)
      fg.d3Force('x',
        forceX<GraphNode>().x((n: GraphNode) => LAYER_X[n.nodeType] ?? 0).strength(0.4)
      )
      fg.d3Force('y',
        forceY<GraphNode>().y(0).strength(0.01)
      )
      fg.d3Force('collision',
        forceCollide<GraphNode>().radius(60).strength(0.9)
      )

    } else {
      // Force (default): full physics with left-to-right layer hints
      clearCustomForces()
      clearFixedPositions()

      fg.d3Force('charge')?.strength(-200).distanceMax(400)
      fg.d3Force('link')?.distance(100).strength(0.6)
      fg.d3Force('center')?.strength(0.03)
      fg.d3Force('x',
        forceX<GraphNode>().x((n: GraphNode) => LAYER_X[n.nodeType] ?? 0).strength(0.8)
      )
      fg.d3Force('y',
        forceY<GraphNode>().y(0).strength(0.02)
      )
      fg.d3Force('collision',
        forceCollide<GraphNode>().radius(55).strength(0.7)
      )
    }

    if (typeof fg.d3AlphaDecay === 'function') {
      fg.d3AlphaDecay(0.02)
      fg.d3VelocityDecay(0.3)
    }
    if (typeof fg.d3ReheatSimulation === 'function') {
      fg.d3ReheatSimulation()
    }

    // Auto zoom-to-fit after layout settles
    const timer = setTimeout(() => {
      if (graphRef.current) graphRef.current.zoomToFit(400, 60)
    }, 800)

    return () => clearTimeout(timer)
  }, [layoutMode, graphData, config.id])

  // paintNode: fully custom canvas rendering
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode
    const { w, h } = NODE_DIMS[n.nodeType]
    const x = n.x! - w / 2
    const y = n.y! - h / 2
    const r = n.nodeType === 'ip' ? 6 : n.nodeType === 'intervention' ? 5 : 4

    const isHovered = hoveredNodeRef.current?.id === n.id
    const isSelected = selectedIdsRef.current.has(n.id)
    const hasHoverHL = connectedIdsRef.current.size > 0
    const hasSelectHL = selectedIdsRef.current.size > 0
    const hasHighlight = hasHoverHL || hasSelectHL
    const isConnected = (hasHoverHL && connectedIdsRef.current.has(n.id)) || (hasSelectHL && selectedIdsRef.current.has(n.id))
    const alpha = hasHighlight ? (isConnected ? 1 : 0.12) : 1

    ctx.save()
    ctx.globalAlpha = alpha

    // Glow on hover or selection
    if (isHovered || isSelected) {
      ctx.shadowColor = n.color
      ctx.shadowBlur = isSelected ? 16 : 12
    }

    // Background fill
    let bgColor = '#FFFFFF'
    if (n.nodeType === 'bottleneck') bgColor = '#FDF8F0'
    else if (n.nodeType === 'feedback') bgColor = '#F0FDFA'

    roundRect(ctx, x, y, w, h, r)
    ctx.fillStyle = bgColor
    ctx.fill()

    // Border
    ctx.shadowBlur = 0
    const isDashed = n.nodeType === 'bottleneck' || n.nodeType === 'gate' || n.nodeType === 'feedback'
    if (isDashed) {
      ctx.setLineDash(n.nodeType === 'bottleneck' ? [3, 3] : [5, 4])
    }
    let borderColor = COLORS.border
    if (n.nodeType === 'bottleneck') borderColor = `${COLORS.bn}30`
    else if (n.nodeType === 'gate') borderColor = `${COLORS.gate}28`
    else if (n.nodeType === 'feedback') borderColor = `${COLORS.feedback}40`
    roundRect(ctx, x, y, w, h, r)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 0.8 / globalScale
    ctx.stroke()
    ctx.setLineDash([])

    // Left accent bar
    if (n.nodeType === 'ip') {
      roundRect(ctx, x, y, 3.5, h, 1.75)
      ctx.fillStyle = n.color
      ctx.globalAlpha = alpha * 0.6
      ctx.fill()
      ctx.globalAlpha = alpha
    } else if (n.nodeType === 'feedback') {
      roundRect(ctx, x, y, 3, h, 1.5)
      ctx.fillStyle = COLORS.feedback
      ctx.globalAlpha = alpha * 0.6
      ctx.fill()
      ctx.globalAlpha = alpha
    } else if (n.nodeType === 'strand') {
      roundRect(ctx, x, y, 3, h, 1.5)
      ctx.fillStyle = n.color
      ctx.globalAlpha = alpha * 0.5
      ctx.fill()
      ctx.globalAlpha = alpha
    }

    // Small circle indicator for interventions
    if (n.nodeType === 'intervention') {
      ctx.beginPath()
      ctx.arc(x + 13, n.y!, 3, 0, Math.PI * 2)
      ctx.fillStyle = COLORS.cross
      ctx.globalAlpha = alpha * 0.2
      ctx.fill()
      ctx.strokeStyle = COLORS.cross
      ctx.lineWidth = 0.8 / globalScale
      ctx.globalAlpha = alpha * 0.6
      ctx.stroke()
      ctx.globalAlpha = alpha
    }

    // Gate chevron icon
    if (n.nodeType === 'gate') {
      ctx.beginPath()
      ctx.moveTo(x + 11, n.y! - 4)
      ctx.lineTo(x + 17, n.y!)
      ctx.lineTo(x + 11, n.y! + 4)
      ctx.strokeStyle = COLORS.gate
      ctx.lineWidth = 1.2 / globalScale
      ctx.globalAlpha = alpha * 0.45
      ctx.stroke()
      ctx.globalAlpha = alpha
    }

    // Bottleneck lines icon
    if (n.nodeType === 'bottleneck') {
      ctx.globalAlpha = alpha * 0.35
      ctx.strokeStyle = COLORS.bn
      ctx.lineWidth = 1 / globalScale
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(x + 10, n.y! + i * 4)
        ctx.lineTo(x + 18, n.y! + i * 4)
        ctx.stroke()
      }
      ctx.globalAlpha = alpha
    }


    // Text rendering — clip to box boundaries
    ctx.save()
    roundRect(ctx, x, y, w, h, r)
    ctx.clip()

    const leftPad = n.nodeType === 'gate' ? 26
      : n.nodeType === 'bottleneck' ? 24
      : n.nodeType === 'intervention' ? 24
      : n.nodeType === 'ip' ? 14
      : n.nodeType === 'feedback' ? 12
      : 12
    const rightPad = 8
    const textX = x + leftPad
    const textMaxW = w - leftPad - rightPad

    // Use FIXED font sizes in graph coordinates (don't scale with zoom)
    const labelSize = n.nodeType === 'ip' ? 12
      : n.nodeType === 'bottleneck' ? 9
      : n.nodeType === 'gate' ? 9.5
      : n.nodeType === 'feedback' ? 9
      : 10.5

    const labelColor = n.nodeType === 'bottleneck' ? COLORS.bn
      : n.nodeType === 'gate' ? COLORS.gate
      : n.nodeType === 'ip' ? n.color
      : n.nodeType === 'intervention' ? COLORS.cross
      : n.nodeType === 'feedback' ? COLORS.feedback
      : COLORS.text

    const fontWeight = n.nodeType === 'ip' ? 600 : n.nodeType === 'bottleneck' ? 500 : n.nodeType === 'gate' ? 500 : 600
    ctx.font = `${fontWeight} ${labelSize}px 'Inter', system-ui, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = labelColor
    ctx.globalAlpha = alpha

    const maxLines = n.nodeType === 'bottleneck' ? 3 : n.nodeType === 'feedback' ? 3 : 2
    const lines = wrapText(ctx, n.label, textMaxW)
    const clippedLines = lines.slice(0, maxLines)
    const lineH = labelSize * 1.35
    const hasSub = !!(n.sub && n.nodeType !== 'bottleneck' && n.nodeType !== 'feedback')
    const subSize = n.nodeType === 'ip' ? 9 : 8.5
    const totalTextH = clippedLines.length * lineH + (hasSub ? subSize * 1.3 + 2 : 0)
    let textY = n.y! - totalTextH / 2 + lineH / 2

    clippedLines.forEach((line, i) => {
      if (i === maxLines - 1 && lines.length > maxLines) {
        let truncated = line
        while (ctx.measureText(truncated + '…').width > textMaxW && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        ctx.fillText(truncated + '…', textX, textY)
      } else {
        ctx.fillText(line, textX, textY)
      }
      textY += lineH
    })

    // Sub-label
    if (hasSub && n.sub) {
      ctx.font = `400 ${subSize}px 'Inter', system-ui, sans-serif`
      ctx.fillStyle = COLORS.textMuted
      ctx.globalAlpha = alpha * 0.85
      const subLines = wrapText(ctx, n.sub, textMaxW).slice(0, 2)
      subLines.forEach(line => {
        ctx.fillText(line, textX, textY)
        textY += subSize * 1.3
      })
    }

    ctx.restore() // restore clipping

    ctx.restore()
  }, [])

  // paintLink: bezier curves with arrowheads for feedback-out
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source as GraphNode
    const target = link.target as GraphNode
    if (!source.x || !target.x) return

    const isFeedback = link.linkType === 'feedback-in' || link.linkType === 'feedback-out'

    // Determine edge alpha based on hover/selection state
    const hasHoverHL = connectedIdsRef.current.size > 0
    const hasSelectHL = selectedIdsRef.current.size > 0
    const hasHighlight = hasHoverHL || hasSelectHL
    const srcId = source.id
    const tgtId = target.id
    const isHoverConn = hasHoverHL && connectedIdsRef.current.has(srcId) && connectedIdsRef.current.has(tgtId)
    const isSelectConn = hasSelectHL && selectedIdsRef.current.has(srcId) && selectedIdsRef.current.has(tgtId)
    const isConnected = isHoverConn || isSelectConn

    const edgeAlpha = hasHighlight
      ? (isConnected ? (isFeedback ? 0.55 : 0.45) : 0.03)
      : (isFeedback ? 0.25 : 0.1)

    ctx.save()
    ctx.globalAlpha = edgeAlpha
    ctx.beginPath()
    ctx.moveTo(source.x!, source.y!)

    const midX = (source.x! + target.x!) / 2
    ctx.bezierCurveTo(midX, source.y!, midX, target.y!, target.x!, target.y!)

    ctx.strokeStyle = isFeedback ? COLORS.feedback : COLORS.edgeDefault
    ctx.lineWidth = isFeedback ? 0.8 / globalScale : 0.5 / globalScale

    if (isFeedback) {
      ctx.setLineDash([4, 3])
    }

    ctx.stroke()
    ctx.setLineDash([])

    // Arrowhead for feedback-out
    if (link.linkType === 'feedback-out') {
      const tx = target.x!
      const ty = target.y!
      // Approximate tangent at end of bezier
      const t = 0.98
      const bx = (1 - t) * (1 - t) * (1 - t) * source.x!
        + 3 * (1 - t) * (1 - t) * t * midX
        + 3 * (1 - t) * t * t * midX
        + t * t * t * tx
      const by = (1 - t) * (1 - t) * (1 - t) * source.y!
        + 3 * (1 - t) * (1 - t) * t * source.y!
        + 3 * (1 - t) * t * t * target.y!
        + t * t * t * ty
      const angle = Math.atan2(ty - by, tx - bx)
      const arrowLen = 6 / globalScale
      ctx.globalAlpha = edgeAlpha
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(tx - arrowLen * Math.cos(angle - 0.4), ty - arrowLen * Math.sin(angle - 0.4))
      ctx.lineTo(tx - arrowLen * Math.cos(angle + 0.4), ty - arrowLen * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fillStyle = COLORS.feedback
      ctx.fill()
    }

    ctx.restore()
  }, [])

  // Paint invisible hit area matching the node box dimensions
  const paintNodeArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode
    const { w, h } = NODE_DIMS[n.nodeType]
    const x = n.x! - w / 2
    const y = n.y! - h / 2
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  }, [])

  // Node hover handler
  const handleNodeHover = useCallback((node: any, prevNode: any) => {
    if (!node) {
      hoveredNodeRef.current = null
      connectedIdsRef.current = new Set()
      setTooltipState(null)
      // Force repaint to clear edge highlights
      if (graphRef.current?.refresh) graphRef.current.refresh()
      return
    }
    const gn = node as GraphNode
    hoveredNodeRef.current = gn
    connectedIdsRef.current = buildConnectedIds(gn.id)

    // Get screen position for tooltip
    if (graphRef.current) {
      const screenPos = graphRef.current.graph2ScreenCoords(gn.x ?? 0, gn.y ?? 0)
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        setTooltipState({
          node: gn,
          x: rect.left + screenPos.x,
          y: rect.top + screenPos.y,
        })
      }
      // Force repaint to show edge highlights
      if (graphRef.current.refresh) graphRef.current.refresh()
    }
  }, [buildConnectedIds])

  // Node click handler — persistent selection + sidebar
  const handleNodeClick = useCallback((node: any) => {
    const gn = node as GraphNode
    // Toggle: clicking same node deselects
    if (selectedNode?.id === gn.id) {
      setSelectedNode(null)
      selectedIdsRef.current = new Set()
    } else {
      setSelectedNode(gn)
      selectedIdsRef.current = buildConnectedIds(gn.id)
    }
    if (graphRef.current?.refresh) graphRef.current.refresh()
  }, [selectedNode, buildConnectedIds])

  // Deselect on background click
  const handleBackgroundClick = useCallback(() => {
    hoveredNodeRef.current = null
    connectedIdsRef.current = new Set()
    setTooltipState(null)
    setSelectedNode(null)
    selectedIdsRef.current = new Set()
    if (graphRef.current?.refresh) graphRef.current.refresh()
  }, [])

  // Get connected nodes for sidebar
  const selectedConnectedNodes = useMemo(() => {
    if (!selectedNode) return []
    const ids = buildConnectedIds(selectedNode.id)
    return graphData.nodes.filter(n => ids.has(n.id))
  }, [selectedNode, graphData, buildConnectedIds])

  const hasFeedback = !!(config.feedbackLoops && config.feedbackLoops.length > 0)

  const isFullPage = !propHeight

  return (
    <div style={isFullPage ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } : { marginBottom: 48 }}>
      <style>{`
        .dep-graph-tooltip {
          animation: depGraphTtFade 0.2s ease;
        }
        @keyframes depGraphTtFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dep-sidebar-enter {
          animation: depSidebarSlide 0.25s ease;
        }
        @keyframes depSidebarSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {/* IP header — hidden when used full-page (parent provides header) */}
      {!isFullPage && (
        <div className="flex items-baseline gap-3.5 mb-3.5">
          <span style={{
            fontSize: 44, fontWeight: 700,
            color: config.color, opacity: 0.15, lineHeight: 1, letterSpacing: -2,
          }}>{config.num}</span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.text, lineHeight: 1.15 }}>
              {config.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1" style={{ fontWeight: 300 }}>
              {config.sub}
            </p>
          </div>
        </div>
      )}

      {/* Graph area */}
      <div style={{
        width: '100%',
        position: 'relative',
        ...(isFullPage
          ? { flex: 1, minHeight: 0 }
          : { height: propHeight || 560 }),
      }}>
        {/* Canvas container */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: COLORS.surface,
            border: isFullPage ? 'none' : `1px solid ${COLORS.border}`,
            borderRadius: isFullPage ? 0 : 8,
            overflow: 'hidden',
          }}
        >
          {ForceGraph2D ? (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              // Node rendering
              nodeCanvasObject={paintNode}
              nodeCanvasObjectMode={REPLACE_MODE}
              nodePointerAreaPaint={paintNodeArea}
              // Link rendering
              linkCanvasObject={paintLink}
              linkCanvasObjectMode={REPLACE_MODE}
              // Forces
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              cooldownTicks={300}
              warmupTicks={50}
              // Interactions
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}
              // DAG mode
              dagMode={layoutMode === 'dag' ? 'lr' : undefined}
              dagLevelDistance={150}
              onDagError={() => {}}
              // Background
              backgroundColor="transparent"
              autoPauseRedraw={false}
            />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: COLORS.textMuted, fontSize: 13,
            }}>
              Loading graph…
            </div>
          )}

          {/* Layout toolbar — top-left inside canvas */}
          <div style={{
            position: 'absolute', top: 64, left: 12, zIndex: 50, pointerEvents: 'auto',
            display: 'flex', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            borderRadius: 8, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {([
              { mode: 'radial' as LayoutMode, label: 'Radial', icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
                  <circle cx="8" cy="8" r="5" fill="none" strokeOpacity="0.5" />
                  <circle cx="8" cy="8" r="7.5" fill="none" strokeOpacity="0.3" />
                </svg>
              )},
              { mode: 'force' as LayoutMode, label: 'Force', icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="4" cy="4" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="13" cy="11" r="1.5" fill="currentColor" stroke="none" />
                  <line x1="4" y1="4" x2="8" y2="8" strokeOpacity="0.5" />
                  <line x1="12" y1="3" x2="8" y2="8" strokeOpacity="0.5" />
                  <line x1="3" y1="12" x2="8" y2="8" strokeOpacity="0.5" />
                  <line x1="13" y1="11" x2="8" y2="8" strokeOpacity="0.5" />
                </svg>
              )},
              { mode: 'dag' as LayoutMode, label: 'DAG', icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="2.5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="4" cy="8" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="2" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="6" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
                  <line x1="8" y1="4" x2="4" y2="6.5" strokeOpacity="0.5" />
                  <line x1="8" y1="4" x2="12" y2="6.5" strokeOpacity="0.5" />
                  <line x1="4" y1="9.5" x2="2" y2="12" strokeOpacity="0.5" />
                  <line x1="4" y1="9.5" x2="6" y2="12" strokeOpacity="0.5" />
                  <line x1="12" y1="9.5" x2="12" y2="12" strokeOpacity="0.5" />
                </svg>
              )},
              { mode: 'cluster' as LayoutMode, label: 'Cluster', icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="3.5" cy="4" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="3" cy="7" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="11" cy="10" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="13.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="11" cy="13" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              )},
              { mode: 'spread' as LayoutMode, label: 'Spread', icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="2" cy="2" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="3" cy="14" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="13" cy="13" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              )},
            ]).map((item, i) => (
              <React.Fragment key={item.mode}>
                {i > 0 && <div style={{ width: 1, background: COLORS.border }} />}
                <button
                  onClick={() => { setUserLayout(item.mode); setActiveLayout(item.mode) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    background: userLayout === item.mode ? config.color : 'transparent',
                    color: userLayout === item.mode ? '#FFFFFF' : COLORS.textMuted,
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Header overlay — full-page mode only */}
          {isFullPage && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 50, pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
              borderRadius: 8, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: '8px 16px',
            }}>
              <Link
                href="/areas/economies-governance/dependency-graph"
                style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                aria-label="Back to all graphs"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div style={{ width: 1, height: 20, background: COLORS.border, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: config.color, opacity: 0.45, fontVariantNumeric: 'tabular-nums' }}>{config.num}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {config.label}
                </div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.2, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {config.sub}
                </div>
              </div>
            </div>
          )}

          {/* Tooltip - floats above canvas */}
          {tooltipState && !selectedNode && (
            <Tooltip
              node={tooltipState.node}
              x={tooltipState.x}
              y={tooltipState.y}
              config={config}
            />
          )}

          {/* Detail sidebar */}
          {selectedNode && (
            <NodeDetailSidebar
              node={selectedNode}
              config={config}
              connectedNodes={selectedConnectedNodes}
              onClose={handleBackgroundClick}
            />
          )}
        </div>
      </div>

      {/* Legend — hidden in full-page mode */}
      <div className="flex items-center gap-5 mt-2.5 justify-end flex-wrap" style={{ width: '100%', display: isFullPage ? 'none' : undefined }}>
        {[
          { color: config.color, label: config.label, dash: false },
          { color: COLORS.bn, label: 'Bottleneck', dash: true },
          { color: COLORS.gate, label: 'Go/No-Go', dash: true },
          { color: COLORS.cross, label: 'Cross-cutting', dash: false },
          ...(hasFeedback ? [{ color: COLORS.feedback, label: 'Feedback loop', dash: true }] : []),
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div style={{
              width: 16, height: l.dash ? 0 : 1.5, background: l.dash ? 'none' : l.color, opacity: 0.5,
              borderTop: l.dash ? `1.5px dashed ${l.color}` : 'none',
            }} />
            <span className="text-[10px] text-gray-500">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <svg width={36} height={8} style={{ opacity: 0.2 }}>
            <line x1={0} y1={4} x2={28} y2={4} stroke={COLORS.edgeDefault} strokeWidth={1} />
            <polygon points="28,1 34,4 28,7" fill={COLORS.edgeDefault} />
          </svg>
          <span className="text-[10px] text-gray-500 italic">read left to right</span>
        </div>
      </div>
    </div>
  )
}

// --- Main exported component ---
export default function DependencyGraph() {
  return (
    <div>
      <style>{`
        .dep-graph-tooltip {
          animation: depGraphTtFade 0.2s ease;
        }
        @keyframes depGraphTtFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="space-y-2">
        {(Object.values(expandedConfigs) as IPConfig[]).map((config) => (
          <IPFigure key={config.id} config={config} />
        ))}
      </div>
    </div>
  )
}
