import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../api/report";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: reportApi.getDashboardSummary
  });
}

export function useCashflow(period?: string) {
  return useQuery({
    queryKey: ['reports', 'cashflow', period],
    queryFn: () => reportApi.getCashflow(period)
  });
}

export function useExpenseByCategory(period?: string) {
  return useQuery({
    queryKey: ['reports', 'expense-by-category', period],
    queryFn: () => reportApi.getExpenseByCategory(period)
  });
}

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', month, year],
    queryFn: () => reportApi.getMonthlyReport(month, year),
  });
}

export function useDailyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'daily', startDate, endDate],
    queryFn: () => reportApi.getDailyReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useWeeklyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'weekly', startDate, endDate],
    queryFn: () => reportApi.getWeeklyReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
