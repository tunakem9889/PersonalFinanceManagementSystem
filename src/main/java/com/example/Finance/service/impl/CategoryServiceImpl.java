package com.example.Finance.service.impl;

import com.example.Finance.dto.CategoryDto;
import com.example.Finance.entity.Category;
import com.example.Finance.entity.User;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.CategoryRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public CategoryDto createCategory(String email, CategoryDto categoryDto) {
        User user = getUserByEmail(email);

        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setIcon(categoryDto.getIcon());
        category.setUser(user);

        Category newCategory = categoryRepository.save(category);
        return mapToDto(newCategory);
    }

    @Override
    public List<CategoryDto> getAllCategories(String email) {
        User user = getUserByEmail(email);
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        return categories.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(String email, Long categoryId) {
        User user = getUserByEmail(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        return mapToDto(category);
    }

    @Override
    public CategoryDto updateCategory(String email, Long categoryId, CategoryDto categoryDto) {
        User user = getUserByEmail(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setIcon(categoryDto.getIcon());

        Category updatedCategory = categoryRepository.save(category);
        return mapToDto(updatedCategory);
    }

    @Override
    public void deleteCategory(String email, Long categoryId) {
        User user = getUserByEmail(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        categoryRepository.delete(category);
    }

    private User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private CategoryDto mapToDto(Category category){
        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setId(category.getId());
        categoryDto.setName(category.getName());
        categoryDto.setType(category.getType());
        categoryDto.setIcon(category.getIcon());
        return categoryDto;
    }
}
