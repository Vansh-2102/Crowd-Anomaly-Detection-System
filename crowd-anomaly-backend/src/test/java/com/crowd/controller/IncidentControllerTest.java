package com.crowd.controller;

import com.crowd.config.SecurityConfig;
import com.crowd.dto.AnalyzeRequest;
import com.crowd.dto.IncidentDto;
import com.crowd.security.CustomUserDetailsService;
import com.crowd.security.JwtTokenProvider;
import com.crowd.service.IncidentService;
import com.crowd.service.WebSocketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentController.class)
@Import(SecurityConfig.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncidentService incidentService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private WebSocketService webSocketService;

    private IncidentDto incidentDto;
    private AnalyzeRequest analyzeRequest;

    @BeforeEach
    void setUp() {
        incidentDto = IncidentDto.builder()
                .id(1L)
                .cameraId(1L)
                .cameraName("West Gate")
                .incidentType("FIGHT")
                .alertLevel("ORANGE")
                .peopleCount(100)
                .densityScore(88)
                .fightDetected(true)
                .stampedeDetected(false)
                .timestamp(LocalDateTime.now())
                .build();

        analyzeRequest = AnalyzeRequest.builder()
                .cameraId(1L)
                .build();
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void getAllIncidents_ShouldReturnList_WhenUserIsOperator() throws Exception {
        when(incidentService.getAllIncidents()).thenReturn(List.of(incidentDto));

        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incidentType").value("FIGHT"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void getIncidentById_ShouldReturnDto_WhenIncidentExists() throws Exception {
        when(incidentService.getIncidentById(1L)).thenReturn(incidentDto);

        mockMvc.perform(get("/api/incidents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentType").value("FIGHT"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void deleteIncident_ShouldReturnForbidden_WhenUserIsOperator() throws Exception {
        mockMvc.perform(delete("/api/incidents/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteIncident_ShouldReturnNoContent_WhenUserIsAdmin() throws Exception {
        doNothing().when(incidentService).deleteIncident(1L);

        mockMvc.perform(delete("/api/incidents/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void analyzeVideo_ShouldReturnCreated_WhenUserIsOperator() throws Exception {
        when(incidentService.analyzeVideoAndSaveIncident(any(AnalyzeRequest.class))).thenReturn(incidentDto);

        mockMvc.perform(post("/api/incidents/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(analyzeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.incidentType").value("FIGHT"));
    }
}
