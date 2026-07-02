package com.crowd.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyzeRequest {
    @NotNull(message = "Camera ID is required")
    private Long cameraId;
}
