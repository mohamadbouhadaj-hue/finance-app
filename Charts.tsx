import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
  ComposedChart, Area,
} from 'recharts';
import { ComputedDailyEntry, WeeklySummary, MonthlySummary } from '../types';
import { formatCurrency, GOAL_AMOUNT } from '../store';

interface DailyChartsProps {
  entries: ComputedDailyEntry[];
}

interface WeeklyChartsProps {
  summaries: WeeklySummary[];
}

interface MonthlyChartsProps {
  summaries: MonthlySummary[];
}

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export function DailyCharts({ entries }: DailyChartsProps) {
  if (entries.length === 0) return null;

  const chartData = entries.map(e => ({
    date: formatDateLabel(e.date),
    netProfit: Number(e.netProfit.toFixed(2)),
    revenue: Number((e.revenue + e.repeatRevenue).toFixed(2)),
    adsCost: Number(e.adsCost.toFixed(2)),
    cumulativeProfit: Number(e.cumulativeProfit.toFixed(2)),
    progressPercent: Number(Math.min(e.progressPercent, 100).toFixed(1)),
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      {/* Net Profit Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          Daily Net Profit
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey="netProfit"
              fill="url(#profitGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="netProfit"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Ads Column Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Revenue vs Ads Cost
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="adsCost" name="Ads Cost" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          Progress to ${GOAL_AMOUNT.toLocaleString()} Goal
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={v => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
            <ReferenceLine y={100} stroke="#10b981" strokeDasharray="4 4" label={{ value: '100% Goal', position: 'right', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" />
            <Bar dataKey="progressPercent" name="Progress %" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.progressPercent >= 100
                      ? '#10b981'
                      : entry.progressPercent >= 50
                        ? '#f59e0b'
                        : '#ef4444'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Profit Line */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          Cumulative Profit Trajectory
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={GOAL_AMOUNT} stroke="#10b981" strokeDasharray="4 4" label={{ value: `$${GOAL_AMOUNT} Goal`, position: 'right', fill: '#10b981', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              fill="url(#cumGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              name="Cumulative Profit"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ fill: '#8b5cf6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <defs>
              <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WeeklyCharts({ summaries }: WeeklyChartsProps) {
  if (summaries.length === 0) return null;

  const chartData = summaries.map(w => ({
    week: `Week ${w.weekNumber}`,
    netProfit: Number(w.netProfit.toFixed(2)),
    revenue: Number(w.revenue.toFixed(2)),
    repeatRevenue: Number(w.repeatRevenue.toFixed(2)),
    adsCost: Number(w.adsCost.toFixed(2)),
    totalRevenue: Number((w.revenue + w.repeatRevenue).toFixed(2)),
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          Weekly Net Profit
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
            <Bar dataKey="netProfit" name="Net Profit" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.netProfit >= 0 ? '#8b5cf6' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Weekly Revenue vs Ads Cost
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="totalRevenue" name="Total Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="adsCost" name="Ads Cost" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyCharts({ summaries }: MonthlyChartsProps) {
  if (summaries.length === 0) return null;

  const chartData = summaries.map(m => ({
    month: m.month,
    netProfit: Number(m.netProfit.toFixed(2)),
    revenue: Number(m.revenue.toFixed(2)),
    repeatRevenue: Number(m.repeatRevenue.toFixed(2)),
    adsCost: Number(m.adsCost.toFixed(2)),
    totalRevenue: Number((m.revenue + m.repeatRevenue).toFixed(2)),
  }));

  const cumulativeProfit = summaries.reduce((s, m) => s + m.netProfit, 0);
  const progressPercent = Math.min((cumulativeProfit / GOAL_AMOUNT) * 100, 100);

  return (
    <div className="space-y-6 mt-6">
      {/* Progress to Goal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          Monthly Progress to ${GOAL_AMOUNT.toLocaleString()} Goal
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPercent >= 100 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 min-w-[60px] text-right">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>{formatCurrency(cumulativeProfit)} of {formatCurrency(GOAL_AMOUNT)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
            Monthly Net Profit
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Monthly Revenue vs Ads Cost
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="totalRevenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="adsCost" name="Ads Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
