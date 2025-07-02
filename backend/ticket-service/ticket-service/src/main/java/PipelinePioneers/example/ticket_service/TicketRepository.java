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

    @Query("SELECT t.seatNumber FROM Ticket t WHERE t.routeName = :routeName AND t.travelDateTime = :travelDateTime")
    List<Integer> findBookedSeats(@Param("routeName") String routeName, @Param("travelDateTime") LocalDateTime travelDateTime);
}
