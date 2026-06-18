import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#EF4444', '#F59E0B', '#22C55E', '#16A34A']
  return { score, label: labels[score] || '', color: colors[score] || '' }
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const pwStrength = getPasswordStrength(form.password)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to ShopEZ.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 26, margin: '0 auto 12px' }}>S</div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>ShopEZ</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Create your trading account — free $100,000 virtual balance</p>
        </div>

        <div className="card" style={{ borderRadius: 20, border: 'none' }}>
          <div style={{ padding: '32px 32px 24px' }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label-custom">Full Name</label>
                <input
                  type="text"
                  className={`form-control form-control-custom w-100 ${errors.name ? 'border-danger' : ''}`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }) }}
                />
                {errors.name && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
              </div>

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

              <div className="mb-3">
                <label className="form-label-custom">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`form-control form-control-custom w-100 ${errors.password ? 'border-danger' : ''}`}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
                {form.password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwStrength.score ? pwStrength.color : 'var(--border)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    {pwStrength.label && <span style={{ fontSize: 11, color: pwStrength.color, fontWeight: 600 }}>{pwStrength.label}</span>}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control form-control-custom w-100 ${errors.confirmPassword ? 'border-danger' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }) }}
                />
                {errors.confirmPassword && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</div>}
              </div>

              <button type="submit" disabled={loading} className="btn-success-custom w-100" style={{ padding: '12px', fontSize: 15 }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {loading ? 'Creating Account...' : 'Create Free Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
              Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
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
