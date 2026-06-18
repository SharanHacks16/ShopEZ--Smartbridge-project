import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn-primary-custom" style={{ borderRadius: 8, padding: '10px 24px', color: 'white' }}>Go Home</Link>
          <Link to="/dashboard" className="btn btn-light" style={{ borderRadius: 8 }}>Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
