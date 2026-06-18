import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { portfolioService, transactionService, stockService } from '../services/api'
import { formatCurrency, calcChangePercent, exportToCSV } from '../utils/helpers'
import { PortfolioPieChart, BarChart } from '../components/charts/Charts'
import { StockBadge, StatusBadge } from '../components/ui/Badges'
import { useTrade } from '../hooks/useTrade'
import Pagination from '../components/ui/Pagination'
import Loader from '../components/ui/Loader'
import AppLayout from '../components/layout/AppLayout'

const TX_PAGE_SIZE = 10

export default function PortfolioPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const { sellStock, loading: tradeLoading } = useTrade()
  const [portfolio, setPortfolio] = useState(null)
  const [stocks, setStocks] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [txFilter, setTxFilter] = useState({ type: '', search: '', dateFrom: '', dateTo: '' })
  const [txPage, setTxPage] = useState(1)
  const [sellModal, setSellModal] = useState(null)
  const [sellQty, setSellQty] = useState(1)

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const [port, txns, stockData] = await Promise.all([
        portfolioService.getByUser(user.id),
        transactionService.getByUser(user.id, txFilter),
        stockService.getAll(),
      ])
      setPortfolio(port)
      setTransactions(txns)
      setStocks(stockData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user, txFilter])

  const holdings = Array.isArray(portfolio?.holdings) ? portfolio.holdings : []

  const enrichedHoldings = holdings.map(h => {
    const stock = stocks.find(s => s.id === h.stock_id)
    const currentPrice = stock?.current_price || h.avg_price
    const currentValue = currentPrice * h.quantity
    const investedValue = h.avg_price * h.quantity
    const pnl = currentValue - investedValue
    const pct = ((pnl / investedValue) * 100).toFixed(2)
    return { ...h, currentPrice, currentValue, investedValue, pnl, pct, stock }
  })

  const totalCurrentVal = enrichedHoldings.reduce((s, h) => s + h.currentValue, 0)
  const totalInvested = enrichedHoldings.reduce((s, h) => s + h.investedValue, 0)
  const totalPnL = totalCurrentVal - totalInvested
  const roi = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00'

  const pieData = enrichedHoldings.length > 0 ? {
    labels: enrichedHoldings.map(h => h.symbol),
    values: enrichedHoldings.map(h => h.currentValue)
  } : null

  const barData = enrichedHoldings.length > 0 ? {
    labels: enrichedHoldings.map(h => h.symbol),
    values: enrichedHoldings.map(h => parseFloat(h.pct))
  } : null

  const filteredTx = transactions
  const paginatedTx = filteredTx.slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)

  async function handleSell() {
    if (!sellModal) return
    const ok = await sellStock(user.id, sellModal.stock || { id: sellModal.stock_id, symbol: sellModal.symbol, current_price: sellModal.currentPrice, company_name: sellModal.company_name }, sellQty)
    if (ok) { setSellModal(null); await load(); await refreshProfile() }
  }

  function handleExportCSV() {
    exportToCSV(transactions.map(tx => ({
      Date: new Date(tx.created_at).toLocaleDateString(),
      Stock: tx.stock_symbol,
      Type: tx.buy_or_sell,
      Quantity: tx.quantity,
      Price: tx.price,
      Total: tx.total_amount,
      Status: tx.status,
    })), 'transactions.csv')
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Portfolio</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>Track your investments and performance</p>
          </div>
        </div>

        {/* STATS */}
        {loading ? (
          <div className="row g-3 mb-4">{[1,2,3,4,5].map(i => <div key={i} className="col-6 col-lg"><div className="card p-3"><div className="skeleton mb-2" style={{ height: 14, width: '50%' }} /><div className="skeleton" style={{ height: 24 }} /></div></div>)}</div>
        ) : (
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg">
              <div className="card p-3" style={{ background: 'linear-gradient(135deg, #2563EB, #1E40AF)', border: 'none' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>Wallet Balance</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{formatCurrency(profile?.wallet_balance || 0)}</div>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="card p-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Portfolio Value</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{formatCurrency(totalCurrentVal)}</div>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="card p-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Invested</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{formatCurrency(totalInvested)}</div>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="card p-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total P/L</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}</div>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="card p-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>ROI</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: parseFloat(roi) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{parseFloat(roi) >= 0 ? '+' : ''}{roi}%</div>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS */}
        {!loading && enrichedHoldings.length > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-md-5">
              <div className="card p-4 h-100">
                <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Asset Allocation</h6>
                <PortfolioPieChart labels={pieData.labels} values={pieData.values} />
              </div>
            </div>
            <div className="col-md-7">
              <div className="card p-4 h-100">
                <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Performance by Stock (%)</h6>
                <BarChart labels={barData.labels} values={barData.values} label="Return %" />
              </div>
            </div>
          </div>
        )}

        {/* HOLDINGS TABLE */}
        <div className="card mb-4" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Holdings ({enrichedHoldings.length})</h6>
            <button onClick={() => navigate('/market')} className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>+ Buy More</button>
          </div>
          {loading ? <Loader /> : enrichedHoldings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <p>No holdings yet. <span onClick={() => navigate('/market')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Browse stocks</span></p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Avg Price</th>
                    <th style={{ textAlign: 'right' }}>Current</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                    <th style={{ textAlign: 'right' }}>P/L</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedHoldings.map(h => (
                    <tr key={h.stock_id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>
                            {h.symbol.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/stock/${h.stock_id}`)}>{h.symbol}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.company_name?.slice(0, 20)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{h.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{formatCurrency(h.avg_price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(h.currentPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(h.currentValue)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: h.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: 13 }}>
                          {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                        </div>
                        <div style={{ fontSize: 11, color: h.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {h.pct >= 0 ? '+' : ''}{h.pct}%
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => { setSellModal(h); setSellQty(1) }}
                          className="btn btn-danger btn-sm"
                          style={{ borderRadius: 6, fontSize: 12 }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TRANSACTIONS */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 0 }}>Transaction History</h6>
              <button onClick={handleExportCSV} className="btn btn-outline-secondary btn-sm" style={{ borderRadius: 8, fontSize: 12 }}>↓ Export CSV</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <select className="form-select form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={txFilter.type} onChange={e => setTxFilter({ ...txFilter, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <input type="text" placeholder="Search symbol..." className="form-control form-control-custom" style={{ width: 160, fontSize: 13 }} value={txFilter.search} onChange={e => setTxFilter({ ...txFilter, search: e.target.value })} />
              <input type="date" className="form-control form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={txFilter.dateFrom} onChange={e => setTxFilter({ ...txFilter, dateFrom: e.target.value })} />
              <input type="date" className="form-control form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={txFilter.dateTo} onChange={e => setTxFilter({ ...txFilter, dateTo: e.target.value })} />
            </div>
          </div>

          {loading ? <Loader /> : paginatedTx.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🔄</div><p>No transactions found.</p></div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-custom w-100 mb-0">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTx.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/stock/${tx.stock_id}`)}>{tx.stock_symbol}</td>
                        <td>
                          <span style={{ background: tx.buy_or_sell === 'buy' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.buy_or_sell === 'buy' ? 'var(--success-dark)' : 'var(--danger-dark)', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                            {tx.buy_or_sell}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{tx.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(tx.price)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(tx.total_amount)}</td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTx.length > TX_PAGE_SIZE && (
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination total={filteredTx.length} pageSize={TX_PAGE_SIZE} current={txPage} onChange={setTxPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SELL MODAL */}
      {sellModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, border: 'none' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ fontWeight: 700, marginBottom: 0 }}>Sell {sellModal.symbol}</h5>
                <button className="btn-close" onClick={() => setSellModal(null)} />
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Available shares</span>
                    <strong>{sellModal.quantity}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current price</span>
                    <strong>{formatCurrency(sellModal.currentPrice)}</strong>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Quantity to Sell</label>
                  <input
                    type="number"
                    min={1}
                    max={sellModal.quantity}
                    value={sellQty}
                    onChange={e => setSellQty(Math.min(parseInt(e.target.value) || 1, sellModal.quantity))}
                    className="form-control form-control-custom w-100"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
                  <span>Receive</span>
                  <span style={{ color: 'var(--success)' }}>{formatCurrency(sellModal.currentPrice * sellQty)}</span>
                </div>
              </div>
              <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 10 }}>
                <button className="btn btn-light flex-fill" style={{ borderRadius: 10 }} onClick={() => setSellModal(null)}>Cancel</button>
                <button className="btn btn-danger flex-fill" style={{ borderRadius: 10, fontWeight: 700 }} onClick={handleSell} disabled={tradeLoading}>
                  {tradeLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Confirm Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
