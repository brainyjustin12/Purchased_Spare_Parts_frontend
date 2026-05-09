import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const links = [
  { to: '/parts',     label: 'Spare Parts' },
  { to: '/stock-in',  label: 'Stock In' },
  { to: '/stock-out', label: 'Stock Out' },
  { to: '/reports',   label: 'Reports' },
];

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.auth.logout(); } catch {}
    setUser(null);
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-lg font-semibold tracking-tight">Garage Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          Signed in as <span className="text-slate-200 font-medium">{user?.userName}</span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">Dashboard</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
