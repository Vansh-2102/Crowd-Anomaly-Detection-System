package com.crowd.service;

import com.crowd.client.MlServiceClient;
import com.crowd.dto.AnalyzeRequest;
import com.crowd.dto.IncidentDto;
import com.crowd.dto.MlAnalysisResponse;
import com.crowd.entity.Camera;
import com.crowd.entity.Incident;
import com.crowd.exception.ResourceNotFoundException;
import com.crowd.repository.CameraRepository;
import com.crowd.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private CameraRepository cameraRepository;

    @Mock
    private MlServiceClient mlServiceClient;

    @Mock
    private WebSocketService webSocketService;

    @InjectMocks
    private IncidentService incidentService;

    private Camera camera;
    private Incident incident;
    private MlAnalysisResponse mlResponse;
    private AnalyzeRequest analyzeRequest;

    @BeforeEach
    void setUp() {
        camera = Camera.builder()
                .id(1L)
                .cameraName("West Gate")
                .rtspUrl("rtsp://example.com/stream2")
                .location("Building C")
                .status("ACTIVE")
                .build();

        incident = Incident.builder()
                .id(1L)
                .camera(camera)
                .incidentType("FIGHT")
                .alertLevel("ORANGE")
                .peopleCount(100)
                .densityScore(88)
                .fightDetected(true)
                .stampedeDetected(false)
                .timestamp(LocalDateTime.now())
                .build();

        mlResponse = MlAnalysisResponse.builder()
                .peopleCount(100)
                .densityScore(88)
                .riskLevel("DANGER")
                .fightDetected(true)
                .stampedeDetected(false)
                .alertLevel("ORANGE")
                .message("Fight detected!")
                .build();

        analyzeRequest = AnalyzeRequest.builder()
                .cameraId(1L)
                .build();
    }

    @Test
    void getAllIncidents_ShouldReturnListSortedByTimestamp() {
        when(incidentRepository.findAllByOrderByTimestampDesc()).thenReturn(List.of(incident));

        List<IncidentDto> result = incidentService.getAllIncidents();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("FIGHT", result.get(0).getIncidentType());
        assertEquals("West Gate", result.get(0).getCameraName());
    }

    @Test
    void getIncidentById_ShouldReturnDto_WhenIncidentExists() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        IncidentDto result = incidentService.getIncidentById(1L);

        assertNotNull(result);
        assertEquals("FIGHT", result.getIncidentType());
    }

    @Test
    void getIncidentById_ShouldThrowException_WhenIncidentDoesNotExist() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incidentService.getIncidentById(1L));
    }

    @Test
    void deleteIncident_ShouldDelete_WhenIncidentExists() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        doNothing().when(incidentRepository).delete(incident);

        incidentService.deleteIncident(1L);

        verify(incidentRepository, times(1)).delete(incident);
    }

    @Test
    void deleteIncident_ShouldThrowException_WhenIncidentDoesNotExist() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incidentService.deleteIncident(1L));
        verify(incidentRepository, never()).delete(any(Incident.class));
    }

    @Test
    void analyzeVideoAndSaveIncident_ShouldCallMLServiceAndSaveIncident() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.of(camera));
        when(mlServiceClient.analyzeDemo()).thenReturn(mlResponse);
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);
        doNothing().when(webSocketService).sendIncidentUpdate(any(Incident.class));
        doNothing().when(webSocketService).sendAlert(any(String.class));

        IncidentDto result = incidentService.analyzeVideoAndSaveIncident(analyzeRequest);

        assertNotNull(result);
        assertEquals("FIGHT", result.getIncidentType());
        assertEquals("ORANGE", result.getAlertLevel());
        assertEquals(100, result.getPeopleCount());
        assertEquals(88, result.getDensityScore());
        assertTrue(result.getFightDetected());
        assertFalse(result.getStampedeDetected());

        verify(cameraRepository, times(1)).findById(1L);
        verify(mlServiceClient, times(1)).analyzeDemo();
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    @Test
    void analyzeVideoAndSaveIncident_ShouldThrowException_WhenCameraDoesNotExist() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incidentService.analyzeVideoAndSaveIncident(analyzeRequest));
        verify(mlServiceClient, never()).analyzeDemo();
        verify(incidentRepository, never()).save(any(Incident.class));
    }
}
