import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, calcChangePercent } from '../../utils/helpers'
import { StockBadge, SectorTag } from './Badges'

export default function StockCard({ stock }) {
  const navigate = useNavigate()
  const change = calcChangePercent(stock.current_price, stock.previous_close)

  return (
    <div className="stock-card card-hover" onClick={() => navigate(`/stock/${stock.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {stock.logo_url ? (
            <img src={stock.logo_url} alt={stock.symbol} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)', background: 'white', padding: 2 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
              {stock.symbol.charAt(0)}
            </div>
          )}
          <div>
            <div className="stock-symbol">{stock.symbol}</div>
            <div className="stock-name">{stock.company_name}</div>
          </div>
        </div>
        <StockBadge change={change} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="stock-price">{formatCurrency(stock.current_price)}</div>
        <SectorTag sector={stock.sector} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>HIGH</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(stock.daily_high)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LOW</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(stock.daily_low)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>VOL</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{stock.volume ? (stock.volume / 1e6).toFixed(1) + 'M' : '-'}</div>
        </div>
      </div>
    </div>
  )
}
