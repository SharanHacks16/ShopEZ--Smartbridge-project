import useFetch from '../hooks/useFetch.js';
import { dashboardAPI } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import ChartBox from '../components/ChartBox.jsx';
import DataTable from '../components/DataTable.jsx';
import Loader from '../components/Loader.jsx';
import { compact, money } from '../utils/formatters.js';
export default function AdminDashboard() { const { data, loading } = useFetch(() => dashboardAPI.admin(), []); if (loading) return <Loader />; return <div className="page"><h1>Admin Dashboard</h1><div className="stats-grid"><StatCard label="Total Users" value={compact(data.totalUsers)} /><StatCard label="Total Trades" value={compact(data.totalTrades)} /><StatCard label="Total Stocks" value={compact(data.totalStocks)} /><StatCard label="Capital In Market" value={money(data.capitalInMarket)} /></div><div className="grid-2"><section><h4>Platform analytics</h4><ChartBox type="bar" labels={['Users','Stocks','Trades']} values={[data.totalUsers,data.totalStocks,data.totalTrades]} /></section><section><h4>Recent activities</h4><DataTable rows={data.recentActivities} columns={[{key:'user',label:'User',render:(r)=>r.user?.email},{key:'stock',label:'Stock',render:(r)=>r.stock?.symbol},{key:'buyOrSell',label:'Type'},{key:'totalAmount',label:'Amount',render:(r)=>money(r.totalAmount)}]} /></section></div></div>; }
