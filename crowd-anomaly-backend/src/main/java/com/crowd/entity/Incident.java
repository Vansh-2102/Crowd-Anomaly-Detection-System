package com.crowd.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "camera_id", nullable = false)
    private Camera camera;

    @Column(name = "incident_type")
    private String incidentType;

    @Column(name = "alert_level")
    private String alertLevel;

    @Column(name = "people_count")
    private Integer peopleCount;

    @Column(name = "density_score")
    private Integer densityScore;

    @Column(name = "fight_detected")
    private Boolean fightDetected;

    @Column(name = "stampede_detected")
    private Boolean stampedeDetected;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
