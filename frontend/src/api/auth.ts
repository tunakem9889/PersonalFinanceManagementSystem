import api from "../services/axios";

export interface LoginCredentials {
  email: string;
  password?: string;
  username?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = {
      email: credentials.email,
      password: credentials.password
    };
    
    // Call the real API
    const response = await api.post('/api/auth/login', data);
    const { accessToken, refreshToken } = response.data;
    
    // Temporarily set token in axios instance to fetch profile
    const originalToken = api.defaults.headers.common['Authorization'];
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    let user: { id: string; username: string; email: string; role?: string } = { id: "", username: credentials.email, email: credentials.email };
    try {
      const profileRes = await api.get('/api/users/profile');
      user = {
        id: profileRes.data.id || "",
        username: profileRes.data.username || profileRes.data.fullName || credentials.email,
        email: profileRes.data.email,
        role: profileRes.data.role || "ROLE_USER",
      };
    } catch (e) {
      console.warn("Could not fetch profile, using default user info.");
    } finally {
      if (originalToken) {
        api.defaults.headers.common['Authorization'] = originalToken;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    }
    
    return {
      accessToken,
      refreshToken,
      user
    };
  },
  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const data = {
      fullName: credentials.username, // Map frontend username to backend fullName
      email: credentials.email,
      password: credentials.password,
    };
    
    // Register the user
    await api.post('/api/auth/register', data);
    
    // Automatically login after successful registration
    return authApi.login({
      email: credentials.email,
      password: credentials.password
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
};
