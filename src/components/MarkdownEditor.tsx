'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  disabled?: boolean
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown...',
  minRows = 12,
  disabled = false,
}: Props) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`text-sm transition-colors ${!showPreview ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`text-sm transition-colors ${showPreview ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Preview
          </button>
        </div>
        <span className="text-xs text-gray-400">Markdown supported</span>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="p-4 min-h-[300px]">
          {value.trim() ? (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(value) }} />
          ) : (
            <p className="text-gray-400 text-sm italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          disabled={disabled}
          className="w-full p-4 text-sm font-mono text-gray-700 bg-transparent border-none resize-y focus:outline-none"
          style={{ minHeight: `${minRows * 1.5}rem` }}
        />
      )}

      {/* Help text */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-400 font-mono">
          **bold** · *italic* · [link](url) · `code` · # heading
        </span>
      </div>
    </div>
  )
}

/**
 * Very basic markdown-to-HTML for preview (no dependencies).
 * Handles headers, bold, italic, links, code, paragraphs.
 */
function simpleMarkdown(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      block = block.trim()
      if (!block) return ''

      // Headers
      if (block.startsWith('### ')) return `<h3>${inline(block.slice(4))}</h3>`
      if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`
      if (block.startsWith('# ')) return `<h1>${inline(block.slice(2))}</h1>`

      // Code blocks
      if (block.startsWith('```')) {
        const code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
        return `<pre><code>${escapeHtml(code)}</code></pre>`
      }

      return `<p>${inline(block)}</p>`
    })
    .join('')
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br/>')
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
