-- Initialize WordWeave Database
-- This script sets up the initial database configuration

-- Create the main database (already created by default)
-- CREATE DATABASE wordweaves;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log the initialization
SELECT 'WordWeave database initialized successfully' AS status;
