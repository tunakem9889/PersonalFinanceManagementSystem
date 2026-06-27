package com.example.Finance.service;

import java.util.Map;

public interface StatisticsService {
    Map<String, Object> getMonthlyStatistics(String email, int month, int year);
    Map<String, Object> getYearlyStatistics(String email, int year);
    Map<String, Object> getCategoryStatistics(String email, int month, int year);
    Map<String, Object> getSummary(String email);
    Map<String, Object> getTrend(String email, int year);
}

