package com.crowd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CameraDto {
    private Long id;

    // For API requests/responses (matches frontend's "name")
    @NotBlank(message = "Camera name is required")
    private String name;

    @NotBlank(message = "RTSP URL is required")
    private String rtspUrl;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Status is required")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Optional fields for ML analysis data
    private Integer peopleCount;
    private Double densityScore;
    private String alertLevel;
    private Boolean fightDetected;
    private Boolean stampedeDetected;
    private String lastAnalyzedAt;
}
