package PipelinePioneers.example.ticket_service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class TicketService {
    private final TicketRepository repository;

    public TicketService(TicketRepository repository) {
        this.repository = repository;
    }

    // Fetch all tickets
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    // Book a ticket
    public Ticket bookTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.BOOKED); // Default status is BOOKED
        return repository.save(ticket);
    }

    // Fetch tickets by routeName and travelDateTime
    public List<Ticket> getTicketsByRouteAndDate(String routeName, LocalDateTime travelDateTime) {
        return repository.findByRouteNameAndTravelDateTime(routeName, travelDateTime);
    }

    // Check seat availability
    public List<Integer> getAvailableSeats(String routeName, LocalDateTime travelDateTime) {
        List<Integer> bookedSeats = repository.findBookedSeats(routeName, travelDateTime);
        return IntStream.rangeClosed(1, 50).filter(seat -> !bookedSeats.contains(seat)).boxed().toList();
    }

    public void cancelTicket(Long ticketId) {
        Ticket ticket = repository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(TicketStatus.CANCELLED);
        repository.save(ticket);
    }

    public void deleteTicket(Long id) {
        repository.deleteById(id);
    }
    
}
