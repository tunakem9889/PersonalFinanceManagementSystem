import api from "../services/axios";
import { mapBudgetFromApi, mapBudgetToApi } from "./mappers";

export interface Budget {
  id: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  limitAmount: number;
  spentAmount: number;
  month: number;
  year: number;
}

export const budgetApi = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get('/api/budgets');
    return (response.data as Record<string, unknown>[]).map(mapBudgetFromApi);
  },

  create: async (data: Omit<Budget, 'id' | 'spentAmount' | 'categoryName' | 'categoryIcon'>): Promise<Budget> => {
    const response = await api.post('/api/budgets', mapBudgetToApi(data));
    return mapBudgetFromApi(response.data);
  },

  update: async (id: string, data: Partial<Budget>): Promise<Budget> => {
    const response = await api.put(`/api/budgets/${id}`, mapBudgetToApi(data));
    return mapBudgetFromApi(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/budgets/${id}`);
  }
};
