package PipelinePioneers.example.ticket_service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.IntStream;

@Service
public class TicketService {
    private final TicketRepository repository;
    private final TicketStatusHistoryRepository historyRepository;

    public TicketService(TicketRepository repository, TicketStatusHistoryRepository historyRepository) {
        this.repository = repository;
        this.historyRepository = historyRepository;
    }

    // Fetch all tickets
    public List<Ticket> getAllTickets() {
        return repository.findAll();
    }

    // Book a ticket
    public Ticket bookTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.PENDING); // Default status is PENDING
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

    // Cancel a ticket (user action)
    public void cancelTicket(Long ticketId) {
        Ticket ticket = repository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(TicketStatus.CANCELED);
        ticket.setUpdatedBy("USER");
        repository.save(ticket);
        
        // Record status change
        recordStatusChange(ticketId, oldStatus, TicketStatus.CANCELED, 0L, "USER", "Ticket canceled by user");
    }

    // Update ticket status (admin action)
    public Ticket updateTicketStatus(Long ticketId, TicketStatusUpdateRequest request, Long adminUserId) {
        Ticket ticket = repository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        TicketStatus oldStatus = ticket.getStatus();
        
        ticket.setStatus(request.getStatus());
        ticket.setUpdatedBy(request.getUpdatedBy());
        Ticket updatedTicket = repository.save(ticket);
        
        // Record status change in history
        recordStatusChange(ticketId, oldStatus, request.getStatus(), adminUserId, "ADMIN", request.getReason());
        
        return updatedTicket;
    }

    // Bulk update ticket statuses
    public List<Ticket> bulkUpdateTicketStatus(List<Long> ticketIds, TicketStatusUpdateRequest request, Long adminUserId) {
        List<Ticket> tickets = repository.findAllById(ticketIds);
        
        for (Ticket ticket : tickets) {
            TicketStatus oldStatus = ticket.getStatus();
            ticket.setStatus(request.getStatus());
            ticket.setUpdatedBy(request.getUpdatedBy());
            
            // Record status change in history
            recordStatusChange(ticket.getId(), oldStatus, request.getStatus(), adminUserId, "ADMIN", request.getReason());
        }
        
        return repository.saveAll(tickets);
    }

    // Get tickets by user ID
    public List<Ticket> getTicketsByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get ticket statistics
    public Map<String, Object> getTicketStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", repository.count());
        stats.put("pending", repository.countByStatus(TicketStatus.PENDING));
        stats.put("confirmed", repository.countByStatus(TicketStatus.CONFIRMED));
        stats.put("canceled", repository.countByStatus(TicketStatus.CANCELED));
        return stats;
    }

    // Get status history for a ticket
    public List<TicketStatusHistory> getTicketStatusHistory(Long ticketId) {
        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    // Delete a ticket
    public void deleteTicket(Long id) {
        repository.deleteById(id);
    }

    // Private method to record status changes
    private void recordStatusChange(Long ticketId, TicketStatus oldStatus, TicketStatus newStatus, Long adminUserId, String role, String reason) {
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicketId(ticketId);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedByUserId(adminUserId);
        history.setChangedByRole(role);
        history.setChangeReason(reason);
        historyRepository.save(history);
    }
}
