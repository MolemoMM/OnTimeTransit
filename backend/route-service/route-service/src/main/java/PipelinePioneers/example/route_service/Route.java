package PipelinePioneers.example.route_service;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "route") // Revert to original table name
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String startPoint;

    @Column(nullable = false)
    private String endPoint;

    @Column(columnDefinition = "TEXT")
    private String intermediateStops;

    @Column(nullable = false)
    private double distance;

    @Column(nullable = false)
    private String estimatedTravelTime;
}
