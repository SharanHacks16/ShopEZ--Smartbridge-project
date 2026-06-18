import React, { useState, useEffect, useMemo } from 'react'
import { userService } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import { StatusBadge } from '../../components/ui/Badges'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Loader from '../../components/ui/Loader'
import AppLayout from '../../components/layout/AppLayout'
import { toast } from 'react-toastify'

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await userService.getAll(search)
      setUsers(data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search])

  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function toggleActive(user) {
    setActionLoading(true)
    try {
      await userService.toggleActive(user.id, !user.is_active)
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'activated'}`)
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
      await userService.delete(confirmDelete.id)
      toast.success('User deleted')
      setConfirmDelete(null)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontWeight: 800, marginBottom: 4 }}>Manage Users</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 0 }}>{users.length} total users</p>
        </div>

        <div className="card p-3 mb-4" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            className="form-control form-control-custom"
            placeholder="Search by name or email..."
            style={{ paddingLeft: 40 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <Loader /> : paginated.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><p>No users found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-custom w-100 mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Wallet</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563EB&color=fff&size=80`} alt={u.name} className="avatar" style={{ width: 32, height: 32 }} />
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span style={{ background: u.role === 'admin' ? 'var(--danger-light)' : 'var(--primary-light)', color: u.role === 'admin' ? 'var(--danger-dark)' : 'var(--primary)', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{formatCurrency(u.wallet_balance)}</td>
                      <td>
                        <span style={{ background: u.is_active ? 'var(--success-light)' : 'var(--text-muted)', color: u.is_active ? 'var(--success-dark)' : 'white', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => toggleActive(u)}
                            disabled={actionLoading}
                            className="btn btn-sm"
                            style={{
                              borderRadius: 6,
                              fontSize: 12,
                              background: u.is_active ? 'var(--warning-light)' : 'var(--success-light)',
                              color: u.is_active ? '#92400E' : 'var(--success-dark)',
                              border: 'none',
                              fontWeight: 600
                            }}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u)}
                            disabled={actionLoading || u.role === 'admin'}
                            className="btn btn-sm btn-danger"
                            style={{ borderRadius: 6, fontSize: 12, opacity: u.role === 'admin' ? 0.4 : 1 }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {users.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Pagination total={users.length} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        show={!!confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone and will remove their profile, portfolio, and transactions.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </AppLayout>
  )
}
