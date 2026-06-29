import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Loader from './components/Loader.jsx';
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Market = lazy(() => import('./pages/Market.jsx'));
const StockDetails = lazy(() => import('./pages/StockDetails.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const Transactions = lazy(() => import('./pages/Transactions.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'));
const AdminStocks = lazy(() => import('./pages/AdminStocks.jsx'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
function ProtectedRoute({ children }) { const { user, loading } = useAuth(); if (loading) return <Loader />; return user ? children : <Navigate to="/login" replace />; }
function AdminRoute({ children }) { const { user } = useAuth(); return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />; }
export default function App() { return <AuthProvider><BrowserRouter><Suspense fallback={<Loader />}><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}><Route path="/dashboard" element={<Dashboard />} /><Route path="/market" element={<Market />} /><Route path="/stocks/:id" element={<StockDetails />} /><Route path="/portfolio" element={<Portfolio />} /><Route path="/transactions" element={<Transactions />} /><Route path="/profile" element={<Profile />} /><Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} /><Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} /><Route path="/admin/stocks" element={<AdminRoute><AdminStocks /></AdminRoute>} /><Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} /></Route><Route path="*" element={<NotFound />} /></Routes></Suspense><ToastContainer position="top-right" theme="colored" /></BrowserRouter></AuthProvider>; }
