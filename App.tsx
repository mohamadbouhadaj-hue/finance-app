import { useState, useCallback, useMemo } from 'react';
import { DailyEntry, TabType } from './types';
import {
  loadEntries, saveEntries, computeDailyEntries,
  computeWeeklySummaries, computeMonthlySummaries,
  formatCurrency, GOAL_AMOUNT, getSampleData,
} from './store';
import { DailySheet } from './components/DailySheet';
import { WeeklySheet } from './components/WeeklySheet';
import { MonthlySheet } from './components/MonthlySheet';
import { DailyCharts, WeeklyCharts, MonthlyCharts } from './components/Charts';
import {
  CalendarDays, BarChart3, TrendingUp, Target,
  DollarSign, Users, ShoppingCart, Download,
  Upload, Sparkles, Trash2,
} from 'lucide-react';

export function App() {
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadEntries());
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  const computed = useMemo(() => computeDailyEntries(entries), [entries]);
  const weeklySummaries = useMemo(() => computeWeeklySummaries(computed), [computed]);
  const monthlySummaries = useMemo(() => computeMonthlySummaries(weeklySummaries), [weeklySummaries]);

  const totalRevenue = computed.reduce((s, e) => s + e.revenue + e.repeatRevenue, 0);
  const totalAdsCost = computed.reduce((s, e) => s + e.adsCost, 0);
  const totalProfit = computed.length > 0 ? computed[computed.length - 1].cumulativeProfit : 0;
  const totalCustomers = computed.reduce((s, e) => s + e.newCustomers + e.returningCustomers, 0);
  const progressPercent = Math.min((totalProfit / GOAL_AMOUNT) * 100, 100);

  const updateEntries = useCallback((newEntries: DailyEntry[]) => {
    setEntries(newEntries);
    saveEntries(newEntries);
  }, []);

  const handleAdd = useCallback((entry: DailyEntry) => {
    updateEntries([...entries, entry]);
  }, [entries, updateEntries]);

  const handleDelete = useCallback((id: string) => {
    updateEntries(entries.filter(e => e.id !== id));
  }, [entries, updateEntries]);

  const handleUpdate = useCallback((id: string, field: keyof DailyEntry, value: number | string) => {
    updateEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  }, [entries, updateEntries]);

  const handleLoadSample = () => {
    const sample = getSampleData();
    updateEntries(sample);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      updateEntries([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'New Customers', 'Revenue', 'Returning Customers', 'Repeat Revenue', 'Ads Cost', 'Net Profit', 'Cumulative Profit', 'Progress %'];
    const rows = computed.map(e => [
      e.date, e.newCustomers, e.revenue.toFixed(2), e.returningCustomers,
      e.repeatRevenue.toFixed(2), e.adsCost.toFixed(2), e.netProfit.toFixed(2),
      e.cumulativeProfit.toFixed(2), e.progressPercent.toFixed(1) + '%',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.trim().split('\n').slice(1);
          const imported: DailyEntry[] = lines.map((line, i) => {
            const cols = line.split(',');
            return {
              id: `import-${Date.now()}-${i}`,
              date: cols[0]?.trim() || '',
              newCustomers: Number(cols[1]) || 0,
              revenue: Number(cols[2]) || 0,
              returningCustomers: Number(cols[3]) || 0,
              repeatRevenue: Number(cols[4]) || 0,
              adsCost: Number(cols[5]) || 0,
            };
          }).filter(e => e.date);
          if (imported.length > 0) updateEntries([...entries, ...imported]);
        } catch {
          alert('Failed to parse CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
    { id: 'daily', label: 'Daily Data', icon: <CalendarDays size={16} />, color: 'text-blue-600', activeColor: 'bg-blue-600' },
    { id: 'weekly', label: 'Weekly Summary', icon: <BarChart3 size={16} />, color: 'text-purple-600', activeColor: 'bg-purple-600' },
    { id: 'monthly', label: 'Monthly Summary', icon: <TrendingUp size={16} />, color: 'text-teal-600', activeColor: 'bg-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-2 rounded-xl shadow-md">
                <DollarSign size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Financial Performance Tracker</h1>
                <p className="text-xs text-gray-500">Landing Pages & E-Commerce · ${GOAL_AMOUNT.toLocaleString()} Goal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                title="Load 30 days of sample data"
              >
                <Sparkles size={13} />
                Sample Data
              </button>
              <button
                onClick={handleImportCSV}
                className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                title="Import CSV"
              >
                <Upload size={13} />
                Import
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                title="Export CSV"
              >
                <Download size={13} />
                Export
              </button>
              {entries.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  title="Clear all data"
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Progress to Goal */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="opacity-80" />
              <span className="text-xs font-medium opacity-80">${GOAL_AMOUNT.toLocaleString()} Goal</span>
            </div>
            <div className="text-2xl font-black">{progressPercent.toFixed(1)}%</div>
            <div className="mt-2 bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progressPercent, 0)}%` }}
              />
            </div>
            <div className="text-xs opacity-70 mt-1">{formatCurrency(Math.max(totalProfit, 0))} earned</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-emerald-100 p-1.5 rounded-lg"><DollarSign size={14} className="text-emerald-600" /></div>
              <span className="text-xs text-gray-500 font-medium">Total Revenue</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{entries.length} days tracked</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-red-100 p-1.5 rounded-lg"><ShoppingCart size={14} className="text-red-600" /></div>
              <span className="text-xs text-gray-500 font-medium">Total Ads Cost</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalAdsCost)}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              ROAS: {totalAdsCost > 0 ? (totalRevenue / totalAdsCost).toFixed(2) : '—'}x
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <TrendingUp size={14} className={totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
              </div>
              <span className="text-xs text-gray-500 font-medium">Net Profit</span>
            </div>
            <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-100 p-1.5 rounded-lg"><Users size={14} className="text-blue-600" /></div>
              <span className="text-xs text-gray-500 font-medium">Total Customers</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{totalCustomers}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Avg/day: {entries.length > 0 ? (totalCustomers / entries.length).toFixed(1) : '0'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `${tab.activeColor} text-white shadow-md`
                  : `text-gray-500 hover:bg-gray-50 hover:text-gray-700`
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'daily' && entries.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {entries.length}
                </span>
              )}
              {tab.id === 'weekly' && weeklySummaries.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {weeklySummaries.length}
                </span>
              )}
              {tab.id === 'monthly' && monthlySummaries.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {monthlySummaries.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'daily' && (
          <div>
            <DailySheet
              entries={computed}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
            <DailyCharts entries={computed} />
          </div>
        )}

        {activeTab === 'weekly' && (
          <div>
            <WeeklySheet summaries={weeklySummaries} />
            <WeeklyCharts summaries={weeklySummaries} />
          </div>
        )}

        {activeTab === 'monthly' && (
          <div>
            <MonthlySheet summaries={monthlySummaries} />
            <MonthlyCharts summaries={monthlySummaries} />
          </div>
        )}

        {/* Footer with Formula Reference */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Formula Reference (Google Sheets Compatible)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="font-bold text-blue-800 mb-1">Daily Data Sheet</p>
              <p className="text-blue-600 font-mono">G2 = C2 + E2 - F2</p>
              <p className="text-blue-600 font-mono">H2 = SUM($G$2:G2)</p>
              <p className="text-blue-600 font-mono">I2 = H2 / 1000</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <p className="font-bold text-purple-800 mb-1">Weekly Summary Sheet</p>
              <p className="text-purple-600 font-mono">A2 = INT((ROW()-2)/7)+1</p>
              <p className="text-purple-600 font-mono">B2 = SUM(Daily!B2:B8)</p>
              <p className="text-purple-600 font-mono">G2 = SUM(Daily!G2:G8)</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
              <p className="font-bold text-teal-800 mb-1">Monthly Summary Sheet</p>
              <p className="text-teal-600 font-mono">B2 = SUM(Weekly!B2:B5)</p>
              <p className="text-teal-600 font-mono">C2 = SUM(Weekly!C2:C5)</p>
              <p className="text-teal-600 font-mono">G2 = SUM(Weekly!G2:G5)</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-4">
            <span>✅ Conditional Formatting: Net Profit (red/green) · Progress (red/yellow/green)</span>
            <span>✅ Auto-calculations on every update</span>
            <span>✅ Data persisted in localStorage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
