import React, { useState } from 'react'

export default function Pagination({ total, pageSize = 10, current, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
      pages.push(i)
    } else if (i === current - 2 || i === current + 2) {
      pages.push('...')
    }
  }

  const unique = pages.filter((p, i) => pages[i - 1] !== p)

  return (
    <nav>
      <ul className="pagination pagination-custom mb-0" style={{ gap: 4 }}>
        <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(current - 1)} style={{ borderRadius: 8 }}>‹</button>
        </li>
        {unique.map((p, i) =>
          p === '...' ? (
            <li key={`ellipsis-${i}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={p} className={`page-item ${p === current ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onChange(p)} style={{ borderRadius: 8 }}>{p}</button>
            </li>
          )
        )}
        <li className={`page-item ${current === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(current + 1)} style={{ borderRadius: 8 }}>›</button>
        </li>
      </ul>
    </nav>
  )
}
