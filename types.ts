export interface DailyEntry {
  id: string;
  date: string;
  newCustomers: number;
  revenue: number;
  returningCustomers: number;
  repeatRevenue: number;
  adsCost: number;
}

export interface ComputedDailyEntry extends DailyEntry {
  netProfit: number;
  cumulativeProfit: number;
  progressPercent: number;
}

export interface WeeklySummary {
  weekNumber: number;
  newCustomers: number;
  revenue: number;
  returningCustomers: number;
  repeatRevenue: number;
  adsCost: number;
  netProfit: number;
  dateRange: string;
}

export interface MonthlySummary {
  month: string;
  monthNumber: number;
  newCustomers: number;
  revenue: number;
  returningCustomers: number;
  repeatRevenue: number;
  adsCost: number;
  netProfit: number;
}

export type TabType = 'daily' | 'weekly' | 'monthly';
