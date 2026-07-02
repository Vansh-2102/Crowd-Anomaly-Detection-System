package com.crowd.controller;

import com.crowd.config.SecurityConfig;
import com.crowd.dto.DashboardSummaryDto;
import com.crowd.security.CustomUserDetailsService;
import com.crowd.security.JwtTokenProvider;
import com.crowd.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import(SecurityConfig.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private DashboardSummaryDto dashboardSummaryDto;

    @BeforeEach
    void setUp() {
        // Build nested StatsDto first
        DashboardSummaryDto.StatsDto stats = DashboardSummaryDto.StatsDto.builder()
                .totalCameras(20)
                .activeCameras(18)
                .activeAlerts(5)
                .criticalAlerts(2)
                .totalIncidents(120)
                .todayIncidents(10)
                .build();

        dashboardSummaryDto = DashboardSummaryDto.builder()
                .stats(stats)
                .incidentTrends(List.of())
                .alertDistribution(List.of())
                .crowdDensity(List.of())
                .cameraStatus(List.of())
                .recentIncidents(List.of())
                .recentAlerts(List.of())
                .build();
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void getDashboardSummary_ShouldReturnSummary_WhenUserIsOperator() throws Exception {
        when(dashboardService.getDashboardSummary()).thenReturn(dashboardSummaryDto);

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.totalCameras").value(20))
                .andExpect(jsonPath("$.stats.activeCameras").value(18))
                .andExpect(jsonPath("$.stats.activeAlerts").value(5))
                .andExpect(jsonPath("$.stats.criticalAlerts").value(2))
                .andExpect(jsonPath("$.stats.totalIncidents").value(120));
    }

    @Test
    void getDashboardSummary_ShouldReturnUnauthorized_WhenUserNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}
