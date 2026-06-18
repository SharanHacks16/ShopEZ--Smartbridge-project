import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockService } from '../services/api'
import { formatCurrency, calcChangePercent, debounce } from '../utils/helpers'
import { StockBadge, SectorTag } from '../components/ui/Badges'
import StockCard from '../components/ui/StockCard'
import Pagination from '../components/ui/Pagination'
import Loader from '../components/ui/Loader'
import AppLayout from '../components/layout/AppLayout'
import { simulateNewPrice } from '../utils/helpers'

const SECTORS = ['All', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Telecom', 'Materials']
const PAGE_SIZE = 12

export default function MarketPage() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortOrder, setSortOrder] = useState('asc')
  const [viewMode, setViewMode] = useState('card')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await stockService.getAll()
        setStocks(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const newPrice = simulateNewPrice(s.current_price)
        return {
          ...s,
          current_price: newPrice,
          daily_high: Math.max(s.daily_high, newPrice),
          daily_low: s.daily_low > 0 ? Math.min(s.daily_low, newPrice) : newPrice,
        }
      }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = useMemo(() => {
    let result = [...stocks]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s => s.symbol.toLowerCase().includes(q) || s.company_name.toLowerCase().includes(q))
    }
    if (sector !== 'All') result = result.filter(s => s.sector === sector)
    result.sort((a, b) => {
      const aVal = a[sortBy]; const bVal = b[sortBy]
      if (typeof aVal === 'string') return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    return result
  }, [stocks, search, sector, sortBy, sortOrder])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const gainers = useMemo(() => [...stocks].sort((a, b) => calcChangePercent(b.current_price, b.previous_close) - calcChangePercent(a.current_price, a.previous_close)).slice(0, 3), [stocks])
  const losers = useMemo(() => [...stocks].sort((a, b) => calcChangePercent(a.current_price, a.previous_close) - calcChangePercent(b.current_price, b.previous_close)).slice(0, 3), [stocks])

  const handleSearch = useCallback(debounce((val) => { setSearch(val); setPage(1) }, 300), [])

  function toggleSort(field) {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('asc') }
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Market</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>Browse and trade {stocks.length} available stocks</p>
        </div>

        {/* TOP MOVERS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card p-3">
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>▲ Top Gainers</div>
              {loading ? <Loader size="sm" text="" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {gainers.map(s => (
                    <div key={s.id} onClick={() => navigate(`/stock/${s.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background 0.2s' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-muted)' }}>{s.company_name.slice(0, 20)}</span></div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(s.current_price)}</span>
                        <StockBadge change={calcChangePercent(s.current_price, s.previous_close)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card p-3">
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>▼ Top Losers</div>
              {loading ? <Loader size="sm" text="" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {losers.map(s => (
                    <div key={s.id} onClick={() => navigate(`/stock/${s.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background 0.2s' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-muted)' }}>{s.company_name.slice(0, 20)}</span></div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(s.current_price)}</span>
                        <StockBadge change={calcChangePercent(s.current_price, s.previous_close)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card p-3 mb-4">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div className="search-input" style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
              <span className="search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Search stocks..."
                style={{ paddingLeft: 40 }}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

            <select className="form-select form-control-custom" style={{ width: 'auto' }} value={sector} onChange={e => { setSector(e.target.value); setPage(1) }}>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className="form-select form-control-custom" style={{ width: 'auto' }} value={`${sortBy}-${sortOrder}`} onChange={e => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); setPage(1) }}>
              <option value="symbol-asc">Symbol A-Z</option>
              <option value="symbol-desc">Symbol Z-A</option>
              <option value="current_price-desc">Price High-Low</option>
              <option value="current_price-asc">Price Low-High</option>
              <option value="market_cap-desc">Market Cap ↓</option>
            </select>

            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              <button onClick={() => setViewMode('card')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: viewMode === 'card' ? 'var(--primary)' : 'white', color: viewMode === 'card' ? 'white' : 'var(--text)', cursor: 'pointer', fontSize: 14 }}>⊞</button>
              <button onClick={() => setViewMode('table')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: viewMode === 'table' ? 'var(--primary)' : 'white', color: viewMode === 'table' ? 'white' : 'var(--text)', cursor: 'pointer', fontSize: 14 }}>☰</button>
            </div>
          </div>
        </div>

        {/* RESULTS INFO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} stocks</span>
        </div>

        {/* STOCKS */}
        {loading ? (
          <div className="row g-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="col-6 col-md-4 col-xl-3"><div className="card p-3"><div className="skeleton mb-2" style={{ height: 14, width: '60%' }} /><div className="skeleton mb-2" style={{ height: 24 }} /><div className="skeleton" style={{ height: 12 }} /></div></div>)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>No stocks found for your search.</p></div>
        ) : viewMode === 'card' ? (
          <div className="row g-3">
            {paginated.map(stock => (
              <div key={stock.id} className="col-6 col-md-4 col-xl-3">
                <StockCard stock={stock} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('symbol')} style={{ cursor: 'pointer' }}>Symbol {sortBy === 'symbol' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                    <th>Company</th>
                    <th>Sector</th>
                    <th onClick={() => toggleSort('current_price')} style={{ cursor: 'pointer', textAlign: 'right' }}>Price {sortBy === 'current_price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                    <th style={{ textAlign: 'right' }}>Change</th>
                    <th style={{ textAlign: 'right' }}>Market Cap</th>
                    <th style={{ textAlign: 'right' }}>Volume</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(stock => {
                    const ch = calcChangePercent(stock.current_price, stock.previous_close)
                    return (
                      <tr key={stock.id} onClick={() => navigate(`/stock/${stock.id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 11 }}>
                              {stock.symbol.charAt(0)}
                            </div>
                            <strong style={{ color: 'var(--primary)' }}>{stock.symbol}</strong>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.company_name}</td>
                        <td><SectorTag sector={stock.sector} /></td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(stock.current_price)}</td>
                        <td style={{ textAlign: 'right' }}><StockBadge change={ch} /></td>
                        <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>${(stock.market_cap / 1e9).toFixed(1)}B</td>
                        <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>{stock.volume ? (stock.volume / 1e6).toFixed(1) + 'M' : '-'}</td>
                        <td><button className="btn btn-sm btn-primary" style={{ borderRadius: 6 }} onClick={e => { e.stopPropagation(); navigate(`/stock/${stock.id}`) }}>Trade</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination total={filtered.length} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
