package com.crowd.controller;

import com.crowd.dto.MlAnalysisResponse;
import com.crowd.entity.Incident;
import com.crowd.service.MlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@Tag(name = "ML Integration", description = "Endpoints for ML service integration")
public class MlController {

    private final MlService mlService;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CameraAnalysisResponse {
        private Incident incident;
        private MlAnalysisResponse mlResponse;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze using ML demo endpoint")
    public ResponseEntity<MlAnalysisResponse> analyzeDemo() {
        return ResponseEntity.ok(mlService.analyzeDemo());
    }

    @PostMapping("/analyze-camera")
    @Operation(summary = "Analyze camera and save incident")
    public ResponseEntity<CameraAnalysisResponse> analyzeCamera(@RequestParam Long cameraId) {
        return ResponseEntity.ok(mlService.analyzeCameraWithFrame(cameraId));
    }
}
