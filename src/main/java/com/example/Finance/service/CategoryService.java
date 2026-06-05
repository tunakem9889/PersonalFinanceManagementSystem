package com.example.Finance.service;

import com.example.Finance.dto.CategoryDto;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(String email, CategoryDto categoryDto);
    List<CategoryDto> getAllCategories(String email);
    CategoryDto getCategoryById(String email, Long categoryId);
    CategoryDto updateCategory(String email, Long categoryId, CategoryDto categoryDto);
    void deleteCategory(String email, Long categoryId);
}
