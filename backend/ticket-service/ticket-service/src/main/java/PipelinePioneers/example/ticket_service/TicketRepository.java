package PipelinePioneers.example.ticket_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRouteNameAndTravelDateTime(String routeName, LocalDateTime travelDateTime);

    @Query("SELECT t.seatNumber FROM Ticket t WHERE t.routeName = :routeName AND t.travelDateTime = :travelDateTime AND t.status != 'CANCELED'")
    List<Integer> findBookedSeats(@Param("routeName") String routeName, @Param("travelDateTime") LocalDateTime travelDateTime);

    // Find tickets by user ID
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    // Count tickets by status
    long countByStatus(TicketStatus status);

    // Find tickets by multiple statuses
    @Query("SELECT t FROM Ticket t WHERE t.status IN :statuses")
    List<Ticket> findByStatusIn(@Param("statuses") List<TicketStatus> statuses);
}
