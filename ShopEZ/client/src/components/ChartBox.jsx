import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);
const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } } };
export default function ChartBox({ type = 'line', labels = [], values = [], label = 'Value' }) { const data = { labels, datasets: [{ label, data: values, borderColor: '#2563EB', backgroundColor: type === 'pie' ? ['#2563EB','#22C55E','#EF4444','#F59E0B','#14B8A6','#7C3AED'] : 'rgba(37,99,235,.18)', fill: type === 'area', tension: .35 }] }; return <div className="chart-box">{type === 'bar' ? <Bar data={data} options={options} /> : type === 'pie' ? <Doughnut data={data} options={options} /> : <Line data={data} options={options} />}</div>; }
