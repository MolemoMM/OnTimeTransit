package PipelinePioneers.example.ticket_service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    // Book a ticket
    @PostMapping("/book")
    public ResponseEntity<Ticket> bookTicket(@RequestBody Ticket ticket) {
        if (ticket.getRouteName() == null || ticket.getRouteName().isEmpty()) {
            throw new IllegalArgumentException("Route name is required");
        }

        Ticket bookedTicket = service.bookTicket(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookedTicket);
    }

    // Fetch all tickets or filter by routeName and travelDateTime
    @GetMapping
    public List<Ticket> getTickets(
            @RequestParam(required = false) String routeName,
            @RequestParam(required = false) String travelDateTime) {
        if (routeName != null && travelDateTime != null) {
            return service.getTicketsByRouteAndDate(routeName, LocalDateTime.parse(travelDateTime));
        }
        return service.getAllTickets();
    }

    // Get tickets for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable Long userId) {
        List<Ticket> tickets = service.getTicketsByUserId(userId);
        return ResponseEntity.ok(tickets);
    }

    // Cancel a ticket (user action)
    @PutMapping("/cancel/{id}")
    public ResponseEntity<Void> cancelTicket(@PathVariable Long id) {
        service.cancelTicket(id);
        return ResponseEntity.noContent().build();
    }

    // Update ticket status (admin only)
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody TicketStatusUpdateRequest request,
            @RequestHeader(value = "User-Id", required = false) Long adminUserId) {
        
        if (adminUserId == null) {
            adminUserId = 1L; // Default admin user for now
        }
        
        Ticket updatedTicket = service.updateTicketStatus(id, request, adminUserId);
        return ResponseEntity.ok(updatedTicket);
    }

    // Bulk update ticket statuses (admin only)
    @PutMapping("/bulk-status")
    public ResponseEntity<List<Ticket>> bulkUpdateTicketStatus(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "User-Id", required = false) Long adminUserId) {
        
        if (adminUserId == null) {
            adminUserId = 1L; // Default admin user for now
        }
        
        @SuppressWarnings("unchecked")
        List<Long> ticketIds = (List<Long>) request.get("ticketIds");
        TicketStatusUpdateRequest statusRequest = new TicketStatusUpdateRequest();
        statusRequest.setStatus(TicketStatus.valueOf((String) request.get("status")));
        statusRequest.setReason((String) request.get("reason"));
        statusRequest.setUpdatedBy((String) request.get("updatedBy"));
        
        List<Ticket> updatedTickets = service.bulkUpdateTicketStatus(ticketIds, statusRequest, adminUserId);
        return ResponseEntity.ok(updatedTickets);
    }

    // Get ticket statistics (admin only)
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getTicketStatistics() {
        Map<String, Object> stats = service.getTicketStatistics();
        return ResponseEntity.ok(stats);
    }

    // Get status history for a ticket
    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketStatusHistory>> getTicketStatusHistory(@PathVariable Long id) {
        List<TicketStatusHistory> history = service.getTicketStatusHistory(id);
        return ResponseEntity.ok(history);
    }

    // Get available seats
    @GetMapping("/available-seats")
    public List<Integer> getAvailableSeats(
            @RequestParam String routeName,
            @RequestParam String travelDateTime) {
        return service.getAvailableSeats(routeName, LocalDateTime.parse(travelDateTime));
    }

    // Delete a ticket (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        service.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
