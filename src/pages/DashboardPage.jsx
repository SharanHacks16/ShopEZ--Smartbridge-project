import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { portfolioService, transactionService, stockService } from '../services/api'
import { formatCurrency, calcChangePercent } from '../utils/helpers'
import { LineChart, PortfolioLineChart } from '../components/charts/Charts'
import { StockBadge } from '../components/ui/Badges'
import Loader, { SkeletonCard } from '../components/ui/Loader'
import AppLayout from '../components/layout/AppLayout'

function StatCard({ title, value, icon, gradient, sub, subColor }) {
  return (
    <div className="card stat-card" style={{ background: gradient || 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: gradient ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: gradient ? 'white' : 'var(--text)', letterSpacing: '-1px' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 6, color: subColor || (gradient ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'), fontWeight: 500 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [topStocks, setTopStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      try {
        const [port, txns, stocks] = await Promise.all([
          portfolioService.getByUser(user.id),
          transactionService.getByUser(user.id, { limit: 5 }),
          stockService.getAll('', '', 'current_price', 'desc'),
        ])
        setPortfolio(port)
        setTransactions(txns.slice(0, 5))
        setTopStocks(stocks.slice(0, 8))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const holdings = Array.isArray(portfolio?.holdings) ? portfolio.holdings : []
  const totalCurrentVal = holdings.reduce((sum, h) => {
    const stock = topStocks.find(s => s.id === h.stock_id)
    return sum + (stock ? stock.current_price * h.quantity : h.avg_price * h.quantity)
  }, 0)
  const invested = portfolio?.total_investment || 0
  const pnl = totalCurrentVal - invested
  const pnlPct = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0.00'

  const portfolioChartData = (() => {
    if (!holdings.length) return { labels: [], values: [] }
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: (portfolio?.wallet_balance || 0) + invested * (0.9 + i * 0.02) }
    })
    return { labels: last7.map(d => d.date), values: last7.map(d => d.value) }
  })()

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* WELCOME */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #0F172A, #1E40AF)', border: 'none', overflow: 'hidden', position: 'relative' }}>
          <div style={{ padding: '24px 28px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 4, fontSize: 24 }}>
                  Welcome back, {profile?.name?.split(' ')[0] || 'Trader'} 👋
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 0, fontSize: 14 }}>
                  Your portfolio is {pnl >= 0 ? 'up' : 'down'} <strong style={{ color: pnl >= 0 ? '#86EFAC' : '#FCA5A5' }}>{Math.abs(parseFloat(pnlPct))}%</strong> today
                </p>
              </div>
              <Link to="/market" className="btn btn-light" style={{ borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                Browse Market →
              </Link>
            </div>
          </div>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(37,99,235,0.2)' }} />
        </div>

        {/* STATS */}
        {loading ? (
          <div className="row g-3 mb-4">
            {[1,2,3,4].map(i => <div key={i} className="col-6 col-lg-3"><SkeletonCard /></div>)}
          </div>
        ) : (
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <StatCard title="Wallet Balance" value={formatCurrency(profile?.wallet_balance || 0)} icon="💵" gradient="linear-gradient(135deg, #2563EB, #1E40AF)" sub={`Available cash`} />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard title="Portfolio Value" value={formatCurrency(totalCurrentVal)} icon="📊" sub={`${holdings.length} holding${holdings.length !== 1 ? 's' : ''}`} />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard title="Total Invested" value={formatCurrency(invested)} icon="💼" sub={`Invested amount`} />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                title="Profit / Loss"
                value={`${pnl >= 0 ? '+' : ''}${formatCurrency(pnl)}`}
                icon={pnl >= 0 ? '📈' : '📉'}
                sub={`ROI: ${pnlPct}%`}
                subColor={pnl >= 0 ? 'var(--success)' : 'var(--danger)'}
              />
            </div>
          </div>
        )}

        <div className="row g-4 mb-4">
          {/* PORTFOLIO CHART */}
          <div className="col-lg-8">
            <div className="card p-4 h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Portfolio Performance</h6>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 7 days</span>
              </div>
              {loading ? <Loader size="sm" text="" /> : portfolioChartData.labels.length > 0 ? (
                <PortfolioLineChart labels={portfolioChartData.labels} values={portfolioChartData.values} />
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>No portfolio data yet. <Link to="/market">Start trading!</Link></p>
                </div>
              )}
            </div>
          </div>

          {/* MARKET OVERVIEW */}
          <div className="col-lg-4">
            <div className="card p-4 h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Top Movers</h6>
                <Link to="/market" style={{ fontSize: 12 }}>View all</Link>
              </div>
              {loading ? <Loader size="sm" text="" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topStocks.slice(0, 6).map(stock => {
                    const ch = calcChangePercent(stock.current_price, stock.previous_close)
                    return (
                      <div key={stock.id} onClick={() => navigate(`/stock/${stock.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                            {stock.symbol.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{stock.symbol}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stock.company_name.slice(0, 18)}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{formatCurrency(stock.current_price)}</div>
                          <StockBadge change={ch} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="card p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Recent Transactions</h6>
            <Link to="/transactions" style={{ fontSize: 12 }}>View all</Link>
          </div>
          {loading ? <Loader size="sm" /> : transactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tx.stock_symbol}</td>
                      <td>
                        <span style={{ background: tx.buy_or_sell === 'buy' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.buy_or_sell === 'buy' ? 'var(--success-dark)' : 'var(--danger-dark)', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                          {tx.buy_or_sell}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.quantity}</td>
                      <td>{formatCurrency(tx.price)}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(tx.total_amount)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔄</div>
              <p>No transactions yet. <Link to="/market">Buy your first stock!</Link></p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
