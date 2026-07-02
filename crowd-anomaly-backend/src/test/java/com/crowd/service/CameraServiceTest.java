package com.crowd.service;

import com.crowd.dto.CameraDto;
import com.crowd.entity.Camera;
import com.crowd.exception.ResourceNotFoundException;
import com.crowd.repository.CameraRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CameraServiceTest {

    @Mock
    private CameraRepository cameraRepository;

    @InjectMocks
    private CameraService cameraService;

    private Camera camera;
    private CameraDto cameraDto;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        camera = Camera.builder()
                .id(1L)
                .cameraName("Main Entrance")
                .rtspUrl("rtsp://example.com/stream1")
                .location("Building A")
                .status("ACTIVE")
                .build();

        cameraDto = CameraDto.builder()
                .name("Main Entrance")
                .rtspUrl("rtsp://example.com/stream1")
                .location("Building A")
                .status("ACTIVE")
                .build();

        pageable = PageRequest.of(0, 10);
    }

    @Test
    void createCamera_ShouldSaveAndReturnCameraDto() {
        when(cameraRepository.save(any(Camera.class))).thenReturn(camera);

        CameraDto result = cameraService.createCamera(cameraDto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Main Entrance", result.getName());
        verify(cameraRepository, times(1)).save(any(Camera.class));
    }

    @Test
    void getAllCameras_ShouldReturnPage() {
        Page<Camera> cameraPage = new PageImpl<>(List.of(camera));
        when(cameraRepository.findAll(any(Pageable.class))).thenReturn(cameraPage);

        Page<CameraDto> result = cameraService.getAllCameras(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Main Entrance", result.getContent().get(0).getName());
    }

    @Test
    void getCameraById_ShouldReturnDto_WhenCameraExists() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.of(camera));

        CameraDto result = cameraService.getCameraById(1L);

        assertNotNull(result);
        assertEquals("Main Entrance", result.getName());
    }

    @Test
    void getCameraById_ShouldThrowException_WhenCameraDoesNotExist() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cameraService.getCameraById(1L));
    }

    @Test
    void updateCamera_ShouldUpdateAndReturnDto_WhenCameraExists() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.of(camera));
        when(cameraRepository.save(any(Camera.class))).thenReturn(camera);

        CameraDto updateDto = CameraDto.builder()
                .name("Updated Name")
                .rtspUrl("rtsp://updated.com")
                .location("Building B")
                .status("INACTIVE")
                .build();

        CameraDto result = cameraService.updateCamera(1L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("Building B", result.getLocation());
        verify(cameraRepository, times(1)).save(camera);
    }

    @Test
    void deleteCamera_ShouldDelete_WhenCameraExists() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.of(camera));
        doNothing().when(cameraRepository).delete(camera);

        cameraService.deleteCamera(1L);

        verify(cameraRepository, times(1)).delete(camera);
    }

    @Test
    void deleteCamera_ShouldThrowException_WhenCameraDoesNotExist() {
        when(cameraRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cameraService.deleteCamera(1L));
        verify(cameraRepository, never()).delete(any(Camera.class));
    }
}
