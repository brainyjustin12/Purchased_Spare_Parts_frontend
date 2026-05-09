import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export default function Reports() {
  const [mode, setMode] = useState('daily'); // 'daily' | 'monthly'
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState(null);

  const printRef = useRef(null);

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const data =
        mode === 'daily'
          ? await api.reports.daily(date)
          : await api.reports.monthly(month);

      // Normalize backend response (some builds may return different keys)
      const normalizeRows = (arr) =>
        (Array.isArray(arr) ? arr : []).map((r) => ({
          date: r.date ?? r.day ?? '',
          partName: r.partName ?? r.P_Name ?? r.part_name ?? r.name ?? '',
          quantity: Number(r.quantity ?? r.qty ?? r.qtyIn ?? r.qtyOut ?? 0),
          in: Number(r.in ?? r.qtyIn ?? 0),
          out: Number(r.out ?? r.qtyOut ?? 0),
        }));

      const legacyRows = Array.isArray(data?.report) ? data.report : [];
      const legacyStockIn = legacyRows
        .filter((r) => Number(r.qtyIn ?? r.in ?? r.baseQuantity ?? 0) > 0)
        .map((r) => ({
          date: data?.date ?? data?.month ?? '',
          partName: r.partName ?? r.P_Name ?? r.part_name ?? r.p_name ?? r.name ?? '',
          quantity: Number(r.qtyIn ?? r.in ?? r.baseQuantity ?? 0),
        }));
      const legacyStockOut = legacyRows
        .filter((r) => Number(r.qtyOut ?? r.out ?? 0) > 0)
        .map((r) => ({
          date: data?.date ?? data?.month ?? '',
          partName: r.partName ?? r.P_Name ?? r.part_name ?? r.p_name ?? r.name ?? '',
          quantity: Number(r.qtyOut ?? r.out ?? 0),
        }));
      const legacySummary = legacyRows.map((r) => ({
        partName: r.partName ?? r.P_Name ?? r.part_name ?? r.p_name ?? r.name ?? '',
        in: Number(r.qtyIn ?? r.in ?? r.baseQuantity ?? 0),
        out: Number(r.qtyOut ?? r.out ?? 0),
      }));

      const normalized = {
        date: data?.date ?? undefined,
        month: data?.month ?? undefined,
        stockIn: normalizeRows(data?.stockIn ?? data?.in ?? data?.stock_in ?? legacyStockIn),
        stockOut: normalizeRows(data?.stockOut ?? data?.out ?? data?.stock_out ?? legacyStockOut),
        summary: (Array.isArray(data?.summary) ? data.summary : legacySummary).map((s) => ({
          partName: s.partName ?? s.P_Name ?? s.part_name ?? '',
          in: Number(s.in ?? s.qtyIn ?? 0),
          out: Number(s.out ?? s.qtyOut ?? 0),
        })),
      };

      setReport(normalized);
      setRawResponse(data);

    } catch (e) {
      setError(e.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  // Note: user must click Generate to load the report (on-demand).
  useEffect(() => {}, []);


  function handlePrint() {
    const node = printRef.current;
    if (!node) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <html>
        <head>
          <title>Garage Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            h2 { margin: 24px 0 8px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .meta { color: #475569; font-size: 12px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; }
            .right { text-align: right; }
            .totals { margin-top: 8px; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>${node.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }

  const stockIn = report?.stockIn || [];
  const stockOut = report?.stockOut || [];
  const summary = report?.summary || [];

  const totalIn = stockIn.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const totalOut = stockOut.reduce((s, r) => s + Number(r.quantity || 0), 0);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setMode('daily')}
            className={`px-3 py-2 rounded-md text-sm ${
              mode === 'daily' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode('monthly')}
            className={`px-3 py-2 rounded-md text-sm ${
              mode === 'monthly' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap items-end gap-3">
        {mode === 'daily' ? (
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Pick a date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
        ) : (
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Pick a month</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
        )}

        <button
          onClick={loadReport}
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm"
        >
          Generate
        </button>

        <button
          onClick={handlePrint}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          disabled={!report}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {loading && <p className="text-slate-500">Loading report...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {report && (
        <div ref={printRef} className="bg-white rounded-lg shadow p-6">
          <h1>Garage Inventory Report</h1>
          <div className="meta text-sm text-slate-500">
            {mode === 'daily' ? `Date: ${date}` : `Month: ${month}`} &nbsp;|&nbsp; Generated:{' '}
            {new Date().toLocaleString()}
          </div>

          {/* Stock In */}
          <h2 className="mt-6 font-semibold text-slate-800">Stock In (Items received)</h2>
          {stockIn.length === 0 ? (
            <p className="text-slate-500 text-sm">No stock in records.</p>
          ) : (
            <table className="w-full border text-sm mb-2">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Spare Part</th>
                  <th className="border px-2 py-1 right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stockIn.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.date}</td>
                    <td className="border px-2 py-1">{r.partName}</td>
                    <td className="border px-2 py-1 right">{r.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="totals">Total In: {totalIn}</div>

          {/* Stock Out */}
          <h2 className="mt-6 font-semibold text-slate-800">Stock Out (Items used / sold)</h2>
          {stockOut.length === 0 ? (
            <p className="text-slate-500 text-sm">No stock out records.</p>
          ) : (
            <table className="w-full border text-sm mb-2">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Spare Part</th>
                  <th className="border px-2 py-1 right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stockOut.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.date}</td>
                    <td className="border px-2 py-1">{r.partName}</td>
                    <td className="border px-2 py-1 right">{r.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="totals">Total Out: {totalOut}</div>

          {/* Summary */}
          <h2 className="mt-6 font-semibold text-slate-800">Summary (Net change per part)</h2>
          {summary.length === 0 ? (
            <p className="text-slate-500 text-sm">No summary data.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Spare Part</th>
                  <th className="border px-2 py-1 right">In</th>
                  <th className="border px-2 py-1 right">Out</th>
                  <th className="border px-2 py-1 right">Net</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{s.partName}</td>
                    <td className="border px-2 py-1 right">{s.in || 0}</td>
                    <td className="border px-2 py-1 right">{s.out || 0}</td>
                    <td className="border px-2 py-1 right">
                      {(s.in || 0) - (s.out || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
