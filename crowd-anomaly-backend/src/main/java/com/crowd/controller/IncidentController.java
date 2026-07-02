package com.crowd.controller;

import com.crowd.dto.AnalyzeRequest;
import com.crowd.dto.IncidentDto;
import com.crowd.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incident Management", description = "Endpoints for viewing, deleting, and triggering incident video analysis (Secured)")
@SecurityRequirement(name = "Bearer Authentication")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "List all incidents", description = "Retrieves all logged incidents ordered by latest timestamp.")
    public ResponseEntity<List<IncidentDto>> getAllIncidents() {
        List<IncidentDto> response = incidentService.getAllIncidents();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Get incident details", description = "Retrieves information for a specific logged incident ID.")
    public ResponseEntity<IncidentDto> getIncidentById(@PathVariable Long id) {
        IncidentDto response = incidentService.getIncidentById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an incident", description = "Removes an incident log from the database. Restricted to ADMIN users.")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Trigger crowd analysis", description = "Contacts external Python ML service to analyze video feed of specified camera ID, logs any anomalies as an incident, and returns the result.")
    public ResponseEntity<IncidentDto> analyzeVideo(@Valid @RequestBody AnalyzeRequest request) {
        IncidentDto response = incidentService.analyzeVideoAndSaveIncident(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
