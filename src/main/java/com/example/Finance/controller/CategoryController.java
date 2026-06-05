package com.example.Finance.controller;

import com.example.Finance.dto.CategoryDto;
import com.example.Finance.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(Authentication authentication, @RequestBody CategoryDto categoryDto){
        String email = authentication.getName();
        return new ResponseEntity<>(categoryService.createCategory(email, categoryDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(categoryService.getAllCategories(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(Authentication authentication, @PathVariable("id") Long categoryId){
        String email = authentication.getName();
        return ResponseEntity.ok(categoryService.getCategoryById(email, categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(Authentication authentication, 
                                                      @PathVariable("id") Long categoryId, 
                                                      @RequestBody CategoryDto categoryDto){
        String email = authentication.getName();
        return ResponseEntity.ok(categoryService.updateCategory(email, categoryId, categoryDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(Authentication authentication, @PathVariable("id") Long categoryId){
        String email = authentication.getName();
        categoryService.deleteCategory(email, categoryId);
        return ResponseEntity.ok("Category deleted successfully.");
    }
}
