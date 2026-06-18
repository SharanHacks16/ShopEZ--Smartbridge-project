import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import AppLayout from '../components/layout/AppLayout'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: profile?.name || '', email: profile?.email || '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [pwErrors, setPwErrors] = useState({})

  async function handleUpdateProfile(e) {
    e.preventDefault()
    if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update({ name: form.name }).eq('id', profile.id)
      if (error) throw error
      await refreshProfile()
      setEditMode(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!pwForm.newPw) errs.newPw = 'New password required'
    else if (pwForm.newPw.length < 6) errs.newPw = 'Minimum 6 characters'
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
      if (error) throw error
      setPwForm({ current: '', newPw: '', confirm: '' })
      toast.success('Password updated successfully!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=2563EB&color=fff&size=200`

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Profile</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>Manage your account settings</p>
        </div>

        {/* PROFILE CARD */}
        <div className="card p-4 mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <img src={avatarUrl} alt={profile?.name} className="avatar" style={{ width: 80, height: 80, border: '3px solid var(--primary-light)' }} />
            <div>
              <h5 style={{ fontWeight: 800, marginBottom: 4 }}>{profile?.name}</h5>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 14 }}>{profile?.email}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: profile?.role === 'admin' ? 'var(--danger-light)' : 'var(--primary-light)', color: profile?.role === 'admin' ? 'var(--danger-dark)' : 'var(--primary)', padding: '2px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                  {profile?.role}
                </span>
                {profile?.is_active && (
                  <span style={{ background: 'var(--success-light)', color: 'var(--success-dark)', padding: '2px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>Active</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            {[
              ['Member since', new Date(profile?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })],
              ['Account type', profile?.role === 'admin' ? 'Administrator' : 'Trader'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{val}</div>
              </div>
            ))}
          </div>

          {!editMode ? (
            <button onClick={() => { setEditMode(true); setForm({ name: profile.name, email: profile.email }) }} className="btn-primary-custom" style={{ borderRadius: 8 }}>
              Edit Profile
            </button>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label-custom">Full Name</label>
                <input type="text" className={`form-control form-control-custom w-100 ${errors.name ? 'border-danger' : ''}`} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({}) }} />
                {errors.name && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label-custom">Email</label>
                <input type="email" className="form-control form-control-custom w-100" value={form.email} disabled style={{ background: 'var(--bg)', cursor: 'not-allowed' }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={loading} className="btn-primary-custom" style={{ borderRadius: 8 }}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="btn btn-light" style={{ borderRadius: 8 }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* CHANGE PASSWORD */}
        <div className="card p-4">
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Change Password</h6>
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label className="form-label-custom">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-control form-control-custom w-100 ${pwErrors.newPw ? 'border-danger' : ''}`}
                  placeholder="Min 6 characters"
                  value={pwForm.newPw}
                  onChange={e => { setPwForm({ ...pwForm, newPw: e.target.value }); setPwErrors({ ...pwErrors, newPw: '' }) }}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {pwErrors.newPw && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{pwErrors.newPw}</div>}
            </div>
            <div className="mb-4">
              <label className="form-label-custom">Confirm New Password</label>
              <input
                type="password"
                className={`form-control form-control-custom w-100 ${pwErrors.confirm ? 'border-danger' : ''}`}
                placeholder="Repeat new password"
                value={pwForm.confirm}
                onChange={e => { setPwForm({ ...pwForm, confirm: e.target.value }); setPwErrors({ ...pwErrors, confirm: '' }) }}
              />
              {pwErrors.confirm && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{pwErrors.confirm}</div>}
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary-custom" style={{ borderRadius: 8 }}>
              {pwLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
