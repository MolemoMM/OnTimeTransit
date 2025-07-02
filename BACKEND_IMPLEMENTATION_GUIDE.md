# Backend Implementation Testing Guide

## Overview
This document provides a comprehensive guide to test all the backend changes implemented for the enhanced ticket status management system.

## Services Updated

### 1. Ticket Service (Port: 8087)
**Location**: `backend/ticket-service/ticket-service/`

#### Changes Implemented:
- ✅ Updated `TicketStatus` enum: `PENDING`, `CONFIRMED`, `CANCELED`
- ✅ Enhanced `Ticket` entity with audit fields (`userId`, `createdAt`, `updatedAt`, `updatedBy`)
- ✅ Created `TicketStatusHistory` entity for audit trail
- ✅ Added `TicketStatusUpdateRequest` DTO
- ✅ Enhanced `TicketController` with new endpoints
- ✅ Updated `TicketService` with status management and bulk operations
- ✅ Enhanced `TicketRepository` with new query methods
- ✅ Updated `SecurityConfig` for role-based access control

#### New API Endpoints:

1. **Get User Tickets**
   ```
   GET /api/tickets/user/{userId}
   Response: List of tickets for the user
   ```

2. **Update Ticket Status (Admin Only)**
   ```
   PUT /api/tickets/{id}/status
   Headers: User-Id: {adminUserId}
   Body: {
     "status": "CONFIRMED|PENDING|CANCELED",
     "reason": "Status change reason",
     "updatedBy": "Admin Name"
   }
   ```

3. **Bulk Update Ticket Status (Admin Only)**
   ```
   PUT /api/tickets/bulk-status
   Headers: User-Id: {adminUserId}
   Body: {
     "ticketIds": [1, 2, 3],
     "status": "CONFIRMED",
     "reason": "Bulk confirmation",
     "updatedBy": "Admin Name"
   }
   ```

4. **Get Ticket Statistics (Admin Only)**
   ```
   GET /api/tickets/statistics
   Response: {
     "total": 100,
     "pending": 25,
     "confirmed": 65,
     "canceled": 10
   }
   ```

5. **Get Ticket Status History**
   ```
   GET /api/tickets/{id}/history
   Response: List of status change history for the ticket
   ```

### 2. User Service (Port: 8085)
**Location**: `backend/user-service/user-service/`

#### Changes Implemented:
- ✅ Added `UserRole` enum: `USER`, `ADMIN`
- ✅ Enhanced `User` entity with role field
- ✅ Updated `UserController` with role-based operations
- ✅ Enhanced `UserRepository` with role statistics

#### Enhanced API Endpoints:

1. **Login (Enhanced with Role)**
   ```
   POST /api/users/login
   Body: {
     "username": "admin",
     "password": "password"
   }
   Response: {
     "id": 1,
     "username": "admin",
     "email": "admin@example.com",
     "role": "ADMIN",
     "phoneNumber": "1234567890"
   }
   ```

2. **Get User Statistics (Admin Only)**
   ```
   GET /api/users/statistics
   Response: {
     "total": 50,
     "admins": 2,
     "users": 48
   }
   ```

## Database Schema Changes

### New Tables Created:
1. **ticket_status_history** - Audit trail for ticket status changes

### Modified Tables:
1. **tickets** - Added `user_id`, `created_at`, `updated_at`, `updated_by` columns
2. **user** - Added `role` column

### SQL Migration Script:
Run the provided `database_schema_updates.sql` script to apply all database changes.

## Testing Steps

### Prerequisites
1. **Start all services:**
   ```bash
   # Start ticket service
   cd backend/ticket-service/ticket-service
   ./mvnw spring-boot:run

   # Start user service  
   cd backend/user-service/user-service
   ./mvnw spring-boot:run

   # Start other services as needed
   ```

2. **Apply database changes:**
   ```sql
   -- Run the database_schema_updates.sql script
   ```

### Test Scenarios

#### 1. User Authentication & Role Management
```bash
# Test user registration
curl -X POST http://localhost:8085/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password", "email": "user@test.com", "phoneNumber": "1234567890"}'

# Test admin registration
curl -X POST http://localhost:8085/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin", "email": "admin@test.com", "phoneNumber": "0987654321", "role": "ADMIN"}'

# Test login
curl -X POST http://localhost:8085/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

#### 2. Ticket Operations

```bash
# Book a ticket
curl -X POST http://localhost:8087/api/tickets/book \
  -H "Content-Type: application/json" \
  -d '{
    "passengerName": "John Doe",
    "email": "john@test.com",
    "phoneNumber": "1234567890",
    "routeName": "Route A",
    "travelDateTime": "2025-07-15T10:00:00",
    "seatNumber": 1,
    "price": 50.0,
    "userId": 1
  }'

# Get user tickets
curl -X GET http://localhost:8087/api/tickets/user/1

# Update ticket status (Admin)
curl -X PUT http://localhost:8087/api/tickets/1/status \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{
    "status": "CONFIRMED",
    "reason": "Payment verified",
    "updatedBy": "Admin"
  }'

# Bulk update tickets (Admin)
curl -X PUT http://localhost:8087/api/tickets/bulk-status \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{
    "ticketIds": [1, 2, 3],
    "status": "CONFIRMED",
    "reason": "Bulk confirmation",
    "updatedBy": "Admin"
  }'

# Get ticket statistics
curl -X GET http://localhost:8087/api/tickets/statistics

# Get ticket history
curl -X GET http://localhost:8087/api/tickets/1/history
```

### Expected Results

#### Frontend Integration Points
The frontend should now be able to:

1. **Admin Dashboard:**
   - ✅ View all tickets with new status options
   - ✅ Update individual ticket status
   - ✅ Perform bulk status updates
   - ✅ View real-time statistics
   - ✅ Access audit trail/history

2. **User Dashboard:**
   - ✅ View their own tickets with color-coded status
   - ✅ See real-time status updates
   - ✅ Request ticket cancellation

#### Database Verification
Check that the following data is being stored correctly:

1. **Tickets table** has new columns and proper status values
2. **ticket_status_history** table records all status changes
3. **user table** has role information

## Security Features Implemented

1. **Role-based Access Control:**
   - Admin-only endpoints are protected
   - Users can only access their own tickets
   - CORS enabled for frontend integration

2. **Audit Trail:**
   - All status changes are logged
   - Who changed what and when is recorded
   - Change reasons are captured

## Performance Considerations

1. **Database Indexes** added for:
   - ticket status
   - user_id in tickets
   - route_name and travel_date_time combination

2. **Optimized Queries:**
   - Bulk operations to reduce database hits
   - Efficient filtering and searching

## Troubleshooting

### Common Issues:

1. **Compilation Errors:**
   ```bash
   cd backend/ticket-service/ticket-service
   ./mvnw clean compile
   ```

2. **Database Connection:**
   - Check environment variables in application.properties
   - Verify PostgreSQL is running

3. **Port Conflicts:**
   - Ticket Service: 8087
   - User Service: 8085
   - Ensure ports are available

### Success Indicators:

✅ All services start without errors  
✅ Database schema is updated  
✅ API endpoints respond correctly  
✅ Frontend can communicate with backend  
✅ Role-based access works  
✅ Audit trail is populated  
✅ Status updates work in real-time  

## Next Steps

1. **Deploy Services:** Deploy all updated services to your environment
2. **Frontend Testing:** Test the complete frontend-backend integration
3. **User Acceptance:** Conduct end-to-end testing with users
4. **Production Deployment:** Deploy to production environment

## Support

If you encounter any issues:
1. Check the service logs for error messages
2. Verify database connectivity
3. Ensure all dependencies are correctly configured
4. Test individual endpoints using the provided curl commands

The backend implementation is now complete and ready for integration with the modernized frontend! 🚀
