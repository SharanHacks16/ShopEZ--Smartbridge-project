import useFetch from '../hooks/useFetch.js';
import { dashboardAPI } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import StockCard from '../components/StockCard.jsx';
import ChartBox from '../components/ChartBox.jsx';
import DataTable from '../components/DataTable.jsx';
import Loader from '../components/Loader.jsx';
import { money } from '../utils/formatters.js';
export default function Dashboard() { const { data, loading } = useFetch(() => dashboardAPI.user(), []); if (loading) return <Loader />; const p = data.portfolio; const rows = data.recentTransactions; return <div className="page"><div className="welcome"><h1>Welcome back</h1><p>Your virtual trading cockpit is live.</p></div><div className="stats-grid"><StatCard label="Wallet Balance" value={money(p.walletBalance)} /><StatCard label="Portfolio Value" value={money(p.currentValue)} tone="success" /><StatCard label="Today P/L" value={money(p.profitLoss)} tone={p.profitLoss >= 0 ? 'success' : 'danger'} /></div><div className="grid-2"><section><h4>Portfolio growth</h4><ChartBox labels={p.holdings.map((h) => h.stock.symbol)} values={p.holdings.map((h) => h.quantity * h.stock.currentPrice)} type="area" /></section><section><h4>Top gainers</h4><div className="stock-grid compact">{data.market.gainers.map((s) => <StockCard key={s._id} stock={s} />)}</div></section></div><section><h4>Recent Transactions</h4><DataTable columns={[{key:'stock',label:'Stock',render:(r)=>r.stock?.symbol},{key:'buyOrSell',label:'Type'},{key:'quantity',label:'Qty'},{key:'totalAmount',label:'Amount',render:(r)=>money(r.totalAmount)}]} rows={rows} /></section></div>; }
