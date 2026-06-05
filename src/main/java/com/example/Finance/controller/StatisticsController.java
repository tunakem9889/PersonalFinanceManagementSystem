package com.example.Finance.controller;

import com.example.Finance.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyStatistics(
            Authentication authentication,
            @RequestParam("month") int month,
            @RequestParam("year") int year){
        String email = authentication.getName();
        return ResponseEntity.ok(statisticsService.getMonthlyStatistics(email, month, year));
    }

    @GetMapping("/yearly")
    public ResponseEntity<Map<String, Object>> getYearlyStatistics(
            Authentication authentication,
            @RequestParam("year") int year){
        String email = authentication.getName();
        return ResponseEntity.ok(statisticsService.getYearlyStatistics(email, year));
    }

    @GetMapping("/category")
    public ResponseEntity<Map<String, Object>> getCategoryStatistics(
            Authentication authentication,
            @RequestParam("month") int month,
            @RequestParam("year") int year){
        String email = authentication.getName();
        return ResponseEntity.ok(statisticsService.getCategoryStatistics(email, month, year));
    }
}
