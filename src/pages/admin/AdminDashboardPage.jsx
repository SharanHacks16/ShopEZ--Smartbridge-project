import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { transactionService, stockService, userService } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import { BarChart } from '../../components/charts/Charts'
import { StatusBadge } from '../../components/ui/Badges'
import Loader from '../../components/ui/Loader'
import AppLayout from '../../components/layout/AppLayout'

function StatBox({ title, value, icon, color }) {
  return (
    <div className="card p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 28, width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{title}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--text)', letterSpacing: '-1px' }}>{value}</div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, stocks: 0, transactions: 0, volume: 0 })
  const [recentTx, setRecentTx] = useState([])
  const [topStocks, setTopStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [users, stocks, txns] = await Promise.all([
          userService.getAll(),
          stockService.getAll(),
          transactionService.getAll({ limit: 50 }),
        ])
        const volume = txns.reduce((s, t) => s + t.total_amount, 0)
        setStats({ users: users.length, stocks: stocks.length, transactions: txns.length, volume })
        setRecentTx(txns.slice(0, 8))
        const stockTxMap = {}
        txns.forEach(tx => {
          if (!stockTxMap[tx.stock_symbol]) stockTxMap[tx.stock_symbol] = 0
          stockTxMap[tx.stock_symbol] += tx.total_amount
        })
        const sorted = Object.entries(stockTxMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
        setTopStocks(sorted)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>Platform overview and analytics</p>
          </div>
        </div>

        {loading ? (
          <div className="row g-3 mb-4">{[1,2,3,4].map(i => <div key={i} className="col-6 col-lg-3"><div className="card p-4"><div className="skeleton mb-2" style={{ height: 14, width: '50%' }} /><div className="skeleton" style={{ height: 32 }} /></div></div>)}</div>
        ) : (
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3"><StatBox title="Total Users" value={stats.users} icon="👥" color="#2563EB" /></div>
            <div className="col-6 col-lg-3"><StatBox title="Listed Stocks" value={stats.stocks} icon="📈" color="#22C55E" /></div>
            <div className="col-6 col-lg-3"><StatBox title="Transactions" value={stats.transactions} icon="🔄" color="#F59E0B" /></div>
            <div className="col-6 col-lg-3"><StatBox title="Trade Volume" value={'$' + (stats.volume / 1000).toFixed(0) + 'K'} icon="💰" color="#EF4444" /></div>
          </div>
        )}

        <div className="row g-4 mb-4">
          {/* TOP STOCKS CHART */}
          <div className="col-lg-7">
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Top Traded Stocks (by Volume)</h6>
              {loading ? <Loader /> : topStocks.length > 0 ? (
                <BarChart labels={topStocks.map(([s]) => s)} values={topStocks.map(([, v]) => v)} label="Volume ($)" />
              ) : <div className="empty-state"><p>No trade data yet</p></div>}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-lg-5">
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Admin Quick Actions</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: `${stats.users} registered` },
                  { to: '/admin/stocks', icon: '📈', label: 'Manage Stocks', desc: `${stats.stocks} listed` },
                  { to: '/admin/transactions', icon: '📋', label: 'View Transactions', desc: `${stats.transactions} total` },
                ].map(item => (
                  <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Recent Transactions</h6>
            <Link to="/admin/transactions" style={{ fontSize: 12 }}>View all</Link>
          </div>
          {loading ? <Loader /> : recentTx.length === 0 ? (
            <div className="empty-state"><p>No transactions yet</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: 13 }}>{tx.profiles?.name || 'N/A'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tx.stock_symbol}</td>
                      <td>
                        <span style={{ background: tx.buy_or_sell === 'buy' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.buy_or_sell === 'buy' ? 'var(--success-dark)' : 'var(--danger-dark)', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {tx.buy_or_sell.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{tx.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{formatCurrency(tx.total_amount)}</td>
                      <td><StatusBadge status={tx.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
