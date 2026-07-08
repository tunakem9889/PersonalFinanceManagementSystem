import api from "../services/axios";
import { mapTransferToApi, mapWalletFromApi, mapWalletToApi } from "./mappers";

export interface Wallet {
  id: string;
  name: string;
  type: 'Cash' | 'Bank Account' | 'E-Wallet' | 'Savings' | 'Credit' | 'Investment' | string;
  balance: number;
  colorClass?: string;
  monthlyChange?: number;
  currency?: string;
  description?: string;
}

export interface WalletTransfer {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  notes?: string;
}

export const walletApi = {
  getAll: async (): Promise<Wallet[]> => {
    const response = await api.get('/api/wallets');
    return (response.data as Record<string, unknown>[]).map(mapWalletFromApi);
  },

  getById: async (id: string): Promise<Wallet> => {
    const response = await api.get(`/api/wallets/${id}`);
    return mapWalletFromApi(response.data);
  },

  create: async (data: Omit<Wallet, 'id'>): Promise<Wallet> => {
    const response = await api.post('/api/wallets', mapWalletToApi(data));
    return mapWalletFromApi(response.data);
  },

  update: async (id: string, data: Partial<Wallet>): Promise<Wallet> => {
    const response = await api.put(`/api/wallets/${id}`, mapWalletToApi(data));
    return mapWalletFromApi(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/wallets/${id}`);
  },

  transfer: async (data: WalletTransfer): Promise<void> => {
    await api.post('/api/transfers', mapTransferToApi(data));
  }
};
