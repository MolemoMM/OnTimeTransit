-- Database Schema Updates for Enhanced Ticket Management
-- Run this script to update your existing ticket database

-- 1. Update the tickets table to add new columns
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- 2. Update the user table to add role column
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';

-- 3. Update existing ticket statuses from old enum values to new ones
UPDATE tickets SET status = 'PENDING' WHERE status = 'BOOKED';
UPDATE tickets SET status = 'CANCELED' WHERE status = 'CANCELLED';

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_route_date ON tickets(route_name, travel_date_time);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

-- 5. Create ticket_status_history table for audit trail
CREATE TABLE IF NOT EXISTS ticket_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    changed_by_role VARCHAR(50) NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_status_history_ticket_id (ticket_id),
    INDEX idx_ticket_status_history_created_at (created_at)
);

-- 6. Add foreign key constraints if tables exist
-- ALTER TABLE tickets ADD CONSTRAINT fk_tickets_user_id FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
-- ALTER TABLE ticket_status_history ADD CONSTRAINT fk_status_history_ticket_id FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

-- 7. Update existing tickets to have default timestamps if they don't have them
UPDATE tickets SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL OR updated_at IS NULL;

-- 8. Create a default admin user (optional)
INSERT INTO "user" (username, password, email, phone_number, role) 
VALUES ('admin', 'admin123', 'admin@ontimetransit.com', '1234567890', 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN';

-- 9. Update existing users to have default role if not set
UPDATE "user" SET role = 'USER' WHERE role IS NULL OR role = '';

-- 10. Sample data for testing (optional)
-- INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by_user_id, changed_by_role, change_reason)
-- VALUES (1, 'PENDING', 'CONFIRMED', 1, 'ADMIN', 'Initial confirmation by admin');

COMMIT;
