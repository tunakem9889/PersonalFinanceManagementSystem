import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../api/transaction";
import type { Transaction, TransactionFilterParams } from "../api/transaction";

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'categoryName' | 'warning'>) => transactionApi.create(data),
    onSuccess: () => {
      // Invalidate transactions AND wallets since balance changes
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Transaction, 'id' | 'categoryName' | 'warning'> }) =>
      transactionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useFilterTransactions(params: TransactionFilterParams | null) {
  return useQuery({
    queryKey: ['transactions', 'filter', params],
    queryFn: () => transactionApi.filter(params!),
    enabled: params !== null,
  });
}
