package com.crowd.service;

import com.crowd.dto.DashboardSummaryDto;
import com.crowd.repository.CameraRepository;
import com.crowd.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardService {

    private final CameraRepository cameraRepository;
    private final IncidentRepository incidentRepository;

    public DashboardService(CameraRepository cameraRepository, IncidentRepository incidentRepository) {
        this.cameraRepository = cameraRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalCameras = cameraRepository.count();
        long totalIncidents = incidentRepository.count();
        long activeAlerts = incidentRepository.countActiveAlerts();
        long criticalAlerts = incidentRepository.countCriticalAlerts();
        
        // Mock data for missing fields
        long activeCameras = Math.max(0, totalCameras - 2);
        long todayIncidents = Math.min(totalIncidents, 10);

        // Build stats DTO
        DashboardSummaryDto.StatsDto stats = DashboardSummaryDto.StatsDto.builder()
                .totalCameras(totalCameras)
                .activeCameras(activeCameras)
                .activeAlerts(activeAlerts)
                .criticalAlerts(criticalAlerts)
                .totalIncidents(totalIncidents)
                .todayIncidents(todayIncidents)
                .build();

        // Generate mock incident trends
        List<Map<String, Object>> incidentTrends = IntStream.range(0, 7)
                .mapToObj(i -> Map.<String, Object>of(
                        "date", "Jun " + (22 + i),
                        "count", (int) (Math.random() * 30 + 5),
                        "critical", (int) (Math.random() * 5),
                        "high", (int) (Math.random() * 8),
                        "medium", (int) (Math.random() * 10),
                        "low", (int) (Math.random() * 10)
                ))
                .collect(Collectors.toList());

        // Generate mock alert distribution
        List<Map<String, Object>> alertDistribution = List.of(
                Map.of("level", "LOW", "count", 45),
                Map.of("level", "MEDIUM", "count", 28),
                Map.of("level", "HIGH", "count", 16),
                Map.of("level", "CRITICAL", "count", 11)
        );

        // Generate mock crowd density
        List<Map<String, Object>> crowdDensity = IntStream.range(0, 12)
                .mapToObj(i -> Map.<String, Object>of(
                        "hour", String.format("%02d:00", i * 2),
                        "avgDensity", Math.random() * 0.6 + 0.1,
                        "maxDensity", Math.random() * 0.4 + 0.5
                ))
                .collect(Collectors.toList());

        // Generate mock camera status
        List<Map<String, Object>> cameraStatus = List.of(
                Map.of("status", "ACTIVE", "count", activeCameras),
                Map.of("status", "INACTIVE", "count", totalCameras - activeCameras),
                Map.of("status", "ERROR", "count", 0),
                Map.of("status", "MAINTENANCE", "count", 0)
        );

        // Empty recent incidents and alerts for now
        List<Map<String, Object>> recentIncidents = List.of();
        List<Map<String, Object>> recentAlerts = List.of();

        return DashboardSummaryDto.builder()
                .stats(stats)
                .incidentTrends(incidentTrends)
                .alertDistribution(alertDistribution)
                .crowdDensity(crowdDensity)
                .cameraStatus(cameraStatus)
                .recentIncidents(recentIncidents)
                .recentAlerts(recentAlerts)
                .build();
    }
}
