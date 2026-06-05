package com.example.Finance.controller;

import com.example.Finance.dto.BudgetDto;
import com.example.Finance.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetDto> createBudget(Authentication authentication, @RequestBody BudgetDto budgetDto){
        String email = authentication.getName();
        return new ResponseEntity<>(budgetService.createBudget(email, budgetDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getAllBudgets(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(budgetService.getAllBudgets(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> getBudgetById(Authentication authentication, @PathVariable("id") Long budgetId){
        String email = authentication.getName();
        return ResponseEntity.ok(budgetService.getBudgetById(email, budgetId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDto> updateBudget(Authentication authentication, 
                                                  @PathVariable("id") Long budgetId, 
                                                  @RequestBody BudgetDto budgetDto){
        String email = authentication.getName();
        return ResponseEntity.ok(budgetService.updateBudget(email, budgetId, budgetDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(Authentication authentication, @PathVariable("id") Long budgetId){
        String email = authentication.getName();
        budgetService.deleteBudget(email, budgetId);
        return ResponseEntity.ok("Budget deleted successfully.");
    }
}
