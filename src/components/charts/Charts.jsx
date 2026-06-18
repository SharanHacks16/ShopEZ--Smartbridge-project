import React from 'react'
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Title, Tooltip, Legend, Filler
)

const defaultLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#0F172A', padding: 12, titleColor: '#94A3B8', bodyColor: 'white', cornerRadius: 8 } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 }, maxTicksLimit: 8 } },
    y: { grid: { color: 'rgba(226,232,240,0.6)' }, ticks: { color: '#94A3B8', font: { size: 11 } } }
  },
  elements: { point: { radius: 0 }, line: { tension: 0.4 } },
  interaction: { mode: 'nearest', axis: 'x', intersect: false }
}

export function LineChart({ data, color = '#2563EB', height = 260 }) {
  const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  const prices = data.map(d => d.price)
  const isUp = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true
  const lineColor = isUp ? '#22C55E' : '#EF4444'

  const chartData = {
    labels,
    datasets: [{
      label: 'Price',
      data: prices,
      borderColor: lineColor,
      backgroundColor: isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
      fill: true,
      borderWidth: 2,
    }]
  }
  return <div style={{ height }}><Line data={chartData} options={defaultLineOptions} /></div>
}

export function PortfolioLineChart({ labels, values }) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Portfolio Value',
      data: values,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37,99,235,0.08)',
      fill: true,
      borderWidth: 2,
    }]
  }
  return <div style={{ height: 260 }}><Line data={chartData} options={{ ...defaultLineOptions, plugins: { ...defaultLineOptions.plugins, legend: { display: false } } }} /></div>
}

export function PortfolioPieChart({ labels, values }) {
  const colors = ['#2563EB','#22C55E','#F59E0B','#EF4444','#06B6D4','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1']
  const chartData = {
    labels,
    datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: 'white' }]
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { font: { size: 12 }, padding: 16 } }, tooltip: { backgroundColor: '#0F172A', padding: 12, cornerRadius: 8 } },
    cutout: '65%'
  }
  return <div style={{ height: 260 }}><Doughnut data={chartData} options={opts} /></div>
}

export function BarChart({ labels, values, label = 'Value' }) {
  const chartData = {
    labels,
    datasets: [{
      label,
      data: values,
      backgroundColor: values.map(v => v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
      borderColor: values.map(v => v >= 0 ? '#22C55E' : '#EF4444'),
      borderWidth: 1,
      borderRadius: 6,
    }]
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0F172A', padding: 12, cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(226,232,240,0.6)' }, ticks: { color: '#94A3B8', font: { size: 11 } } }
    }
  }
  return <div style={{ height: 260 }}><Bar data={chartData} options={opts} /></div>
}
