package com.example.Finance.controller;

import com.example.Finance.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Statistics", description = "Financial reports and statistics APIs")
public class ReportController {

    private final StatisticsService statisticsService;

    @Operation(summary = "Dashboard summary: total income, expense, assets, net balance")
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(Authentication authentication) {
        return ResponseEntity.ok(statisticsService.getSummary(authentication.getName()));
    }

    @Operation(summary = "Monthly report: income & expense for a specific month")
    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyReport(
            Authentication authentication,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(statisticsService.getMonthlyStatistics(authentication.getName(), month, year));
    }

    @Operation(summary = "Yearly report: total income & expense for a full year")
    @GetMapping("/yearly")
    public ResponseEntity<Map<String, Object>> getYearlyReport(
            Authentication authentication,
            @RequestParam int year) {
        return ResponseEntity.ok(statisticsService.getYearlyStatistics(authentication.getName(), year));
    }

    @Operation(summary = "Category report: expenses grouped by category for a month")
    @GetMapping("/category")
    public ResponseEntity<Map<String, Object>> getCategoryReport(
            Authentication authentication,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(statisticsService.getCategoryStatistics(authentication.getName(), month, year));
    }

    @Operation(summary = "Trend report: monthly income & expense for an entire year (12 months)")
    @GetMapping("/trend")
    public ResponseEntity<Map<String, Object>> getTrend(
            Authentication authentication,
            @RequestParam int year) {
        return ResponseEntity.ok(statisticsService.getTrend(authentication.getName(), year));
    }

    @Operation(summary = "Daily report: income & expense grouped by day for a period")
    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailyReport(
            Authentication authentication,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getDailyStatistics(authentication.getName(), startDate, endDate));
    }

    @Operation(summary = "Weekly report: income & expense grouped by week for a period")
    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyReport(
            Authentication authentication,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getWeeklyStatistics(authentication.getName(), startDate, endDate));
    }
}

