import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api/client.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import SpareParts from './pages/SpareParts.jsx';
import StockIn from './pages/StockIn.jsx';
import StockOut from './pages/StockOut.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.auth.me()
      .then((res) => { if (res.loggedIn) setUser(res.user); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={user ? <Navigate to="/parts" /> : <Login  onLoggedIn={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/parts" /> : <Signup onSignedUp={setUser} />} />

        <Route element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route path="/parts"     element={<SpareParts />} />
          <Route path="/stock-in"  element={<StockIn />} />
          <Route path="/stock-out" element={<StockOut />} />
          <Route path="/reports"   element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? '/parts' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
