import React from 'react'

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sz = size === 'sm' ? 20 : size === 'lg' ? 48 : 32
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
      <div style={{ width: sz, height: sz, border: `3px solid var(--border)`, borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{text}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-3">
      <div className="skeleton mb-2" style={{ height: 16, width: '60%' }} />
      <div className="skeleton mb-2" style={{ height: 28, width: '40%' }} />
      <div className="skeleton" style={{ height: 12, width: '80%' }} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ height: 14, flex: 1 }} />
          <div className="skeleton" style={{ height: 14, flex: 1 }} />
          <div className="skeleton" style={{ height: 14, flex: 0.5 }} />
        </div>
      ))}
    </div>
  )
}
