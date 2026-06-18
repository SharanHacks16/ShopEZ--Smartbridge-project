export function generateMockHistory(basePrice, days = 90) {
  const history = []
  let price = basePrice * 0.7
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.45) * price * 0.04
    price = Math.max(price + change, 1)
    history.push({ date: date.toISOString(), price: parseFloat(price.toFixed(2)) })
  }
  history[history.length - 1].price = basePrice
  return history
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toString()
}

export function calcChangePercent(current, previous) {
  if (!previous || previous === 0) return 0
  return parseFloat(((current - previous) / previous * 100).toFixed(2))
}

export function simulateNewPrice(currentPrice) {
  const maxChange = currentPrice * 0.025
  const change = (Math.random() - 0.5) * 2 * maxChange
  return parseFloat(Math.max(currentPrice + change, 0.01).toFixed(2))
}

export function exportToCSV(data, filename = 'export.csv') {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function debounce(fn, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=128`
}
