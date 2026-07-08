package com.example.Finance.service.impl;

import com.example.Finance.dto.BudgetDto;
import com.example.Finance.entity.Budget;
import com.example.Finance.entity.Category;
import com.example.Finance.entity.TransactionType;
import com.example.Finance.entity.User;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.BudgetRepository;
import com.example.Finance.repository.CategoryRepository;
import com.example.Finance.repository.TransactionRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public BudgetDto createBudget(String email, BudgetDto budgetDto) {
        User user = getUserByEmail(email);
        Category category = getCategoryById(budgetDto.getCategoryId());

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        // Check if budget for this category, month, and year already exists
        if(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), category.getId(), budgetDto.getMonth(), budgetDto.getYear()).isPresent()) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Budget already exists for this category, month, and year");
        }

        Budget budget = new Budget();
        budget.setLimitAmount(budgetDto.getLimitAmount());
        // spentAmount is always calculated dynamically; store 0 in DB
        budget.setSpentAmount(BigDecimal.ZERO);
        budget.setMonth(budgetDto.getMonth());
        budget.setYear(budgetDto.getYear());
        budget.setUser(user);
        budget.setCategory(category);

        Budget newBudget = budgetRepository.save(budget);
        return mapToDto(newBudget, user.getId());
    }

    @Override
    public List<BudgetDto> getAllBudgets(String email) {
        User user = getUserByEmail(email);
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        return budgets.stream()
                .map(b -> mapToDto(b, user.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto getBudgetById(String email, Long budgetId) {
        User user = getUserByEmail(email);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        if(!budget.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Budget does not belong to user");
        }

        return mapToDto(budget, user.getId());
    }

    @Override
    public BudgetDto updateBudget(String email, Long budgetId, BudgetDto budgetDto) {
        User user = getUserByEmail(email);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        if(!budget.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Budget does not belong to user");
        }

        budget.setLimitAmount(budgetDto.getLimitAmount());
        // Do NOT update spentAmount from client; it's always computed from transactions

        Budget updatedBudget = budgetRepository.save(budget);
        return mapToDto(updatedBudget, user.getId());
    }

    @Override
    public void deleteBudget(String email, Long budgetId) {
        User user = getUserByEmail(email);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        if(!budget.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Budget does not belong to user");
        }

        budgetRepository.delete(budget);
    }

    private User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Category getCategoryById(Long id){
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    /**
     * Maps Budget entity to DTO, calculating spentAmount dynamically from actual transactions.
     * This ensures accuracy regardless of create/update/delete order.
     */
    private BudgetDto mapToDto(Budget budget, Long userId) {
        BigDecimal actualSpent = transactionRepository.sumAmountByUserCategoryTypeMonthYear(
                userId,
                budget.getCategory().getId(),
                TransactionType.EXPENSE,
                budget.getMonth(),
                budget.getYear()
        );

        BudgetDto budgetDto = new BudgetDto();
        budgetDto.setId(budget.getId());
        budgetDto.setLimitAmount(budget.getLimitAmount());
        budgetDto.setSpentAmount(actualSpent != null ? actualSpent : BigDecimal.ZERO);
        budgetDto.setMonth(budget.getMonth());
        budgetDto.setYear(budget.getYear());
        budgetDto.setCategoryId(budget.getCategory().getId());
        return budgetDto;
    }
}
