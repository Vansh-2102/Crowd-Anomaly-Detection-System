package com.crowd.repository;

import com.crowd.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findAllByOrderByTimestampDesc();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.alertLevel IN ('YELLOW', 'ORANGE', 'RED', 'DANGER', 'HIGH', 'WARNING') OR i.fightDetected = true OR i.stampedeDetected = true")
    long countActiveAlerts();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.alertLevel IN ('RED', 'DANGER', 'HIGH') OR i.stampedeDetected = true")
    long countCriticalAlerts();

    void deleteByCameraId(Long cameraId);
}
