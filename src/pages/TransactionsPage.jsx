import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { transactionService } from '../services/api'
import { formatCurrency } from '../utils/helpers'
import { StatusBadge } from '../components/ui/Badges'
import Pagination from '../components/ui/Pagination'
import { exportToCSV } from '../utils/helpers'
import Loader from '../components/ui/Loader'
import AppLayout from '../components/layout/AppLayout'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 15

export default function TransactionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', search: '', dateFrom: '', dateTo: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user) return
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await transactionService.getByUser(user.id, filter)
        setTransactions(data)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [user, filter])

  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = transactions.reduce((acc, tx) => {
    if (tx.buy_or_sell === 'buy') { acc.buyCount++; acc.buyVol += tx.total_amount }
    else { acc.sellCount++; acc.sellVol += tx.total_amount }
    return acc
  }, { buyCount: 0, buyVol: 0, sellCount: 0, sellVol: 0 })

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Transactions</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>Your complete trading history</p>
          </div>
          <button onClick={() => exportToCSV(transactions.map(tx => ({ Date: new Date(tx.created_at).toLocaleDateString(), Stock: tx.stock_symbol, Type: tx.buy_or_sell, Qty: tx.quantity, Price: tx.price, Total: tx.total_amount, Status: tx.status })), 'my_transactions.csv')} className="btn btn-outline-secondary" style={{ borderRadius: 8, fontSize: 13 }}>
            ↓ Export CSV
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card p-3"><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Trades</div><div style={{ fontSize: 22, fontWeight: 800 }}>{transactions.length}</div></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3" style={{ background: 'var(--success-light)' }}><div style={{ fontSize: 11, color: 'var(--success-dark)', fontWeight: 600, textTransform: 'uppercase' }}>Buy Orders</div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success-dark)' }}>{stats.buyCount}</div></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3" style={{ background: 'var(--danger-light)' }}><div style={{ fontSize: 11, color: 'var(--danger-dark)', fontWeight: 600, textTransform: 'uppercase' }}>Sell Orders</div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger-dark)' }}>{stats.sellCount}</div></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3"><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Volume</div><div style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(stats.buyVol + stats.sellVol)}</div></div>
          </div>
        </div>

        <div className="card p-3 mb-4">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select className="form-select form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={filter.type} onChange={e => { setFilter({ ...filter, type: e.target.value }); setPage(1) }}>
              <option value="">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input type="text" placeholder="Search symbol..." className="form-control form-control-custom" style={{ width: 160, fontSize: 13 }} value={filter.search} onChange={e => { setFilter({ ...filter, search: e.target.value }); setPage(1) }} />
            <input type="date" className="form-control form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })} />
            <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: 12 }}>to</span>
            <input type="date" className="form-control form-control-custom" style={{ width: 'auto', fontSize: 13 }} value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })} />
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <Loader /> : paginated.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🔄</div><p>No transactions match your filter.</p></div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-custom w-100 mb-0">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th>Status</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(tx => (
                      <tr key={tx.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/stock/${tx.stock_id}`)}>
                            {tx.stock_symbol}
                          </span>
                          {tx.stocks?.company_name && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.stocks.company_name.slice(0, 20)}</div>}
                        </td>
                        <td>
                          <span style={{ background: tx.buy_or_sell === 'buy' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.buy_or_sell === 'buy' ? 'var(--success-dark)' : 'var(--danger-dark)', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                            {tx.buy_or_sell}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{tx.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(tx.price)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(tx.total_amount)}</td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {new Date(tx.created_at).toLocaleDateString()}{' '}
                          <span style={{ fontSize: 11 }}>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length > PAGE_SIZE && (
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination total={transactions.length} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
