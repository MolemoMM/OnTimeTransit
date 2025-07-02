package PipelinePioneers.example.ticket_service;

import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    private TicketStatus status;
    private String reason;
    private String updatedBy;
}
