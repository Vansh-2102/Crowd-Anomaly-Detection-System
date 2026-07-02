package com.crowd.service;

import com.crowd.client.MlServiceClient;
import com.crowd.controller.MlController;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class MlService {

    private final MlServiceClient mlServiceClient;
    private final CameraRepository cameraRepository;
    private final IncidentRepository incidentRepository;
    private final WebSocketService webSocketService;

    public MlAnalysisResponse analyzeDemo() {
        try {
            log.info("Calling ML service demo endpoint");
            return mlServiceClient.analyzeDemo();
        } catch (FeignException e) {
            log.error("ML service unavailable: {}", e.getMessage());
            throw new MlServiceUnavailableException("ML service is unavailable", e);
        }
    }

    @Transactional
    public Incident analyzeAndSaveIncident(Long cameraId) {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + cameraId));

        MlAnalysisResponse mlResponse = analyzeDemo();

        Incident incident = Incident.builder()
                .camera(camera)
                .incidentType(determineIncidentType(mlResponse))
                .alertLevel(mlResponse.getAlertLevel())
                .peopleCount(mlResponse.getPeopleCount())
                .densityScore(mlResponse.getDensityScore())
                .fightDetected(mlResponse.getFightDetected())
                .stampedeDetected(mlResponse.getStampedeDetected())
                .timestamp(LocalDateTime.now())
                .build();

        log.info("Saving incident for camera: {}", cameraId);
        Incident savedIncident = incidentRepository.save(incident);
        
        webSocketService.sendIncidentUpdate(savedIncident);
        if (mlResponse.getMessage() != null) {
            webSocketService.sendAlert(mlResponse.getMessage());
        }

        return savedIncident;
    }

    @Transactional
    public MlController.CameraAnalysisResponse analyzeCameraWithFrame(Long cameraId) {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + cameraId));

        MlAnalysisResponse mlResponse = analyzeDemo();

        Incident incident = Incident.builder()
                .camera(camera)
                .incidentType(determineIncidentType(mlResponse))
                .alertLevel(mlResponse.getAlertLevel())
                .peopleCount(mlResponse.getPeopleCount())
                .densityScore(mlResponse.getDensityScore())
                .fightDetected(mlResponse.getFightDetected())
                .stampedeDetected(mlResponse.getStampedeDetected())
                .timestamp(LocalDateTime.now())
                .build();

        log.info("Saving incident for camera: {}", cameraId);
        Incident savedIncident = incidentRepository.save(incident);
        
        webSocketService.sendIncidentUpdate(savedIncident);
        if (mlResponse.getMessage() != null) {
            webSocketService.sendAlert(mlResponse.getMessage());
        }

        return MlController.CameraAnalysisResponse.builder()
                .incident(savedIncident)
                .mlResponse(mlResponse)
                .build();
    }

    private String determineIncidentType(MlAnalysisResponse response) {
        if (Boolean.TRUE.equals(response.getFightDetected())) {
            return "FIGHT";
        } else if (Boolean.TRUE.equals(response.getStampedeDetected())) {
            return "STAMPEDE";
        } else if (response.getDensityScore() != null && response.getDensityScore() > 80) {
            return "HIGH_DENSITY";
        }
        return "NORMAL";
    }
}
