import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

const navLinks = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/market', icon: '📊', label: 'Market' },
  { to: '/portfolio', icon: '💼', label: 'Portfolio' },
  { to: '/transactions', icon: '🔄', label: 'Transactions' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

const adminLinks = [
  { to: '/admin', icon: '🏠', label: 'Admin Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'Manage Users' },
  { to: '/admin/stocks', icon: '📈', label: 'Manage Stocks' },
  { to: '/admin/transactions', icon: '📋', label: 'Transactions' },
]

export default function Sidebar() {
  const { profile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.info('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A', letterSpacing: '-0.5px' }}>ShopEZ</span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 16 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="divider mx-3" />
            <div className="nav-section-title">Administration</div>
            {adminLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/admin'} className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff&size=80`}
              alt={profile.name}
              className="avatar"
              style={{ width: 36, height: 36 }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{profile.role}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm w-100" style={{ borderRadius: 8, fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
