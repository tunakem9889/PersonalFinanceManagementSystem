import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "../api/budget";
import type { Budget } from "../api/budget";

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: budgetApi.getAll
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Budget, 'id' | 'spentAmount' | 'categoryName' | 'categoryIcon'>) => budgetApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) => budgetApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  });
}
