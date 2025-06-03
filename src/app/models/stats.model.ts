import { Visit } from './formularios.model';

export interface MonthlyStats {
  userId: string;
  year: number;
  month: number;
  totalVisits: number;
  totalMinutes: number;
  totalRevisits: number;
  visits: Visit[];
}

export interface YearlyStatsSummary {
  userId: string;
  year: number;
  monthlyStats: {
    month: number;
    totalVisits: number;
    totalHours: number;
    totalRevisits: number;
  }[];
  yearTotals: {
    totalVisits: number;
    totalHours: number;
    totalRevisits: number;
  };
}