import { supabase } from '../lib/supabase'

export const stockService = {
  async getAll(search = '', sector = '', sortBy = 'symbol', sortOrder = 'asc') {
    let query = supabase.from('stocks').select('*')
    if (search) {
      query = query.or(`symbol.ilike.%${search}%,company_name.ilike.%${search}%`)
    }
    if (sector) query = query.eq('sector', sector)
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase.from('stocks').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async getBySymbol(symbol) {
    const { data, error } = await supabase.from('stocks').select('*').eq('symbol', symbol).maybeSingle()
    if (error) throw error
    return data
  },

  async create(stockData) {
    const { data, error } = await supabase.from('stocks').insert(stockData).select().single()
    if (error) throw error
    return data
  },

  async update(id, stockData) {
    const { data, error } = await supabase.from('stocks').update({ ...stockData, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('stocks').delete().eq('id', id)
    if (error) throw error
  },

  async updatePrice(id, newPrice) {
    const stock = await this.getById(id)
    if (!stock) return
    const history = Array.isArray(stock.history) ? stock.history : []
    const newEntry = { date: new Date().toISOString(), price: newPrice }
    const updatedHistory = [...history.slice(-89), newEntry]
    const { error } = await supabase.from('stocks').update({
      previous_close: stock.current_price,
      current_price: newPrice,
      daily_high: Math.max(stock.daily_high, newPrice),
      daily_low: stock.daily_low === 0 ? newPrice : Math.min(stock.daily_low, newPrice),
      history: updatedHistory,
      updated_at: new Date().toISOString()
    }).eq('id', id)
    if (error) throw error
  }
}

export const portfolioService = {
  async getByUser(userId) {
    const { data, error } = await supabase.from('portfolios').select('*').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(userId, portfolioData) {
    const existing = await this.getByUser(userId)
    if (existing) {
      const { data, error } = await supabase.from('portfolios').update({ ...portfolioData, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase.from('portfolios').insert({ user_id: userId, ...portfolioData }).select().single()
      if (error) throw error
      return data
    }
  }
}

export const transactionService = {
  async getByUser(userId, filters = {}) {
    let query = supabase.from('transactions').select(`*, stocks(symbol, company_name, logo_url)`).eq('user_id', userId)
    if (filters.type) query = query.eq('buy_or_sell', filters.type)
    if (filters.search) query = query.ilike('stock_symbol', `%${filters.search}%`)
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
    query = query.order('created_at', { ascending: false })
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getAll(filters = {}) {
    let query = supabase.from('transactions').select(`*, profiles(name, email), stocks(symbol, company_name)`)
    if (filters.search) query = query.ilike('stock_symbol', `%${filters.search}%`)
    if (filters.status) query = query.eq('status', filters.status)
    query = query.order('created_at', { ascending: false })
    if (filters.limit) query = query.limit(filters.limit)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(txData) {
    const { data, error } = await supabase.from('transactions').insert(txData).select().single()
    if (error) throw error
    return data
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase.from('transactions').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  }
}

export const userService = {
  async getAll(search = '') {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async toggleActive(id, is_active) {
    return this.update(id, { is_active })
  },

  async delete(id) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) throw error
  }
}
