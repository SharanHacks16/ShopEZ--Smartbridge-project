export default function StatCard({ label, value, tone = 'primary' }) { return <div className="stat-card"><span>{label}</span><strong className={'text-' + tone}>{value}</strong></div>; }
