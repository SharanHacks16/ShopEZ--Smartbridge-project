import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function Topbar({ onMenuToggle }) {
  const { profile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  async function handleLogout() {
    await logout()
    toast.info('Logged out')
    navigate('/')
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-link d-lg-none p-0" onClick={onMenuToggle} style={{ color: 'var(--text)', fontSize: 20 }}>
          ☰
        </button>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {profile && (
          <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
            💰 {formatCurrency(profile.wallet_balance || 0)}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}
          >
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=2563EB&color=fff&size=80`}
              alt="avatar"
              className="avatar"
              style={{ width: 28, height: 28 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 1000, overflow: 'hidden' }}>
              <Link to="/profile" className="dropdown-item" style={{ padding: '10px 16px', fontSize: 13, display: 'block', color: 'var(--text)' }} onClick={() => setShowDropdown(false)}>👤 Profile</Link>
              {isAdmin && <Link to="/admin" className="dropdown-item" style={{ padding: '10px 16px', fontSize: 13, display: 'block', color: 'var(--text)' }} onClick={() => setShowDropdown(false)}>🛡️ Admin</Link>}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={handleLogout} className="dropdown-item" style={{ padding: '10px 16px', fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
