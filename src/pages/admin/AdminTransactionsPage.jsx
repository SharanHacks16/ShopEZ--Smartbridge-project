import React, { useState, useEffect } from 'react'
import { transactionService } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import { StatusBadge } from '../../components/ui/Badges'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Loader from '../../components/ui/Loader'
import AppLayout from '../../components/layout/AppLayout'
import { toast } from 'react-toastify'

const PAGE_SIZE = 15

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await transactionService.getAll({ search, status: statusFilter })
      setTransactions(data)
    } catch (err) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleStatusUpdate(id, status) {
    setActionLoading(true)
    try {
      await transactionService.updateStatus(id, status)
      toast.success(`Transaction ${status}`)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setActionLoading(true)
    try {
      await transactionService.delete(confirmDelete.id)
      toast.success('Transaction deleted')
      setConfirmDelete(null)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const totals = transactions.reduce((acc, tx) => {
    acc.buyVol += tx.buy_or_sell === 'buy' ? tx.total_amount : 0
    acc.sellVol += tx.buy_or_sell === 'sell' ? tx.total_amount : 0
    return acc
  }, { buyVol: 0, sellVol: 0 })

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontWeight: 800, marginBottom: 4 }}>All Transactions</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>{transactions.length} total transactions</p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card p-3" style={{ background: 'var(--success-light)' }}>
              <div style={{ fontSize: 11, color: 'var(--success-dark)', fontWeight: 600, textTransform: 'uppercase' }}>Buy Volume</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success-dark)' }}>{formatCurrency(totals.buyVol)}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3" style={{ background: 'var(--danger-light)' }}>
              <div style={{ fontSize: 11, color: 'var(--danger-dark)', fontWeight: 600, textTransform: 'uppercase' }}>Sell Volume</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger-dark)' }}>{formatCurrency(totals.sellVol)}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Trades</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{transactions.length}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Volume</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{formatCurrency(totals.buyVol + totals.sellVol)}</div>
            </div>
          </div>
        </div>

        <div className="card p-3 mb-4">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
              <input type="text" className="form-control form-control-custom" placeholder="Search by symbol..." style={{ paddingLeft: 40 }} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="form-select form-control-custom" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <Loader /> : paginated.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><p>No transactions found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: 13 }}>{tx.profiles?.name || 'N/A'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tx.stock_symbol}</td>
                      <td>
                        <span style={{ background: tx.buy_or_sell === 'buy' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.buy_or_sell === 'buy' ? 'var(--success-dark)' : 'var(--danger-dark)', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {tx.buy_or_sell.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{tx.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{formatCurrency(tx.price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{formatCurrency(tx.total_amount)}</td>
                      <td><StatusBadge status={tx.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {tx.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusUpdate(tx.id, 'completed')} disabled={actionLoading} className="btn btn-sm" style={{ borderRadius: 6, fontSize: 11, background: 'var(--success-light)', color: 'var(--success-dark)', border: 'none', fontWeight: 700 }}>✓</button>
                              <button onClick={() => handleStatusUpdate(tx.id, 'rejected')} disabled={actionLoading} className="btn btn-sm" style={{ borderRadius: 6, fontSize: 11, background: 'var(--danger-light)', color: 'var(--danger-dark)', border: 'none', fontWeight: 700 }}>✗</button>
                            </>
                          )}
                          <button onClick={() => setConfirmDelete(tx)} disabled={actionLoading} className="btn btn-sm btn-danger" style={{ borderRadius: 6, fontSize: 11 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {transactions.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Pagination total={transactions.length} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        show={!!confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </AppLayout>
  )
}
