import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function SpareParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.inventory.parts();
      setParts(res.parts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.inventory.purchased({
        p_name: name,
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
      });
      setName(''); setQuantity(''); setUnitPrice('');
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchased Spare Parts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your inventory of purchased items</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow"
        >
          {showForm ? 'Cancel' : '+ New Spare Part'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Spare Part</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price</label>
              <input type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving}
                className="w-full py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-60 transition">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-right px-6 py-3">Base Qty</th>
              <th className="text-right px-6 py-3">Unit Price</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-right px-6 py-3">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : parts.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No spare parts yet</td></tr>
            ) : parts.map((p) => (
              <tr key={p.p_id} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-500">#{p.p_id}</td>
                <td className="px-6 py-3 font-medium text-slate-900">{p.p_name}</td>
                <td className="px-6 py-3 text-right text-slate-700">{p.baseQuantity}</td>
                <td className="px-6 py-3 text-right text-slate-700">{p.unit_price}</td>
                <td className="px-6 py-3 text-right text-slate-700">{p.total_price}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    p.currentStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{p.currentStock}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
