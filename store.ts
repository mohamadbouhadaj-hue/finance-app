import { DailyEntry, ComputedDailyEntry, WeeklySummary, MonthlySummary } from './types';

const STORAGE_KEY = 'financial-tracker-data';
const GOAL = 1000;

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function loadEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveEntries(entries: DailyEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function computeDailyEntries(entries: DailyEntry[]): ComputedDailyEntry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  return sorted.map(entry => {
    const netProfit = (entry.revenue || 0) + (entry.repeatRevenue || 0) - (entry.adsCost || 0);
    cumulative += netProfit;
    const progressPercent = Math.min((cumulative / GOAL) * 100, 999);
    return {
      ...entry,
      netProfit,
      cumulativeProfit: cumulative,
      progressPercent,
    };
  });
}

export function computeWeeklySummaries(computed: ComputedDailyEntry[]): WeeklySummary[] {
  if (computed.length === 0) return [];
  const weeks: WeeklySummary[] = [];
  for (let i = 0; i < computed.length; i += 7) {
    const chunk = computed.slice(i, i + 7);
    const weekNum = Math.floor(i / 7) + 1;
    const startDate = chunk[0].date;
    const endDate = chunk[chunk.length - 1].date;
    weeks.push({
      weekNumber: weekNum,
      newCustomers: chunk.reduce((s, e) => s + (e.newCustomers || 0), 0),
      revenue: chunk.reduce((s, e) => s + (e.revenue || 0), 0),
      returningCustomers: chunk.reduce((s, e) => s + (e.returningCustomers || 0), 0),
      repeatRevenue: chunk.reduce((s, e) => s + (e.repeatRevenue || 0), 0),
      adsCost: chunk.reduce((s, e) => s + (e.adsCost || 0), 0),
      netProfit: chunk.reduce((s, e) => s + e.netProfit, 0),
      dateRange: `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`,
    });
  }
  return weeks;
}

export function computeMonthlySummaries(weeks: WeeklySummary[]): MonthlySummary[] {
  if (weeks.length === 0) return [];
  const months: MonthlySummary[] = [];
  for (let i = 0; i < weeks.length; i += 4) {
    const chunk = weeks.slice(i, i + 4);
    const monthNum = Math.floor(i / 4) + 1;
    months.push({
      month: `Month ${monthNum}`,
      monthNumber: monthNum,
      newCustomers: chunk.reduce((s, w) => s + w.newCustomers, 0),
      revenue: chunk.reduce((s, w) => s + w.revenue, 0),
      returningCustomers: chunk.reduce((s, w) => s + w.returningCustomers, 0),
      repeatRevenue: chunk.reduce((s, w) => s + w.repeatRevenue, 0),
      adsCost: chunk.reduce((s, w) => s + w.adsCost, 0),
      netProfit: chunk.reduce((s, w) => s + w.netProfit, 0),
    });
  }
  return months;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getSampleData(): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 29);
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const newCust = Math.floor(Math.random() * 15) + 2;
    const revenue = Math.round((Math.random() * 80 + 20) * 100) / 100;
    const retCust = Math.floor(Math.random() * 8);
    const repRev = Math.round((Math.random() * 40) * 100) / 100;
    const adsCost = Math.round((Math.random() * 50 + 10) * 100) / 100;
    
    entries.push({
      id: generateId() + i,
      date: dateStr,
      newCustomers: newCust,
      revenue,
      returningCustomers: retCust,
      repeatRevenue: repRev,
      adsCost,
    });
  }
  return entries;
}

export const GOAL_AMOUNT = GOAL;
