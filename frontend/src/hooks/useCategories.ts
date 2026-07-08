import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../api/category";
import type { Category } from "../api/category";

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) => categoryApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categoryApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });
}
