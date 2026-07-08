import api from "../services/axios";
import { mapUserFromApi, mapUserToApi } from "./mappers";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  currency?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/api/users/profile');
    return mapUserFromApi(response.data);
  },
  
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put('/api/users/profile', mapUserToApi(data));
    return mapUserFromApi(response.data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/api/users/change-password', data);
  }
};
