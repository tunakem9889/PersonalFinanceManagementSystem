import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import type { UserProfile, ChangePasswordRequest } from "../api/user";

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => userApi.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data)
  });
}
