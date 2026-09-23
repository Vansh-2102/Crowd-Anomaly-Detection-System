package com.crowd.service;

import com.crowd.dto.CameraDto;
import com.crowd.entity.Camera;
import com.crowd.exception.ResourceNotFoundException;
import com.crowd.repository.CameraRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CameraService {

    private final CameraRepository cameraRepository;
    private final com.crowd.repository.IncidentRepository incidentRepository;

    public CameraService(CameraRepository cameraRepository, com.crowd.repository.IncidentRepository incidentRepository) {
        this.cameraRepository = cameraRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public CameraDto createCamera(CameraDto cameraDto) {
        Camera camera = Camera.builder()
                .cameraName(cameraDto.getName())  // frontend sends "name" to entity cameraName
                .rtspUrl(cameraDto.getRtspUrl())
                .location(cameraDto.getLocation())
                .status(cameraDto.getStatus())
                .build();

        Camera savedCamera = cameraRepository.save(camera);
        return mapToDto(savedCamera);
    }

    @Transactional(readOnly = true)
    public Page<CameraDto> getAllCameras(Pageable pageable) {
        return cameraRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public CameraDto getCameraById(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with ID: " + id));
        return mapToDto(camera);
    }

    @Transactional
    public CameraDto updateCamera(Long id, CameraDto cameraDto) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with ID: " + id));

        camera.setCameraName(cameraDto.getName());
        camera.setRtspUrl(cameraDto.getRtspUrl());
        camera.setLocation(cameraDto.getLocation());
        camera.setStatus(cameraDto.getStatus());

        Camera updatedCamera = cameraRepository.save(camera);
        return mapToDto(updatedCamera);
    }

    @Transactional
    public void deleteCamera(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with ID: " + id));
        incidentRepository.deleteByCameraId(id);
        cameraRepository.delete(camera);
    }

    private CameraDto mapToDto(Camera camera) {
        return CameraDto.builder()
                .id(camera.getId())
                .name(camera.getCameraName())  // entity cameraName -> dto name
                .rtspUrl(camera.getRtspUrl())
                .location(camera.getLocation())
                .status(camera.getStatus())
                .createdAt(camera.getCreatedAt())
                .updatedAt(camera.getUpdatedAt())
                .build();
    }
}
