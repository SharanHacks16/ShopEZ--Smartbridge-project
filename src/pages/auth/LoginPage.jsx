import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 26, margin: '0 auto 12px' }}>S</div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>ShopEZ</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Sign in to your trading account</p>
        </div>

        <div className="card" style={{ borderRadius: 20, border: 'none', overflow: 'hidden' }}>
          <div style={{ padding: '32px 32px 24px' }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label-custom">Email Address</label>
                <input
                  type="email"
                  className={`form-control form-control-custom w-100 ${errors.email ? 'border-danger' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
                />
                {errors.email && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`form-control form-control-custom w-100 ${errors.password ? 'border-danger' : ''}`}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)' }}>Forgot password?</Link>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary-custom w-100" style={{ padding: '12px', fontSize: 15 }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Demo Accounts</div>
                <div>Admin: <strong>admin@shopez.com</strong> / <strong>Admin@123</strong></div>
                <div>User: <strong>user@shopez.com</strong> / <strong>User@123</strong></div>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
              Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
