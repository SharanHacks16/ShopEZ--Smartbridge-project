import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return }
    setLoading(true)
    try {
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email)
      if (supaErr) throw supaErr
      setSent(true)
      toast.success('Password reset instructions sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 26, margin: '0 auto 12px' }}>S</div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>ShopEZ</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Reset your password</p>
        </div>

        <div className="card" style={{ borderRadius: 20, border: 'none' }}>
          <div style={{ padding: '32px' }}>
            {sent ? (
              <div className="text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Check your email</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  We sent password reset instructions to <strong>{email}</strong>
                </p>
                <Link to="/login" className="btn-primary-custom d-block text-center" style={{ padding: '10px', borderRadius: 8, color: 'white' }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div className="mb-4">
                  <label className="form-label-custom">Email Address</label>
                  <input
                    type="email"
                    className={`form-control form-control-custom w-100 ${error ? 'border-danger' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                  />
                  {error && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error}</div>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary-custom w-100" style={{ padding: '12px', fontSize: 15 }}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
              Remember your password? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
