package com.crowd.controller;

import com.crowd.config.SecurityConfig;
import com.crowd.dto.CameraDto;
import com.crowd.security.CustomUserDetailsService;
import com.crowd.security.JwtTokenProvider;
import com.crowd.service.CameraService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CameraController.class)
@Import(SecurityConfig.class)
class CameraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CameraService cameraService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private CameraDto cameraDto;

    @BeforeEach
    void setUp() {
        cameraDto = CameraDto.builder()
                .id(1L)
                .name("Main Lobby")
                .rtspUrl("rtsp://example.com/lobby")
                .location("Building C")
                .status("ACTIVE")
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCamera_ShouldReturnCreated_WhenUserIsAdmin() throws Exception {
        when(cameraService.createCamera(any(CameraDto.class))).thenReturn(cameraDto);

        mockMvc.perform(post("/api/cameras")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cameraDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Main Lobby"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void createCamera_ShouldReturnForbidden_WhenUserIsOperator() throws Exception {
        mockMvc.perform(post("/api/cameras")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cameraDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void getAllCameras_ShouldReturnPage_WhenUserIsOperator() throws Exception {
        Page<CameraDto> cameraPage = new PageImpl<>(List.of(cameraDto));
        when(cameraService.getAllCameras(any())).thenReturn(cameraPage);

        mockMvc.perform(get("/api/cameras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Main Lobby"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCamera_ShouldReturnOk_WhenUserIsAdmin() throws Exception {
        when(cameraService.updateCamera(eq(1L), any(CameraDto.class))).thenReturn(cameraDto);

        mockMvc.perform(put("/api/cameras/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cameraDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Main Lobby"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCamera_ShouldReturnNoContent_WhenUserIsAdmin() throws Exception {
        doNothing().when(cameraService).deleteCamera(1L);

        mockMvc.perform(delete("/api/cameras/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getAllCameras_ShouldReturnUnauthorized_WhenUserNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/cameras"))
                .andExpect(status().isUnauthorized());
    }
}
