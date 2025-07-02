-- Create databases for each microservice
CREATE DATABASE user_service;
CREATE DATABASE notification_service;
CREATE DATABASE analytics_service;
CREATE DATABASE ticket_service;
CREATE DATABASE route_service;
CREATE DATABASE schedule_service;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE analytics_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ticket_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE route_service TO postgres;
GRANT ALL PRIVILEGES ON DATABASE schedule_service TO postgres;
