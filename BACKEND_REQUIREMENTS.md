# Backend Changes Required for Ticket Status Management

## 1. Database Schema Updates

### Ticket Table Enhancement
```sql
-- Add additional columns if not already present
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status_history TEXT; -- JSON field to store status change history

-- Create index for better performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
```

### Status History Table (Optional - for audit trail)
```sql
CREATE TABLE ticket_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    changed_by_role VARCHAR(50) NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);
```

## 2. Ticket Service Endpoints

### Java Spring Boot Controller Updates

```java
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // NEW: Update ticket status (Admin only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody TicketStatusUpdateRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            Ticket updatedTicket = ticketService.updateTicketStatus(id, request.getStatus(), adminUsername, request.getReason());
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating ticket status: " + e.getMessage());
        }
    }

    // NEW: Get tickets for current user
    @GetMapping("/user/my-tickets")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getCurrentUserTickets(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<Ticket> userTickets = ticketService.getTicketsByUsername(username);
            return ResponseEntity.ok(userTickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // NEW: Get ticket status history
    @GetMapping("/{id}/status-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketStatusHistory>> getTicketStatusHistory(@PathVariable Long id) {
        try {
            List<TicketStatusHistory> history = ticketService.getTicketStatusHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // NEW: Get ticket counts for dashboard
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTicketCount() {
        try {
            Long count = ticketService.getTotalTicketCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(0L);
        }
    }

    // NEW: Get ticket analytics
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTicketAnalytics() {
        try {
            Map<String, Object> analytics = ticketService.getTicketAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<>());
        }
    }
}
```

### Request/Response DTOs

```java
// TicketStatusUpdateRequest.java
public class TicketStatusUpdateRequest {
    private String status; // "Pending", "Confirmed", "Canceled"
    private String reason; // Optional reason for status change
    
    // getters and setters
}

// TicketStatusHistory.java
@Entity
@Table(name = "ticket_status_history")
public class TicketStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "old_status")
    private String oldStatus;
    
    @Column(name = "new_status")
    private String newStatus;
    
    @Column(name = "changed_by_user_id")
    private Long changedByUserId;
    
    @Column(name = "changed_by_role")
    private String changedByRole;
    
    @Column(name = "change_reason")
    private String changeReason;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // constructors, getters, setters
}
```

## 3. Service Layer Implementation

```java
@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketStatusHistoryRepository statusHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public Ticket updateTicketStatus(Long ticketId, String newStatus, String adminUsername, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));
        
        String oldStatus = ticket.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(oldStatus, newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }
        
        // Update ticket
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedBy(adminUsername);
        
        // Save status history
        User admin = userRepository.findByUsername(adminUsername);
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicketId(ticketId);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedByUserId(admin.getId());
        history.setChangedByRole(admin.getRole());
        history.setChangeReason(reason);
        history.setCreatedAt(LocalDateTime.now());
        
        statusHistoryRepository.save(history);
        
        // Send notification to user
        notificationService.sendTicketStatusUpdateNotification(ticket, oldStatus, newStatus);
        
        return ticketRepository.save(ticket);
    }
    
    private boolean isValidStatusTransition(String oldStatus, String newStatus) {
        // Define valid status transitions
        Map<String, List<String>> validTransitions = Map.of(
            "Pending", List.of("Confirmed", "Canceled"),
            "Confirmed", List.of("Canceled"),
            "Canceled", List.of() // Cannot change from canceled
        );
        
        return validTransitions.getOrDefault(oldStatus, List.of()).contains(newStatus);
    }
    
    public List<Ticket> getTicketsByUsername(String username) {
        User user = userRepository.findByUsername(username);
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
    
    public Map<String, Object> getTicketAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Status distribution
        List<Object[]> statusCounts = ticketRepository.countByStatus();
        Map<String, Long> statusDistribution = statusCounts.stream()
            .collect(Collectors.toMap(
                arr -> (String) arr[0],
                arr -> (Long) arr[1]
            ));
        
        // Monthly trends
        List<Object[]> monthlyData = ticketRepository.getMonthlyTicketCounts();
        
        analytics.put("statusDistribution", statusDistribution);
        analytics.put("monthlyTrends", monthlyData);
        analytics.put("totalTickets", ticketRepository.count());
        
        return analytics;
    }
}
```

## 4. Repository Updates

```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT MONTH(t.createdAt), YEAR(t.createdAt), COUNT(t) FROM Ticket t " +
           "WHERE t.createdAt >= :startDate GROUP BY YEAR(t.createdAt), MONTH(t.createdAt) " +
           "ORDER BY YEAR(t.createdAt), MONTH(t.createdAt)")
    List<Object[]> getMonthlyTicketCounts(@Param("startDate") LocalDateTime startDate);
}

@Repository
public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {
    List<TicketStatusHistory> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
```

## 5. Notification Service Enhancement

```java
@Service
public class NotificationServiceImpl implements NotificationService {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WebSocketService webSocketService;
    
    public void sendTicketStatusUpdateNotification(Ticket ticket, String oldStatus, String newStatus) {
        // Send email notification
        String subject = "Ticket Status Update - " + ticket.getRouteName();
        String message = buildStatusUpdateMessage(ticket, oldStatus, newStatus);
        emailService.sendEmail(ticket.getEmail(), subject, message);
        
        // Send real-time WebSocket notification if user is online
        webSocketService.sendToUser(ticket.getUserId(), "TICKET_STATUS_UPDATE", Map.of(
            "ticketId", ticket.getId(),
            "oldStatus", oldStatus,
            "newStatus", newStatus,
            "message", getStatusMessage(newStatus)
        ));
    }
    
    private String buildStatusUpdateMessage(Ticket ticket, String oldStatus, String newStatus) {
        return String.format(
            "Hello %s,\n\n" +
            "Your ticket for %s has been updated:\n" +
            "Previous Status: %s\n" +
            "New Status: %s\n\n" +
            "Travel Date: %s\n" +
            "Seat Number: %s\n\n" +
            "%s\n\n" +
            "Best regards,\n" +
            "OnTimeTransit Team",
            ticket.getPassengerName(),
            ticket.getRouteName(),
            oldStatus,
            newStatus,
            ticket.getTravelDateTime(),
            ticket.getSeatNumber(),
            getStatusMessage(newStatus)
        );
    }
}
```

## 6. Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/tickets/*/status").hasRole("ADMIN")
                .requestMatchers("/api/tickets/user/my-tickets").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/tickets/analytics").hasRole("ADMIN")
                // ... other configurations
            );
        return http.build();
    }
}
```

## 7. WebSocket Configuration (for real-time updates)

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new TicketStatusWebSocketHandler(), "/ws/ticket-updates")
                .setAllowedOrigins("*");
    }
}
```

## Summary

### What this implementation provides:

1. **Admin Side:**
   - Update ticket status with dropdown selection
   - Bulk status updates for multiple tickets
   - Status change history and audit trail
   - Validation of status transitions
   - Real-time analytics updates

2. **User Side:**
   - Real-time ticket status viewing
   - Automatic status updates every 30 seconds
   - Status change notifications
   - Request cancellation functionality
   - Visual status indicators

3. **Database:**
   - Proper indexing for performance
   - Status history tracking
   - Audit trail maintenance

4. **Security:**
   - Role-based access control
   - Admin-only status updates
   - User can only view their own tickets

5. **Notifications:**
   - Email notifications on status changes
   - Real-time WebSocket updates
   - In-app notification system

This implementation ensures that when an admin updates ticket statuses, users see the changes immediately and receive appropriate notifications.
