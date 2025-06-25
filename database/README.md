# ProxPanel Database Setup

This directory contains all database-related files for ProxPanel VPS management system.

## Files Overview

- `schema.sql` - Complete database schema with all tables and relationships
- `seed.sql` - Sample data for development and testing
- `migrations/` - Database migration files for version control
- `README.md` - This documentation file

## Quick Setup

### 1. Create Database and Schema

\`\`\`bash
# Connect to MySQL/MariaDB
mysql -u root -p

# Run the schema file
source database/schema.sql;
\`\`\`

### 2. Load Sample Data (Optional)

\`\`\`bash
# Load sample data for development
source database/seed.sql;
\`\`\`

### 3. Environment Configuration

Create a `.env` file with your database credentials:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=proxpanel
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false

# For production, use connection pooling
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000
\`\`\`

## Database Schema

### Core Tables

#### Users (`users`)
- User authentication and profile information
- Admin role management
- Two-factor authentication support
- Account status tracking

#### Server Nodes (`server_nodes`)
- Proxmox server node information
- Resource monitoring (CPU, RAM, Storage)
- Status tracking and maintenance mode
- Geographic location and datacenter info

#### VPS Instances (`vps_instances`)
- Virtual private server configurations
- Resource allocations and limits
- Operating system and template information
- Billing and expiration tracking

#### VPS Metrics (`vps_metrics`)
- Real-time performance monitoring
- Historical resource usage data
- Network traffic statistics
- System load and uptime tracking

### Management Tables

#### Audit Logs (`audit_logs`)
- Complete system activity logging
- User action tracking
- Security event monitoring
- Performance and debugging information

#### System Alerts (`system_alerts`)
- Automated alert generation
- Severity levels and categorization
- Alert acknowledgment and resolution
- Resource threshold monitoring

#### Payments (`payments`)
- Billing and payment processing
- Multiple payment provider support
- Transaction status tracking
- Refund and failure handling

### Additional Tables

#### VPS Templates (`vps_templates`)
- Operating system templates
- Pre-configured software packages
- Minimum resource requirements
- Template categorization and sorting

#### VPS Backups (`vps_backups`)
- Backup scheduling and management
- Storage location tracking
- Backup type classification
- Retention policy enforcement

#### API Keys (`api_keys`)
- API authentication tokens
- Permission-based access control
- Usage tracking and rate limiting
- Key expiration management

## Sample Data

The `seed.sql` file includes:

- **6 sample users** (1 admin, 5 regular users)
- **5 server nodes** across different locations
- **6 OS templates** (Ubuntu, Debian, CentOS, Alpine, Docker)
- **7 VPS instances** with various configurations
- **Recent performance metrics** for monitoring
- **Comprehensive audit logs** for testing
- **System alerts** with different severity levels
- **Payment records** with various statuses
- **Backup records** with different types
- **API keys** for development testing

## Security Considerations

### Password Hashing
All passwords use bcrypt with cost factor 12:
\`\`\`sql
password_hash VARCHAR(255) -- bcrypt $2b$12$...
\`\`\`

### API Key Security
API keys are hashed and only prefixes are stored:
\`\`\`sql
key_hash VARCHAR(255)    -- bcrypt hashed full key
key_prefix VARCHAR(20)   -- First 10 chars for identification
\`\`\`

### Audit Trail
All sensitive operations are logged:
- User authentication attempts
- VPS management actions
- Administrative operations
- Payment processing
- System configuration changes

## Indexes and Performance

### Primary Indexes
- All tables have optimized primary keys
- Foreign key relationships are properly indexed
- Composite indexes for common query patterns

### Query Optimization
- Time-based queries use dedicated indexes
- Status and category fields are indexed
- User and resource lookups are optimized

### Maintenance
\`\`\`sql
-- Regular maintenance queries
OPTIMIZE TABLE vps_metrics;
ANALYZE TABLE audit_logs;

-- Clean old metrics (keep 30 days)
DELETE FROM vps_metrics WHERE recorded_at < NOW() - INTERVAL 30 DAY;

-- Archive old audit logs (keep 90 days)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL 90 DAY;
\`\`\`

## Migration System

### Running Migrations
\`\`\`bash
# Check current migration status
SELECT * FROM migrations ORDER BY executed_at DESC;

# Run new migrations
source database/migrations/002_add_feature.sql;
\`\`\`

### Creating New Migrations
1. Create new file: `migrations/XXX_description.sql`
2. Include migration tracking:
\`\`\`sql
INSERT INTO migrations (migration, batch) VALUES ('XXX_description', NEXT_BATCH);
\`\`\`

## Backup and Recovery

### Daily Backups
\`\`\`bash
# Full database backup
mysqldump -u root -p proxpanel > backup_$(date +%Y%m%d).sql

# Schema only backup
mysqldump -u root -p --no-data proxpanel > schema_backup.sql
\`\`\`

### Point-in-Time Recovery
\`\`\`bash
# Restore from backup
mysql -u root -p proxpanel < backup_20240125.sql

# Restore schema only
mysql -u root -p proxpanel < schema_backup.sql
\`\`\`

## Monitoring Queries

### System Health
\`\`\`sql
-- Active VPS count by node
SELECT node_id, COUNT(*) as vps_count, 
       SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running_count
FROM vps_instances GROUP BY node_id;

-- Resource utilization
SELECT node_id, cpu_usage, memory_usage, storage_usage 
FROM server_nodes WHERE status = 'online';

-- Recent alerts
SELECT * FROM system_alerts 
WHERE status = 'active' AND severity IN ('critical', 'warning')
ORDER BY created_at DESC LIMIT 10;
\`\`\`

### Performance Metrics
\`\`\`sql
-- Average response times
SELECT AVG(duration_ms) as avg_response_time,
       category, COUNT(*) as request_count
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL 1 HOUR
GROUP BY category;

-- Payment success rate
SELECT status, COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payments 
WHERE created_at > NOW() - INTERVAL 30 DAY
GROUP BY status;
\`\`\`

## Support

For database-related issues:
1. Check the error logs in your MySQL/MariaDB installation
2. Verify connection credentials in `.env` file
3. Ensure proper permissions for database user
4. Review the audit logs for system events

For schema modifications:
1. Always create a migration file
2. Test changes in development environment
3. Backup production data before applying changes
4. Update this documentation accordingly
