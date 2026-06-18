import React, { useState, useEffect } from 'react'
import { stockService } from '../../services/api'
import { formatCurrency, formatNumber, generateMockHistory } from '../../utils/helpers'
import { SectorTag } from '../../components/ui/Badges'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Loader from '../../components/ui/Loader'
import AppLayout from '../../components/layout/AppLayout'
import { toast } from 'react-toastify'

const SECTORS = ['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Telecom', 'Materials']
const PAGE_SIZE = 10

const emptyForm = { symbol: '', company_name: '', current_price: '', previous_close: '', market_cap: '', sector: 'Technology', description: '', logo_url: '', daily_high: '', daily_low: '', volume: '' }

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await stockService.getAll(search, sector)
      setStocks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search, sector])

  const paginated = stocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(stock) {
    setEditing(stock)
    setForm({ ...stock, current_price: stock.current_price, previous_close: stock.previous_close, market_cap: stock.market_cap, daily_high: stock.daily_high, daily_low: stock.daily_low, volume: stock.volume })
    setFormErrors({})
    setShowModal(true)
  }

  function validate() {
    const e = {}
    if (!form.symbol.trim()) e.symbol = 'Symbol required'
    if (!form.company_name.trim()) e.company_name = 'Company name required'
    if (!form.current_price || isNaN(form.current_price)) e.current_price = 'Valid price required'
    if (!form.sector) e.sector = 'Sector required'
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      const price = parseFloat(form.current_price)
      const payload = {
        symbol: form.symbol.toUpperCase().trim(),
        company_name: form.company_name.trim(),
        current_price: price,
        previous_close: parseFloat(form.previous_close) || price,
        market_cap: parseFloat(form.market_cap) || 0,
        sector: form.sector,
        description: form.description || '',
        logo_url: form.logo_url || '',
        daily_high: parseFloat(form.daily_high) || price,
        daily_low: parseFloat(form.daily_low) || price,
        volume: parseInt(form.volume) || 0,
      }
      if (editing) {
        await stockService.update(editing.id, payload)
        toast.success('Stock updated!')
      } else {
        payload.history = generateMockHistory(price)
        await stockService.create(payload)
        toast.success('Stock added!')
      }
      setShowModal(false)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      await stockService.delete(confirmDelete.id)
      toast.success('Stock deleted')
      setConfirmDelete(null)
      await load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Manage Stocks</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>{stocks.length} stocks listed</p>
          </div>
          <button onClick={openAdd} className="btn-primary-custom" style={{ borderRadius: 8 }}>+ Add Stock</button>
        </div>

        <div className="card p-3 mb-4">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
              <input type="text" className="form-control form-control-custom" placeholder="Search stocks..." style={{ paddingLeft: 40 }} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="form-select form-control-custom" style={{ width: 'auto' }} value={sector} onChange={e => { setSector(e.target.value); setPage(1) }}>
              <option value="">All Sectors</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <Loader /> : paginated.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📈</div><p>No stocks found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Sector</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Market Cap</th>
                    <th style={{ textAlign: 'right' }}>Volume</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(stock => (
                    <tr key={stock.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {stock.logo_url ? (
                            <img src={stock.logo_url} alt={stock.symbol} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border)', padding: 2 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: 'var(--primary)' }}>
                              {stock.symbol.charAt(0)}
                            </div>
                          )}
                          <strong style={{ color: 'var(--primary)' }}>{stock.symbol}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.company_name}</td>
                      <td><SectorTag sector={stock.sector} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(stock.current_price)}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>${(stock.market_cap / 1e9).toFixed(1)}B</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{formatNumber(stock.volume)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(stock)} className="btn btn-sm btn-primary" style={{ borderRadius: 6, fontSize: 12 }}>Edit</button>
                          <button onClick={() => setConfirmDelete(stock)} className="btn btn-sm btn-danger" style={{ borderRadius: 6, fontSize: 12 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {stocks.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Pagination total={stocks.length} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ margin: '30px auto' }}>
            <div className="modal-content" style={{ borderRadius: 16, border: 'none' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ fontWeight: 700, marginBottom: 0 }}>{editing ? 'Edit Stock' : 'Add New Stock'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div style={{ padding: '20px 24px' }}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label-custom">Symbol *</label>
                      <input className={`form-control form-control-custom w-100 ${formErrors.symbol ? 'border-danger' : ''}`} value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="AAPL" disabled={!!editing} style={{ textTransform: 'uppercase' }} />
                      {formErrors.symbol && <div className="text-danger" style={{ fontSize: 12 }}>{formErrors.symbol}</div>}
                    </div>
                    <div className="col-md-8">
                      <label className="form-label-custom">Company Name *</label>
                      <input className={`form-control form-control-custom w-100 ${formErrors.company_name ? 'border-danger' : ''}`} value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Apple Inc." />
                      {formErrors.company_name && <div className="text-danger" style={{ fontSize: 12 }}>{formErrors.company_name}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Current Price *</label>
                      <input type="number" step="0.01" className={`form-control form-control-custom w-100 ${formErrors.current_price ? 'border-danger' : ''}`} value={form.current_price} onChange={e => setForm({ ...form, current_price: e.target.value })} placeholder="182.63" />
                      {formErrors.current_price && <div className="text-danger" style={{ fontSize: 12 }}>{formErrors.current_price}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Previous Close</label>
                      <input type="number" step="0.01" className="form-control form-control-custom w-100" value={form.previous_close} onChange={e => setForm({ ...form, previous_close: e.target.value })} placeholder="180.00" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Sector *</label>
                      <select className="form-select form-control-custom w-100" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Market Cap ($)</label>
                      <input type="number" className="form-control form-control-custom w-100" value={form.market_cap} onChange={e => setForm({ ...form, market_cap: e.target.value })} placeholder="3000000000000" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Volume</label>
                      <input type="number" className="form-control form-control-custom w-100" value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} placeholder="50000000" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Daily High</label>
                      <input type="number" step="0.01" className="form-control form-control-custom w-100" value={form.daily_high} onChange={e => setForm({ ...form, daily_high: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Logo URL</label>
                      <input className="form-control form-control-custom w-100" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Description</label>
                      <textarea className="form-control form-control-custom w-100" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Company description..." />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 10, borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary-custom flex-fill" style={{ borderRadius: 10 }}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    {saving ? 'Saving...' : editing ? 'Update Stock' : 'Add Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!confirmDelete}
        title="Delete Stock"
        message={`Are you sure you want to delete ${confirmDelete?.symbol}? This will also affect user portfolios.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </AppLayout>
  )
}
