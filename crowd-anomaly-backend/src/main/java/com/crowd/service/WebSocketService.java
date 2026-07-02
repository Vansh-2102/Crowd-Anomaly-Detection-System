package com.crowd.service;

import com.crowd.entity.Incident;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendIncidentUpdate(Incident incident) {
        log.info("Sending incident update via WebSocket: {}", incident.getId());
        messagingTemplate.convertAndSend("/topic/incidents", incident);
    }

    public void sendAlert(String message) {
        log.info("Sending alert via WebSocket: {}", message);
        messagingTemplate.convertAndSend("/topic/alerts", message);
    }
}
