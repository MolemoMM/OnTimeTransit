-- Initialize OnTimeTransit database schema
-- This script sets up the database for all microservices

-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables will be auto-created by Hibernate with DDL auto-update
-- But we can set up some initial configuration here

-- Set default timezone
SET timezone = 'UTC';

-- Create a sample admin user (this would normally be done through the application)
-- We'll let the application handle user creation through its APIs

-- Enable logging for debugging
SET log_statement = 'all';
SET log_min_duration_statement = 1000;

-- Ensure proper encoding
SET client_encoding = 'UTF8';
