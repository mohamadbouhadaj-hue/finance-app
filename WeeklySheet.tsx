import { WeeklySummary } from '../types';
import { formatCurrency } from '../store';
import { BarChart3 } from 'lucide-react';

interface Props {
  summaries: WeeklySummary[];
}

export function WeeklySheet({ summaries }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white sticky top-0 z-10">
                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">A: WEEK #</th>
                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">DATE RANGE</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">B: NEW CUST.</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">C: REVENUE</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">D: RET. CUST.</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">E: REPEAT REV.</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">F: ADS COST</th>
                <th className="px-4 py-3 text-right font-semibold text-xs tracking-wide">G: NET PROFIT</th>
              </tr>
            </thead>
            <tbody>
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <div className="space-y-2">
                      <BarChart3 size={32} className="mx-auto text-gray-300" />
                      <p className="font-medium">No weekly data yet</p>
                      <p className="text-xs">Add at least 7 daily entries to generate weekly summaries</p>
                    </div>
                  </td>
                </tr>
              )}
              {summaries.map(week => {
                const profitColor = week.netProfit >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200';
                return (
                  <tr key={week.weekNumber} className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-purple-700">Week {week.weekNumber}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{week.dateRange}</td>
                    <td className="px-4 py-3 text-right font-medium">{week.newCustomers}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(week.revenue)}</td>
                    <td className="px-4 py-3 text-right font-medium">{week.returningCustomers}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(week.repeatRevenue)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(week.adsCost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold border ${profitColor}`}>
                        {formatCurrency(week.netProfit)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {summaries.length > 0 && (
                <tr className="border-t-2 border-purple-200 bg-purple-50/50 font-bold">
                  <td className="px-4 py-3 text-purple-800" colSpan={2}>TOTAL</td>
                  <td className="px-4 py-3 text-right">{summaries.reduce((s, w) => s + w.newCustomers, 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(summaries.reduce((s, w) => s + w.revenue, 0))}</td>
                  <td className="px-4 py-3 text-right">{summaries.reduce((s, w) => s + w.returningCustomers, 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(summaries.reduce((s, w) => s + w.repeatRevenue, 0))}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency(summaries.reduce((s, w) => s + w.adsCost, 0))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold border bg-purple-100 text-purple-800 border-purple-300">
                      {formatCurrency(summaries.reduce((s, w) => s + w.netProfit, 0))}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {summaries.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
            <span>Formulas: B=SUM(Daily!B), C=SUM(Daily!C), ... G=SUM(Daily!G) per 7-day blocks</span>
            <span>{summaries.length} weeks</span>
          </div>
        )}
      </div>
    </div>
  );
}
