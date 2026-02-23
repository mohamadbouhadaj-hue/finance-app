import { useState } from 'react';
import { DailyEntry, ComputedDailyEntry } from '../types';
import { formatCurrency, formatPercent, generateId, getTodayString } from '../store';
import { Trash2, Plus, Calendar } from 'lucide-react';

interface Props {
  entries: ComputedDailyEntry[];
  onAdd: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: keyof DailyEntry, value: number | string) => void;
}

export function DailySheet({ entries, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: getTodayString(),
    newCustomers: '',
    revenue: '',
    returningCustomers: '',
    repeatRevenue: '',
    adsCost: '',
  });

  const handleAdd = () => {
    if (!form.date) return;
    onAdd({
      id: generateId(),
      date: form.date,
      newCustomers: Number(form.newCustomers) || 0,
      revenue: Number(form.revenue) || 0,
      returningCustomers: Number(form.returningCustomers) || 0,
      repeatRevenue: Number(form.repeatRevenue) || 0,
      adsCost: Number(form.adsCost) || 0,
    });
    setForm({
      date: getTodayString(),
      newCustomers: '',
      revenue: '',
      returningCustomers: '',
      repeatRevenue: '',
      adsCost: '',
    });
    setShowForm(false);
  };

  const getNetProfitColor = (val: number) =>
    val >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200';

  const getProgressColor = (val: number) => {
    if (val >= 100) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getProgressBarColor = (val: number) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Add Entry Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Daily Entry
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-blue-900 text-lg">New Daily Entry</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full pl-8 pr-2 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">New Customers</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.newCustomers}
                onChange={e => setForm({ ...form, newCustomers: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">Revenue ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.revenue}
                onChange={e => setForm({ ...form, revenue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">Returning Cust.</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.returningCustomers}
                onChange={e => setForm({ ...form, returningCustomers: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">Repeat Rev. ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.repeatRevenue}
                onChange={e => setForm({ ...form, repeatRevenue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 mb-1 block">Ads Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.adsCost}
                onChange={e => setForm({ ...form, adsCost: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Add Entry
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-white hover:bg-gray-50 text-gray-600 px-5 py-2 rounded-lg font-medium transition-colors text-sm border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                <th className="px-3 py-3 text-left font-semibold text-xs tracking-wide">A: DATE</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">B: NEW CUST.</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">C: REVENUE</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">D: RET. CUST.</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">E: REPEAT REV.</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">F: ADS COST</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">G: NET PROFIT</th>
                <th className="px-3 py-3 text-right font-semibold text-xs tracking-wide">H: CUM. PROFIT</th>
                <th className="px-3 py-3 text-center font-semibold text-xs tracking-wide">I: PROGRESS %</th>
                <th className="px-3 py-3 text-center font-semibold text-xs tracking-wide w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    <div className="space-y-2">
                      <Calendar size={32} className="mx-auto text-gray-300" />
                      <p className="font-medium">No entries yet</p>
                      <p className="text-xs">Click "Add Daily Entry" to start tracking</p>
                    </div>
                  </td>
                </tr>
              )}
              {entries.map((entry, _idx) => (
                <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-3 py-2.5 font-medium text-gray-800">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      value={entry.newCustomers}
                      onChange={e => onUpdate(entry.id, 'newCustomers', Number(e.target.value) || 0)}
                      className="w-16 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.revenue}
                      onChange={e => onUpdate(entry.id, 'revenue', Number(e.target.value) || 0)}
                      className="w-20 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      value={entry.returningCustomers}
                      onChange={e => onUpdate(entry.id, 'returningCustomers', Number(e.target.value) || 0)}
                      className="w-16 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.repeatRevenue}
                      onChange={e => onUpdate(entry.id, 'repeatRevenue', Number(e.target.value) || 0)}
                      className="w-20 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.adsCost}
                      onChange={e => onUpdate(entry.id, 'adsCost', Number(e.target.value) || 0)}
                      className="w-20 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${getNetProfitColor(entry.netProfit)}`}>
                      {formatCurrency(entry.netProfit)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-700">
                    {formatCurrency(entry.cumulativeProfit)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getProgressColor(entry.progressPercent)}`}>
                        {formatPercent(entry.progressPercent)}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBarColor(entry.progressPercent)}`}
                          style={{ width: `${Math.min(entry.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
            <span>Formula: G = C + E - F &nbsp;|&nbsp; H = SUM($G$2:G) &nbsp;|&nbsp; I = H / $1,000</span>
            <span>{entries.length} rows</span>
          </div>
        )}
      </div>
    </div>
  );
}
