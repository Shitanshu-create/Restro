import './App.css'
import LandingPage from './pages/LandingPage.jsx';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import React, { Suspense, lazy, useEffect, useState } from 'react';
import ProtectedRoute from './features/auth/components/ProtectedRoute.jsx';
import { useAuth } from './features/auth/hooks/useAuth.js';
const Login = lazy(() => import('./features/auth/pages/login.jsx'));
const Register = lazy(() => import('./features/auth/pages/register.jsx'));
const AdminPanel = lazy(() => import('./features/admin/pages/adminPanel.jsx'));
const KitchenDashboard = lazy(() => import('./features/kitchen/pages/KitchenDashboard.jsx'));
const CustomerMenuPage = lazy(() => import('./features/customers/pages/CustomerMenuPage.jsx'));
function LoadingScreen() {
  return (
    <main className="app-loading">
      <div className="app-loading-card">
        <h1>Loading...</h1>
      </div>
    </main>
  );
}
function App() {
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();
  const isLoggedIn = !!user;
  if (loading) {
    return <LoadingScreen />
  }
  const getRedirectPath = (u) => {
    if (!u) return "/";
    if (u.role === "chef" || u.role === "waiter") return "/kitchen";
    if (u.isAdmin || u.role === "admin") return "/admin";
    return "/";
  };
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path='/' element={<LandingPage isLoggedIn={isLoggedIn} user={user} />} />
          <Route path='/menu/:qrToken' element={<CustomerMenuPage />} />
          <Route path='/menu' element={<CustomerMenuPage />} />
          <Route path='/register'
            element={isLoggedIn ? <Navigate to={getRedirectPath(user)} /> :
              (<Register
                onBack={() => navigate('/')}
                onOpenLogin={() => navigate('/login')}
                onRegisterSuccess={(u) => navigate(getRedirectPath(u))} />)}
          />
          <Route path='/login'
            element={isLoggedIn ? <Navigate to={getRedirectPath(user)} /> :
              (<Login
                onBack={() => navigate('/')}
                onOpenRegister={() => navigate('/register')}
                onLoginSuccess={(u) => navigate(getRedirectPath(u))} />)}
          />
          <Route path='/admin/*' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path='/kitchen' element={
            <ProtectedRoute allowedRoles={['admin', 'chef', 'waiter']}>
              <KitchenDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </>
  )
}
export default App