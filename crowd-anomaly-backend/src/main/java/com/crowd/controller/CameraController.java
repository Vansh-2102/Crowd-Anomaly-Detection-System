package com.crowd.controller;

import com.crowd.dto.CameraDto;
import com.crowd.service.CameraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cameras")
@Tag(name = "Camera Management", description = "Endpoints for managing camera registry configurations (Secured)")
@SecurityRequirement(name = "Bearer Authentication")
public class CameraController {

    private final CameraService cameraService;

    public CameraController(CameraService cameraService) {
        this.cameraService = cameraService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a camera", description = "Registers a new CCTV/IP camera feed. Restricted to ADMIN users.")
    public ResponseEntity<CameraDto> createCamera(@Valid @RequestBody CameraDto cameraDto) {
        CameraDto response = cameraService.createCamera(cameraDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "List all cameras", description = "Retrieves all registered cameras in the system.")
    public ResponseEntity<Page<CameraDto>> getAllCameras(@PageableDefault(size = 100) Pageable pageable) {
        Page<CameraDto> response = cameraService.getAllCameras(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Get camera details", description = "Retrieves configurations for a specific camera ID.")
    public ResponseEntity<CameraDto> getCameraById(@PathVariable Long id) {
        CameraDto response = cameraService.getCameraById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update camera configuration", description = "Updates settings for an existing camera. Restricted to ADMIN users.")
    public ResponseEntity<CameraDto> updateCamera(@PathVariable Long id, @Valid @RequestBody CameraDto cameraDto) {
        CameraDto response = cameraService.updateCamera(id, cameraDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "De-register a camera", description = "Deletes a camera config from registry database. Restricted to ADMIN users.")
    public ResponseEntity<Void> deleteCamera(@PathVariable Long id) {
        cameraService.deleteCamera(id);
        return ResponseEntity.noContent().build();
    }
}
