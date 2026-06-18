import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stockService, portfolioService } from '../services/api'
import { formatCurrency, calcChangePercent, formatNumber } from '../utils/helpers'
import { LineChart } from '../components/charts/Charts'
import { StockBadge, SectorTag, StatusBadge } from '../components/ui/Badges'
import { useTrade } from '../hooks/useTrade'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'
import AppLayout from '../components/layout/AppLayout'
import { simulateNewPrice } from '../utils/helpers'

export default function StockDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { buyStock, sellStock, loading: tradeLoading } = useTrade()

  const [stock, setStock] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState('1M')
  const [orderType, setOrderType] = useState('buy')
  const [quantity, setQuantity] = useState(1)
  const [orderError, setOrderError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        stockService.getById(id),
        user ? portfolioService.getByUser(user.id) : null,
      ])
      setStock(s)
      setPortfolio(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (!stock) return
    const interval = setInterval(() => {
      setStock(prev => {
        if (!prev) return prev
        const newPrice = simulateNewPrice(prev.current_price)
        const history = Array.isArray(prev.history) ? prev.history : []
        return {
          ...prev,
          current_price: newPrice,
          daily_high: Math.max(prev.daily_high, newPrice),
          daily_low: prev.daily_low > 0 ? Math.min(prev.daily_low, newPrice) : newPrice,
          history: [...history.slice(-89), { date: new Date().toISOString(), price: newPrice }]
        }
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [!!stock])

  const chartData = (() => {
    if (!stock?.history?.length) return []
    const history = Array.isArray(stock.history) ? stock.history : []
    const days = chartRange === '1W' ? 7 : chartRange === '1M' ? 30 : chartRange === '3M' ? 90 : history.length
    return history.slice(-days)
  })()

  const holding = portfolio?.holdings?.find(h => h.stock_id === id)
  const change = stock ? calcChangePercent(stock.current_price, stock.previous_close) : 0
  const totalCost = stock ? parseFloat((stock.current_price * quantity).toFixed(2)) : 0

  async function handleOrder(e) {
    e.preventDefault()
    setOrderError('')
    if (!quantity || quantity < 1) { setOrderError('Quantity must be at least 1'); return }
    if (orderType === 'buy') {
      if (totalCost > (profile?.wallet_balance || 0)) { setOrderError('Insufficient wallet balance'); return }
      const ok = await buyStock(user.id, stock, quantity)
      if (ok) { await load(); await refreshProfile() }
    } else {
      if (!holding) { setOrderError('You do not own this stock'); return }
      if (quantity > holding.quantity) { setOrderError(`You only have ${holding.quantity} shares`); return }
      const ok = await sellStock(user.id, stock, quantity)
      if (ok) { await load(); await refreshProfile() }
    }
  }

  if (loading) return <AppLayout><Loader /></AppLayout>
  if (!stock) return <AppLayout><div className="empty-state"><div className="empty-state-icon">❌</div><p>Stock not found.</p></div></AppLayout>

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* BACK + HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="btn btn-light btn-sm" style={{ borderRadius: 8 }}>← Back</button>
          <SectorTag sector={stock.sector} />
        </div>

        <div className="row g-4">
          {/* LEFT: STOCK INFO + CHART */}
          <div className="col-lg-8">
            {/* HEADER CARD */}
            <div className="card p-4 mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {stock.logo_url ? (
                    <img src={stock.logo_url} alt={stock.symbol} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'contain', border: '1px solid var(--border)', padding: 4, background: 'white' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>
                      {stock.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 2 }}>{stock.company_name}</h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, padding: '2px 10px', borderRadius: 6, fontSize: 13 }}>{stock.symbol}</span>
                      <SectorTag sector={stock.sector} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px' }}>{formatCurrency(stock.current_price)}</div>
                  <StockBadge change={change} />
                </div>
              </div>

              {/* STATS ROW */}
              <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {[
                  ['Daily High', formatCurrency(stock.daily_high), 'var(--success)'],
                  ['Daily Low', formatCurrency(stock.daily_low), 'var(--danger)'],
                  ['Market Cap', '$' + formatNumber(stock.market_cap), null],
                  ['Volume', formatNumber(stock.volume), null],
                  ['Prev Close', formatCurrency(stock.previous_close), null],
                ].map(([label, val, color]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: color || 'var(--text)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART */}
            <div className="card p-4 mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Price History</h6>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['1W', '1M', '3M', 'ALL'].map(r => (
                    <button key={r} onClick={() => setChartRange(r)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)', background: chartRange === r ? 'var(--primary)' : 'white', color: chartRange === r ? 'white' : 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {chartData.length > 0 ? <LineChart data={chartData} height={280} /> : <div className="empty-state" style={{ padding: 40 }}><p>No chart data available</p></div>}
            </div>

            {/* COMPANY INFO */}
            {stock.description && (
              <div className="card p-4">
                <h6 style={{ fontWeight: 700, marginBottom: 12 }}>About {stock.company_name}</h6>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>{stock.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER PANEL */}
          <div className="col-lg-4">
            {/* YOUR HOLDING */}
            {holding && (
              <div className="card p-4 mb-4" style={{ border: '2px solid var(--primary-light)' }}>
                <h6 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--primary)' }}>Your Position</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Shares Owned', holding.quantity],
                    ['Avg Price', formatCurrency(holding.avg_price)],
                    ['Current Value', formatCurrency(stock.current_price * holding.quantity)],
                    ['P/L', (() => {
                      const pl = (stock.current_price - holding.avg_price) * holding.quantity
                      return <span style={{ color: pl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{pl >= 0 ? '+' : ''}{formatCurrency(pl)}</span>
                    })()],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDER FORM */}
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Place Order</h6>

              {/* BUY/SELL TOGGLE */}
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
                {['buy', 'sell'].map(type => (
                  <button key={type} onClick={() => { setOrderType(type); setOrderError('') }} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', background: orderType === type ? (type === 'buy' ? 'var(--success)' : 'var(--danger)') : 'transparent', color: orderType === type ? 'white' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {type === 'buy' ? '▲ Buy' : '▼ Sell'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleOrder}>
                <div className="mb-3">
                  <label className="form-label-custom">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={orderType === 'sell' ? holding?.quantity || 1 : undefined}
                    value={quantity}
                    onChange={e => { setQuantity(parseInt(e.target.value) || 1); setOrderError('') }}
                    className="form-control form-control-custom w-100"
                  />
                  {orderType === 'sell' && holding && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Max: {holding.quantity} shares</div>
                  )}
                </div>

                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Price per share</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(stock.current_price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Quantity</span>
                    <span style={{ fontWeight: 600 }}>{quantity}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, color: orderType === 'buy' ? 'var(--danger)' : 'var(--success)' }}>{formatCurrency(totalCost)}</span>
                  </div>
                </div>

                {orderType === 'buy' && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Wallet: <strong>{formatCurrency(profile?.wallet_balance || 0)}</strong>
                    {totalCost > (profile?.wallet_balance || 0) && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>Insufficient!</span>}
                  </div>
                )}

                {orderError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{orderError}</div>}

                <button
                  type="submit"
                  disabled={tradeLoading || (orderType === 'buy' && totalCost > (profile?.wallet_balance || 0)) || (orderType === 'sell' && !holding)}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', background: orderType === 'buy' ? 'linear-gradient(135deg, var(--success), var(--success-dark))' : 'linear-gradient(135deg, var(--danger), var(--danger-dark))', color: 'white', transition: 'all 0.2s', opacity: (tradeLoading || (orderType === 'buy' && totalCost > (profile?.wallet_balance || 0)) || (orderType === 'sell' && !holding)) ? 0.5 : 1 }}
                >
                  {tradeLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {tradeLoading ? 'Processing...' : orderType === 'buy' ? `▲ Buy ${stock.symbol}` : `▼ Sell ${stock.symbol}`}
                </button>
              </form>
            </div>

            {/* NEWS PLACEHOLDER */}
            <div className="card p-4 mt-4">
              <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Latest News</h6>
              {[
                { title: `${stock.company_name} Reports Strong Quarterly Earnings`, time: '2h ago' },
                { title: `${stock.symbol} Analyst Upgrades Target Price`, time: '5h ago' },
                { title: `Market Outlook: ${stock.sector} Sector Analysis`, time: '1d ago' },
              ].map((n, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
