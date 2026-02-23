import { MonthlySummary } from '../types';
import { formatCurrency } from '../store';
import { TrendingUp } from 'lucide-react';

interface Props {
  summaries: MonthlySummary[];
}

export function MonthlySheet({ summaries }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white sticky top-0 z-10">
                <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">A: MONTH</th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="space-y-2">
                      <TrendingUp size={32} className="mx-auto text-gray-300" />
                      <p className="font-medium">No monthly data yet</p>
                      <p className="text-xs">Add at least 28 daily entries (4 weeks) to generate monthly summaries</p>
                    </div>
                  </td>
                </tr>
              )}
              {summaries.map(month => {
                const profitColor = month.netProfit >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200';
                return (
                  <tr key={month.monthNumber} className="border-t border-gray-100 hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-teal-700">{month.month}</td>
                    <td className="px-4 py-3 text-right font-medium">{month.newCustomers}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(month.revenue)}</td>
                    <td className="px-4 py-3 text-right font-medium">{month.returningCustomers}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(month.repeatRevenue)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(month.adsCost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold border ${profitColor}`}>
                        {formatCurrency(month.netProfit)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {summaries.length > 0 && (
                <tr className="border-t-2 border-teal-200 bg-teal-50/50 font-bold">
                  <td className="px-4 py-3 text-teal-800">TOTAL</td>
                  <td className="px-4 py-3 text-right">{summaries.reduce((s, m) => s + m.newCustomers, 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(summaries.reduce((s, m) => s + m.revenue, 0))}</td>
                  <td className="px-4 py-3 text-right">{summaries.reduce((s, m) => s + m.returningCustomers, 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(summaries.reduce((s, m) => s + m.repeatRevenue, 0))}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency(summaries.reduce((s, m) => s + m.adsCost, 0))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold border bg-teal-100 text-teal-800 border-teal-300">
                      {formatCurrency(summaries.reduce((s, m) => s + m.netProfit, 0))}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {summaries.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
            <span>Formulas: B=SUM(Weekly!B), C=SUM(Weekly!C), ... G=SUM(Weekly!G) per 4-week blocks</span>
            <span>{summaries.length} months</span>
          </div>
        )}
      </div>
    </div>
  );
}
