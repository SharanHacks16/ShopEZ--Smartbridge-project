import { supabase } from '../lib/supabase'
import { generateMockHistory } from './helpers'

export async function seedDemoUsers() {
  const existing = await supabase.from('profiles').select('email').in('email', ['admin@shopez.com', 'user@shopez.com'])
  if (existing.data && existing.data.length >= 2) return { success: true, message: 'Already seeded' }

  const results = []

  // Create admin
  if (!existing.data?.find(u => u.email === 'admin@shopez.com')) {
    const { data, error } = await supabase.auth.signUp({ email: 'admin@shopez.com', password: 'Admin@123' })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: 'Admin User',
        email: 'admin@shopez.com',
        role: 'admin',
        wallet_balance: 100000,
      })
      await supabase.from('portfolios').upsert({
        user_id: data.user.id,
        holdings: [],
        wallet_balance: 100000,
        total_investment: 0,
        current_value: 0,
        profit_loss: 0,
      })
      results.push('admin')
    }
  }

  // Create demo user
  if (!existing.data?.find(u => u.email === 'user@shopez.com')) {
    const { data, error } = await supabase.auth.signUp({ email: 'user@shopez.com', password: 'User@123' })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: 'Demo Trader',
        email: 'user@shopez.com',
        role: 'user',
        wallet_balance: 85000,
      })

      // Get some stocks for demo holdings
      const { data: stocks } = await supabase.from('stocks').select('id, symbol, company_name, current_price').limit(5)
      const holdings = stocks ? stocks.slice(0, 3).map(s => ({
        stock_id: s.id,
        symbol: s.symbol,
        company_name: s.company_name,
        quantity: Math.floor(Math.random() * 20) + 5,
        avg_price: parseFloat((s.current_price * (0.90 + Math.random() * 0.15)).toFixed(2)),
      })) : []

      const invested = holdings.reduce((s, h) => s + h.avg_price * h.quantity, 0)

      await supabase.from('portfolios').upsert({
        user_id: data.user.id,
        holdings,
        wallet_balance: 85000,
        total_investment: parseFloat(invested.toFixed(2)),
        current_value: parseFloat(invested.toFixed(2)),
        profit_loss: 0,
      })

      // Create sample transactions
      if (stocks && data.user) {
        for (const h of holdings) {
          const stock = stocks.find(s => s.id === h.stock_id)
          if (!stock) continue
          await supabase.from('transactions').insert({
            user_id: data.user.id,
            stock_id: stock.id,
            stock_symbol: stock.symbol,
            buy_or_sell: 'buy',
            quantity: h.quantity,
            price: h.avg_price,
            total_amount: parseFloat((h.avg_price * h.quantity).toFixed(2)),
            status: 'completed',
          })
        }
      }

      results.push('demo_user')
    }
  }

  return { success: true, message: `Created: ${results.join(', ')}` }
}
