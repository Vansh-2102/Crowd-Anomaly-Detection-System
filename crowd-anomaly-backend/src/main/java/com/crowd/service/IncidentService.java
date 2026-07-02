package com.crowd.service;

import com.crowd.client.MlServiceClient;
import com.crowd.dto.AnalyzeRequest;
import com.crowd.dto.IncidentDto;
import com.crowd.dto.MlAnalysisResponse;
import com.crowd.entity.Camera;
import com.crowd.entity.Incident;
import com.crowd.exception.MlServiceUnavailableException;
import com.crowd.exception.ResourceNotFoundException;
import com.crowd.repository.CameraRepository;
import com.crowd.repository.IncidentRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final CameraRepository cameraRepository;
    private final MlServiceClient mlServiceClient;
    private final WebSocketService webSocketService;

    @Transactional(readOnly = true)
    public List<IncidentDto> getAllIncidents() {
        return incidentRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncidentDto getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with ID: " + id));
        return mapToDto(incident);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with ID: " + id));
        incidentRepository.delete(incident);
    }

    @Transactional
    public IncidentDto analyzeVideoAndSaveIncident(AnalyzeRequest request) {
        Camera camera = cameraRepository.findById(request.getCameraId())
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with ID: " + request.getCameraId()));

        // Invoke external Python ML Service
        MlAnalysisResponse mlResponse;
        try {
            mlResponse = mlServiceClient.analyzeDemo();
        } catch (FeignException e) {
            log.error("ML service unavailable: {}", e.getMessage());
            throw new MlServiceUnavailableException("ML service is unavailable", e);
        }

        // Map ML analysis fields to determine incident properties
        String incidentType = determineIncidentType(mlResponse);

        Incident incident = Incident.builder()
                .camera(camera)
                .incidentType(incidentType)
                .alertLevel(mlResponse.getAlertLevel())
                .peopleCount(mlResponse.getPeopleCount())
                .densityScore(mlResponse.getDensityScore())
                .fightDetected(mlResponse.getFightDetected())
                .stampedeDetected(mlResponse.getStampedeDetected())
                .timestamp(LocalDateTime.now())
                .build();

        Incident savedIncident = incidentRepository.save(incident);
        
        webSocketService.sendIncidentUpdate(savedIncident);
        if (mlResponse.getMessage() != null) {
            webSocketService.sendAlert(mlResponse.getMessage());
        }

        return mapToDto(savedIncident);
    }

    private String determineIncidentType(MlAnalysisResponse response) {
        boolean fight = response.getFightDetected() != null && response.getFightDetected();
        boolean stampede = response.getStampedeDetected() != null && response.getStampedeDetected();
        int density = response.getDensityScore() != null ? response.getDensityScore() : 0;

        if (fight && stampede) {
            return "FIGHT_AND_STAMPEDE";
        } else if (fight) {
            return "FIGHT";
        } else if (stampede) {
            return "STAMPEDE";
        } else if (density > 70) {
            return "CROWD_CONGESTION";
        } else {
            return "NORMAL";
        }
    }

    private IncidentDto mapToDto(Incident incident) {
        return IncidentDto.builder()
                .id(incident.getId())
                .cameraId(incident.getCamera().getId())
                .cameraName(incident.getCamera().getCameraName())
                .incidentType(incident.getIncidentType())
                .alertLevel(incident.getAlertLevel())
                .peopleCount(incident.getPeopleCount())
                .densityScore(incident.getDensityScore())
                .fightDetected(incident.getFightDetected())
                .stampedeDetected(incident.getStampedeDetected())
                .timestamp(incident.getTimestamp())
                .build();
    }
}
