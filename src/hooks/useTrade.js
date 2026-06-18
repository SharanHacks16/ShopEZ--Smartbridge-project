import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { portfolioService, transactionService } from '../services/api'
import { toast } from 'react-toastify'

export function useTrade() {
  const [loading, setLoading] = useState(false)

  async function buyStock(userId, stock, quantity) {
    setLoading(true)
    try {
      const qty = parseInt(quantity)
      if (!qty || qty <= 0) throw new Error('Quantity must be a positive number')

      const totalCost = parseFloat((stock.current_price * qty).toFixed(2))

      const portfolio = await portfolioService.getByUser(userId)
      if (!portfolio) throw new Error('Portfolio not found')
      if (portfolio.wallet_balance < totalCost) throw new Error('Insufficient wallet balance')

      const holdings = Array.isArray(portfolio.holdings) ? portfolio.holdings : []
      const existingIdx = holdings.findIndex(h => h.stock_id === stock.id)
      let updatedHoldings = [...holdings]

      if (existingIdx >= 0) {
        const existing = holdings[existingIdx]
        const newQty = existing.quantity + qty
        const newAvgPrice = parseFloat(((existing.avg_price * existing.quantity + totalCost) / newQty).toFixed(2))
        updatedHoldings[existingIdx] = { ...existing, quantity: newQty, avg_price: newAvgPrice }
      } else {
        updatedHoldings.push({
          stock_id: stock.id,
          symbol: stock.symbol,
          company_name: stock.company_name,
          quantity: qty,
          avg_price: stock.current_price,
          logo_url: stock.logo_url,
        })
      }

      const newWallet = parseFloat((portfolio.wallet_balance - totalCost).toFixed(2))
      const newInvestment = parseFloat((portfolio.total_investment + totalCost).toFixed(2))

      await portfolioService.upsert(userId, {
        holdings: updatedHoldings,
        wallet_balance: newWallet,
        total_investment: newInvestment,
        current_value: portfolio.current_value + totalCost,
        profit_loss: portfolio.profit_loss,
      })

      await supabase.from('profiles').update({ wallet_balance: newWallet }).eq('id', userId)

      await transactionService.create({
        user_id: userId,
        stock_id: stock.id,
        stock_symbol: stock.symbol,
        buy_or_sell: 'buy',
        quantity: qty,
        price: stock.current_price,
        total_amount: totalCost,
        status: 'completed',
      })

      toast.success(`Bought ${qty} share${qty > 1 ? 's' : ''} of ${stock.symbol}`)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function sellStock(userId, stock, quantity) {
    setLoading(true)
    try {
      const qty = parseInt(quantity)
      if (!qty || qty <= 0) throw new Error('Quantity must be a positive number')

      const portfolio = await portfolioService.getByUser(userId)
      if (!portfolio) throw new Error('Portfolio not found')

      const holdings = Array.isArray(portfolio.holdings) ? portfolio.holdings : []
      const holdingIdx = holdings.findIndex(h => h.stock_id === stock.id)
      if (holdingIdx < 0) throw new Error('You do not own this stock')
      if (holdings[holdingIdx].quantity < qty) throw new Error('Insufficient shares to sell')

      const holding = holdings[holdingIdx]
      const totalRevenue = parseFloat((stock.current_price * qty).toFixed(2))
      const costBasis = parseFloat((holding.avg_price * qty).toFixed(2))
      const realizedPnL = parseFloat((totalRevenue - costBasis).toFixed(2))

      let updatedHoldings = [...holdings]
      if (holding.quantity === qty) {
        updatedHoldings.splice(holdingIdx, 1)
      } else {
        updatedHoldings[holdingIdx] = { ...holding, quantity: holding.quantity - qty }
      }

      const newWallet = parseFloat((portfolio.wallet_balance + totalRevenue).toFixed(2))
      const investmentReduction = parseFloat((holding.avg_price * qty).toFixed(2))
      const newInvestment = Math.max(0, parseFloat((portfolio.total_investment - investmentReduction).toFixed(2)))
      const newPnL = parseFloat((portfolio.profit_loss + realizedPnL).toFixed(2))

      await portfolioService.upsert(userId, {
        holdings: updatedHoldings,
        wallet_balance: newWallet,
        total_investment: newInvestment,
        current_value: Math.max(0, portfolio.current_value - costBasis),
        profit_loss: newPnL,
      })

      await supabase.from('profiles').update({ wallet_balance: newWallet }).eq('id', userId)

      await transactionService.create({
        user_id: userId,
        stock_id: stock.id,
        stock_symbol: stock.symbol,
        buy_or_sell: 'sell',
        quantity: qty,
        price: stock.current_price,
        total_amount: totalRevenue,
        status: 'completed',
      })

      toast.success(`Sold ${qty} share${qty > 1 ? 's' : ''} of ${stock.symbol}`)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { buyStock, sellStock, loading }
}
