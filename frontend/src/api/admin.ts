import api from "../services/axios";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export const adminApi = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/api/admin/users');
    return (response.data as Record<string, unknown>[]).map((u) => ({
      id: String(u.id ?? ""),
      fullName: String(u.fullName ?? ""),
      email: String(u.email ?? ""),
      createdAt: String(u.createdAt ?? ""),
    }));
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await api.get(`/api/admin/users/${id}`);
    const u = response.data;
    return {
      id: String(u.id ?? ""),
      fullName: String(u.fullName ?? ""),
      email: String(u.email ?? ""),
      createdAt: String(u.createdAt ?? ""),
    };
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  },
};
