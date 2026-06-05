package com.example.Finance.service;

import com.example.Finance.dto.BudgetDto;

import java.util.List;

public interface BudgetService {
    BudgetDto createBudget(String email, BudgetDto budgetDto);
    List<BudgetDto> getAllBudgets(String email);
    BudgetDto getBudgetById(String email, Long budgetId);
    BudgetDto updateBudget(String email, Long budgetId, BudgetDto budgetDto);
    void deleteBudget(String email, Long budgetId);
}
