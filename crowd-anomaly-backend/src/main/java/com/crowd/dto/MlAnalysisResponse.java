package com.crowd.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlAnalysisResponse {

    @JsonProperty("camera_id")
    private String cameraId;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("people_count")
    private Integer peopleCount;

    @JsonProperty("density_score")
    private Integer densityScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("fight_detected")
    private Boolean fightDetected;

    @JsonProperty("fight_confidence")
    private Double fightConfidence;

    @JsonProperty("stampede")
    private Boolean stampedeDetected;

    @JsonProperty("speed")
    private Double speed;

    @JsonProperty("alert_level")
    private String alertLevel;

    @JsonProperty("message")
    private String message;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("frame")
    private String frame;
}
