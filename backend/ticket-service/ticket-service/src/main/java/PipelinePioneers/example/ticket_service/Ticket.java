package PipelinePioneers.example.ticket_service;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @Column(nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "route_name", nullable = false) // Ensure this is not null
    private String routeName;

    @Column(name = "travel_date_time", nullable = false)
    private LocalDateTime travelDateTime;

    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status; // e.g., BOOKED, CANCELLED
}
