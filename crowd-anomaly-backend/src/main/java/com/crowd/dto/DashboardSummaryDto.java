package com.crowd.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private StatsDto stats;
    private List<Map<String, Object>> incidentTrends;
    private List<Map<String, Object>> alertDistribution;
    private List<Map<String, Object>> crowdDensity;
    private List<Map<String, Object>> cameraStatus;
    private List<Map<String, Object>> recentIncidents;
    private List<Map<String, Object>> recentAlerts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsDto {
        private long totalCameras;
        private long activeCameras;
        private long activeAlerts;
        private long criticalAlerts;
        private long totalIncidents;
        private long todayIncidents;
    }
}
