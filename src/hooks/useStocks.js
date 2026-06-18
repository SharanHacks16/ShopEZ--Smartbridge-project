import { useState, useEffect, useCallback } from 'react'
import { stockService } from '../services/api'
import { simulateNewPrice } from '../utils/helpers'

export function useStocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStocks = useCallback(async (search = '', sector = '', sortBy = 'symbol', sortOrder = 'asc') => {
    setLoading(true)
    try {
      const data = await stockService.getAll(search, sector, sortBy, sortOrder)
      setStocks(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const newPrice = simulateNewPrice(stock.current_price)
        const history = Array.isArray(stock.history) ? stock.history : []
        return {
          ...stock,
          current_price: newPrice,
          daily_high: Math.max(stock.daily_high, newPrice),
          daily_low: stock.daily_low === 0 ? newPrice : Math.min(stock.daily_low, newPrice),
          history: [...history.slice(-89), { date: new Date().toISOString(), price: newPrice }]
        }
      }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return { stocks, loading, error, refetch: fetchStocks }
}
