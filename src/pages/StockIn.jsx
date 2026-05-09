import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function StockIn() {
  return <StockMovement title="Stock In" subtitle="Add new stock for a spare part" submit={api.inventory.stockIn} />;
}

export function StockMovement({ title, subtitle, submit, type = 'in' }) {
  const [parts, setParts] = useState([]);
  const [pId, setPId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await api.inventory.parts();
      setParts(res.parts);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    const selectedPart = parts.find((p) => String(p.p_id) === String(pId));
    const qty = Number(quantity);

    if (!selectedPart) {
      setError('Please select a spare part');
      return;
    }

    if (!date || Number.isNaN(Date.parse(date))) {
      setError('Please choose a valid date');
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Quantity must be a whole number greater than 0');
      return;
    }

    if (type === 'out' && qty > Number(selectedPart.currentStock || 0)) {
      setError(`Not enough stock. Available stock is ${selectedPart.currentStock}`);
      return;
    }

    setSaving(true);
    try {
      await submit({ p_id: Number(pId), date, quantity: qty });
      setSuccess('Recorded successfully');
      setQuantity('');
      await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Spare Part</label>
            <select value={pId} onChange={(e) => setPId(e.target.value)} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a part...</option>
              {parts.map((p) => (
                <option key={p.p_id} value={p.p_id}>
                  #{p.p_id} - {p.p_name} (stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={type === 'out' && pId ? parts.find((p) => String(p.p_id) === String(pId))?.currentStock : undefined}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded">{success}</div>}

          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition">
            {saving ? 'Saving...' : 'Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
