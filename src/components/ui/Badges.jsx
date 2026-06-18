import React from 'react'
import { calcChangePercent } from '../../utils/helpers'

export function PriceChange({ current, previous, showIcon = true }) {
  const pct = calcChangePercent(current, previous)
  const isUp = pct >= 0
  const cls = isUp ? 'price-up' : 'price-down'
  const icon = isUp ? '▲' : '▼'
  return (
    <span className={cls} style={{ fontWeight: 600, fontSize: 13 }}>
      {showIcon && <span style={{ fontSize: 10 }}>{icon} </span>}
      {Math.abs(pct).toFixed(2)}%
    </span>
  )
}

export function StockBadge({ change }) {
  const isUp = change >= 0
  return (
    <span className={isUp ? 'badge-up' : 'badge-down'}>
      {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
    </span>
  )
}

export function SectorTag({ sector }) {
  return <span className="sector-tag">{sector}</span>
}

export function StatusBadge({ status }) {
  const map = {
    completed: { bg: 'var(--success-light)', color: 'var(--success-dark)', label: 'Completed' },
    pending: { bg: 'var(--warning-light)', color: '#92400E', label: 'Pending' },
    rejected: { bg: 'var(--danger-light)', color: 'var(--danger-dark)', label: 'Rejected' },
  }
  const style = map[status] || map.pending
  return (
    <span style={{ background: style.bg, color: style.color, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
      {style.label}
    </span>
  )
}
