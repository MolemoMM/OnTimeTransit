package PipelinePioneers.example.route_service;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "route")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String startPoint;
    private String endPoint;
    private String intermediateStops;
    private double distance;
    private String estimatedTravelTime;
}
