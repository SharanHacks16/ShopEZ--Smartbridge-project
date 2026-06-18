import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '📊', title: 'Real-Time Market Data', desc: 'Live stock prices with 30-second updates. Monitor every movement in the market.' },
  { icon: '💼', title: 'Portfolio Management', desc: 'Track your holdings, P&L, ROI, and overall portfolio performance at a glance.' },
  { icon: '🔒', title: 'Secure & Reliable', desc: 'Enterprise-grade security with JWT authentication and encrypted data storage.' },
  { icon: '📈', title: 'Advanced Charts', desc: 'Beautiful interactive charts powered by Chart.js for technical analysis.' },
  { icon: '⚡', title: 'Instant Execution', desc: 'Buy and sell stocks instantly with virtual money. No real risk involved.' },
  { icon: '🏆', title: 'Admin Dashboard', desc: 'Comprehensive admin tools to manage users, stocks, and all transactions.' },
]

const testimonials = [
  { name: 'Sarah Johnson', role: 'Finance Student', text: 'ShopEZ helped me understand the stock market without risking real money. The UI is incredibly intuitive!', avatar: 'SJ' },
  { name: 'Mike Chen', role: 'Software Engineer', text: 'The real-time price simulation is impressive. This is the perfect tool to practice trading strategies.', avatar: 'MC' },
  { name: 'Priya Sharma', role: 'MBA Graduate', text: 'I use ShopEZ daily for portfolio simulation. The charts and analytics are on par with professional platforms.', avatar: 'PS' },
]

const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 1.24 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.12, change: -0.87 },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.32, change: 2.15 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -1.43 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 875.24, change: 3.28 },
  { symbol: 'META', name: 'Meta Platforms', price: 502.14, change: 1.87 },
  { symbol: 'AMZN', name: 'Amazon', price: 185.07, change: 0.64 },
  { symbol: 'NFLX', name: 'Netflix', price: 624.19, change: -0.32 },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>ShopEZ</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, padding: '8px 16px' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999, background: 'rgba(30,64,175,0.95)', overflow: 'hidden', height: 36 }}>
        <div className="ticker">
          {[...mockStocks, ...mockStocks].map((s, i) => (
            <span key={i} className="ticker-item">
              <strong>{s.symbol}</strong> ${s.price.toFixed(2)}
              <span style={{ marginLeft: 6, color: s.change >= 0 ? '#86EFAC' : '#FCA5A5', fontSize: 12 }}>
                {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div className="hero-section" style={{ paddingTop: 100 }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-slide-up">
              <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.2)', borderRadius: 100, padding: '6px 16px', color: '#93C5FD', fontSize: 13, fontWeight: 600, marginBottom: 20, border: '1px solid rgba(37,99,235,0.3)' }}>
                📈 Virtual Stock Trading Platform
              </div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 20 }}>
                Trade Stocks.<br />
                <span style={{ background: 'linear-gradient(135deg, #60A5FA, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Risk-Free.
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 500 }}>
                Experience the excitement of stock trading with $100,000 virtual money. Buy, sell, analyze, and build your portfolio — no real risk, real learning.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12, fontWeight: 700, background: 'linear-gradient(135deg, #2563EB, #1E40AF)', border: 'none', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>
                  Start Trading Free →
                </Link>
                <Link to="/login" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Sign In
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                {[['20+', 'Stocks'], ['$100K', 'Virtual Balance'], ['Real-time', 'Updates']].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 24 }}>{val}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>LIVE MARKET</span>
                  <span style={{ background: '#22C55E', width: 8, height: 8, borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22C55E' }} />
                </div>
                {mockStocks.map(stock => (
                  <div key={stock.symbol} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93C5FD', fontWeight: 700, fontSize: 12 }}>
                        {stock.symbol.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{stock.symbol}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{stock.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>${stock.price.toFixed(2)}</div>
                      <div style={{ color: stock.change >= 0 ? '#86EFAC' : '#FCA5A5', fontSize: 12, fontWeight: 600 }}>
                        {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: '100px 0', background: 'white' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1px', marginBottom: 12 }}>Everything you need to trade</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>A complete trading simulation platform built with modern technology</p>
          </div>
          <div className="row g-4">
            {features.map(f => (
              <div key={f.title} className="col-md-6 col-lg-4">
                <div className="card card-hover p-4 h-100" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)' }}>
        <div className="container">
          <div className="row g-4 text-center">
            {[['20+', 'Listed Stocks', '📈'], ['$100K', 'Starting Balance', '💰'], ['Real-time', 'Price Updates', '⚡'], ['Free', 'Forever', '🎁']].map(([val, label, icon]) => (
              <div key={label} className="col-6 col-md-3">
                <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 32, letterSpacing: '-1px' }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1px', marginBottom: 12 }}>What traders are saying</h2>
          </div>
          <div className="row g-4">
            {testimonials.map(t => (
              <div key={t.name} className="col-md-4">
                <div className="card p-4 h-100" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 32, color: '#F59E0B', marginBottom: 12 }}>★★★★★</div>
                  <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1px', marginBottom: 16 }}>Ready to start trading?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>Join now and receive $100,000 in virtual currency to practice trading.</p>
          <Link to="/register" className="btn btn-light btn-lg" style={{ borderRadius: 12, fontWeight: 700, padding: '14px 40px', fontSize: 16, color: 'var(--primary)' }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', padding: '48px 0 24px', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>S</div>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>ShopEZ</span>
              </div>
              <p style={{ lineHeight: 1.7 }}>A virtual stock trading platform for learning and practice. No real money involved.</p>
            </div>
            <div className="col-6 col-md-2 offset-md-2">
              <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Platform</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/market" style={{ color: 'inherit' }}>Market</Link>
                <Link to="/dashboard" style={{ color: 'inherit' }}>Dashboard</Link>
                <Link to="/portfolio" style={{ color: 'inherit' }}>Portfolio</Link>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login" style={{ color: 'inherit' }}>Sign In</Link>
                <Link to="/register" style={{ color: 'inherit' }}>Register</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, textAlign: 'center' }}>
            © {new Date().getFullYear()} ShopEZ. Virtual Stock Trading Platform. For educational purposes only.
          </div>
        </div>
      </footer>
    </div>
  )
}
