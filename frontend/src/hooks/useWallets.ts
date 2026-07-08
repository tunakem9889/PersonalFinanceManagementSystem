import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "../api/wallet";
import type { Wallet, WalletTransfer } from "../api/wallet";

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.getAll
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: ['wallets', id],
    queryFn: () => walletApi.getById(id),
    enabled: !!id
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Wallet, 'id'>) => walletApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] })
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Wallet> }) => walletApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] })
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] })
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletTransfer) => walletApi.transfer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] })
  });
}
