import api from "../services/axios";
import { mapCategoryFromApi, mapCategoryToApi } from "./mappers";

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/api/categories');
    return (response.data as Record<string, unknown>[]).map(mapCategoryFromApi);
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post('/api/categories', mapCategoryToApi(data));
    return mapCategoryFromApi(response.data);
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/api/categories/${id}`, mapCategoryToApi(data));
    return mapCategoryFromApi(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  }
};
