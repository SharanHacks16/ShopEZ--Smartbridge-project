import React from 'react'

export default function ConfirmDialog({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'danger' }) {
  if (!show) return null
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-custom">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-light" onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</button>
            <button className={`btn btn-${confirmVariant}`} onClick={onConfirm} style={{ borderRadius: 8, fontWeight: 600 }}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
