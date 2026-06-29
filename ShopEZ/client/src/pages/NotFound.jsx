import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="auth-page"><div className="auth-card"><h1>404</h1><p>That page is not available.</p><Link className="btn btn-primary" to="/dashboard">Go home</Link></div></div>; }
