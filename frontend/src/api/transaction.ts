import api from "../services/axios";
import { mapTransactionFromApi, mapTransactionToApi } from "./mappers";

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  walletId: string;
  categoryId: string;
  date: string;
  notes?: string;
  categoryName?: string;
  warning?: string;
}

export interface TransactionFilterParams {
  walletId?: string;
  categoryId?: string;
  startDate: string;
  endDate: string;
}

export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/api/transactions');
    return (response.data as Record<string, unknown>[]).map(mapTransactionFromApi);
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/transactions/${id}`);
    return mapTransactionFromApi(response.data);
  },

  create: async (data: Omit<Transaction, 'id' | 'categoryName' | 'warning'>): Promise<Transaction> => {
    const response = await api.post('/api/transactions', mapTransactionToApi(data));
    return mapTransactionFromApi(response.data);
  },

  update: async (id: string, data: Omit<Transaction, 'id' | 'categoryName' | 'warning'>): Promise<Transaction> => {
    const response = await api.put(`/api/transactions/${id}`, mapTransactionToApi(data));
    return mapTransactionFromApi(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },

  filter: async (params: TransactionFilterParams): Promise<Transaction[]> => {
    const queryParams: Record<string, string> = {
      startDate: params.startDate,
      endDate: params.endDate,
    };
    if (params.walletId) queryParams.walletId = params.walletId;
    if (params.categoryId) queryParams.categoryId = params.categoryId;

    const response = await api.get('/api/transactions/filter', { params: queryParams });
    return (response.data as Record<string, unknown>[]).map(mapTransactionFromApi);
  },
};
