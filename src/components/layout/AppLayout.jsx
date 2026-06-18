import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <div className={`sidebar-col ${sidebarOpen ? 'd-block' : ''}`}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebarOpen && (
        <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 201, width: 260, height: '100vh' }}>
          <Sidebar />
        </div>
      )}

      <div className="main-col">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
