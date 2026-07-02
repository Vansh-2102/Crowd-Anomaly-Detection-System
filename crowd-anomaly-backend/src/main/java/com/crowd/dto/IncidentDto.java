package com.crowd.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentDto {
    private Long id;
    private Long cameraId;
    private String cameraName;
    private String incidentType;
    private String alertLevel;
    private Integer peopleCount;
    private Integer densityScore;
    private Boolean fightDetected;
    private Boolean stampedeDetected;
    private LocalDateTime timestamp;
}
