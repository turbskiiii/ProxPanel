-- ProxPanel Sample Data
-- Development and testing data for VPS management system
-- Version: 1.0.0

USE `proxpanel`;

-- Disable foreign key checks for data insertion
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Sample Users
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `is_admin`, `is_active`, `email_verified`, `phone`, `company`, `country`, `timezone`, `language`, `two_factor_enabled`, `last_login`, `login_attempts`, `created_at`) VALUES
(1, 'admin@turbskiiii.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'System Administrator', 1, 1, 1, '+1-555-0100', 'ProxPanel Inc.', 'United States', 'America/New_York', 'en', 1, NOW() - INTERVAL 1 HOUR, 0, NOW() - INTERVAL 30 DAY),
(2, 'john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'John Doe', 0, 1, 1, '+1-555-0101', 'Tech Solutions LLC', 'United States', 'America/Los_Angeles', 'en', 0, NOW() - INTERVAL 2 HOUR, 0, NOW() - INTERVAL 25 DAY),
(3, 'jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'Jane Smith', 0, 1, 1, '+44-20-7946-0958', 'Digital Innovations Ltd', 'United Kingdom', 'Europe/London', 'en', 1, NOW() - INTERVAL 30 MINUTE, 0, NOW() - INTERVAL 20 DAY),
(4, 'mike.wilson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'Mike Wilson', 0, 1, 0, '+49-30-12345678', 'StartupHub GmbH', 'Germany', 'Europe/Berlin', 'de', 0, NOW() - INTERVAL 1 DAY, 0, NOW() - INTERVAL 15 DAY),
(5, 'sarah.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'Sarah Johnson', 0, 1, 1, '+65-6123-4567', 'Asia Pacific Systems', 'Singapore', 'Asia/Singapore', 'en', 0, NOW() - INTERVAL 3 HOUR, 0, NOW() - INTERVAL 10 DAY),
(6, 'test.user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5.N7.N7.', 'Test User', 0, 0, 0, NULL, NULL, NULL, 'UTC', 'en', 0, NULL, 3, NOW() - INTERVAL 5 DAY);

-- --------------------------------------------------------
-- Sample Server Nodes
-- --------------------------------------------------------

INSERT INTO `server_nodes` (`id`, `name`, `hostname`, `location`, `datacenter`, `status`, `cpu_cores`, `cpu_model`, `cpu_usage`, `memory_total_gb`, `memory_used_gb`, `memory_usage`, `storage_total_tb`, `storage_used_tb`, `storage_usage`, `network_speed_gbps`, `vps_count`, `vps_limit`, `uptime_percentage`, `load_average`, `temperature`, `power_usage_watts`, `last_seen`, `maintenance_mode`) VALUES
('node-ny-01', 'New York Primary', 'ny01.proxpanel.com', 'New York, NY', 'DataCenter One NYC', 'online', 64, 'Intel Xeon E5-2690 v4', 45.20, 256, 128.50, 50.20, 10.00, 2.50, 25.00, 10.0, 45, 100, 99.98, 1.25, 42.5, 850, NOW(), 0),
('node-fra-01', 'Frankfurt Primary', 'fra01.proxpanel.com', 'Frankfurt, Germany', 'Hetzner DC Park', 'online', 64, 'AMD EPYC 7542', 78.10, 256, 180.30, 70.40, 10.00, 4.20, 42.00, 10.0, 52, 100, 99.95, 2.15, 38.2, 920, NOW(), 0),
('node-sgp-01', 'Singapore Primary', 'sgp01.proxpanel.com', 'Singapore', 'DigitalRealty SIN10', 'online', 48, 'Intel Xeon Gold 6248R', 32.70, 192, 96.80, 50.40, 8.00, 1.80, 22.50, 10.0, 38, 80, 99.99, 0.85, 35.8, 720, NOW(), 0),
('node-lon-01', 'London Primary', 'lon01.proxpanel.com', 'London, UK', 'Telehouse North', 'maintenance', 64, 'Intel Xeon E5-2680 v4', 0.00, 256, 0.00, 0.00, 10.00, 3.10, 31.00, 10.0, 0, 100, 99.92, 0.00, NULL, 0, NOW() - INTERVAL 2 HOUR, 1),
('node-tor-01', 'Toronto Secondary', 'tor01.proxpanel.com', 'Toronto, Canada', 'Cologix TOR1', 'online', 32, 'AMD EPYC 7402P', 28.50, 128, 45.20, 35.30, 5.00, 1.20, 24.00, 1.0, 22, 60, 99.85, 0.95, 41.2, 480, NOW(), 0);

-- --------------------------------------------------------
-- Sample VPS Templates
-- --------------------------------------------------------

INSERT INTO `vps_templates` (`id`, `name`, `description`, `os_family`, `os_version`, `architecture`, `template_file`, `min_cpu`, `min_memory_gb`, `min_disk_gb`, `default_packages`, `is_active`, `is_featured`, `sort_order`, `icon_url`) VALUES
('ubuntu-22.04', 'Ubuntu 22.04 LTS', 'Latest Ubuntu LTS with long-term support', 'ubuntu', '22.04', 'x86_64', 'ubuntu-22.04-standard_22.04-1_amd64.tar.zst', 1, 1, 10, '["openssh-server", "curl", "wget", "nano", "htop"]', 1, 1, 1, '/icons/ubuntu.svg'),
('ubuntu-20.04', 'Ubuntu 20.04 LTS', 'Stable Ubuntu LTS release', 'ubuntu', '20.04', 'x86_64', 'ubuntu-20.04-standard_20.04-1_amd64.tar.zst', 1, 1, 10, '["openssh-server", "curl", "wget", "nano"]', 1, 0, 2, '/icons/ubuntu.svg'),
('debian-12', 'Debian 12 Bookworm', 'Latest stable Debian release', 'debian', '12', 'x86_64', 'debian-12-standard_12.0-1_amd64.tar.zst', 1, 1, 10, '["openssh-server", "curl", "wget"]', 1, 1, 3, '/icons/debian.svg'),
('centos-9', 'CentOS Stream 9', 'Enterprise-grade Linux distribution', 'centos', '9', 'x86_64', 'centos-9-default_20230607_amd64.tar.xz', 1, 2, 15, '["openssh-server", "curl", "wget", "vim"]', 1, 0, 4, '/icons/centos.svg'),
('alpine-3.18', 'Alpine Linux 3.18', 'Lightweight security-oriented distribution', 'alpine', '3.18', 'x86_64', 'alpine-3.18-default_20230607_amd64.tar.xz', 1, 1, 5, '["openssh", "curl", "bash"]', 1, 0, 5, '/icons/alpine.svg'),
('docker-ubuntu', 'Docker on Ubuntu', 'Ubuntu 22.04 with Docker pre-installed', 'ubuntu', '22.04', 'x86_64', 'ubuntu-22.04-docker_22.04-1_amd64.tar.zst', 2, 2, 20, '["docker.io", "docker-compose", "openssh-server"]', 1, 1, 6, '/icons/docker.svg');

-- --------------------------------------------------------
-- Sample VPS Instances
-- --------------------------------------------------------

INSERT INTO `vps_instances` (`id`, `user_id`, `node_id`, `name`, `vmid`, `status`, `ip_address`, `ipv6_address`, `cpu_cores`, `cpu_limit`, `memory_gb`, `disk_gb`, `bandwidth_gb`, `bandwidth_used_gb`, `os`, `os_template`, `ssh_port`, `root_password`, `backup_enabled`, `backup_schedule`, `monitoring_enabled`, `firewall_enabled`, `template_id`, `monthly_cost`, `next_billing_date`, `created_at`) VALUES
('vm-100', 2, 'node-ny-01', 'Web Server Production', 100, 'running', '192.168.1.100', '2001:db8::100', 2, 100, 4, 80, 2000, 245.50, 'Ubuntu 22.04 LTS', 'ubuntu-22.04', 22, 'Kx9#mP2$vN8@', 1, 'daily', 1, 1, 'ubuntu-22.04', 89.99, '2024-02-01', NOW() - INTERVAL 15 DAY),
('vm-101', 2, 'node-ny-01', 'Database Server', 101, 'running', '192.168.1.101', '2001:db8::101', 4, 100, 8, 160, 1000, 89.20, 'Ubuntu 22.04 LTS', 'ubuntu-22.04', 22, 'Lm4&nQ7$wR9!', 1, 'daily', 1, 1, 'ubuntu-22.04', 149.99, '2024-02-01', NOW() - INTERVAL 12 DAY),
('vm-102', 3, 'node-fra-01', 'Development Environment', 102, 'running', '192.168.2.102', '2001:db8::102', 2, 100, 2, 40, 1000, 156.80, 'Debian 12 Bookworm', 'debian-12', 22, 'Pq8#rS5$tU2@', 1, 'weekly', 1, 1, 'debian-12', 59.99, '2024-02-05', NOW() - INTERVAL 8 DAY),
('vm-103', 3, 'node-fra-01', 'Mail Server', 103, 'running', '192.168.2.103', '2001:db8::103', 1, 100, 2, 50, 500, 67.30, 'Ubuntu 20.04 LTS', 'ubuntu-20.04', 22, 'Vw6&xY9$zA3!', 1, 'daily', 1, 1, 'ubuntu-20.04', 39.99, '2024-02-05', NOW() - INTERVAL 6 DAY),
('vm-104', 4, 'node-sgp-01', 'API Gateway', 104, 'stopped', '192.168.3.104', '2001:db8::104', 2, 100, 4, 60, 1500, 0.00, 'Alpine Linux 3.18', 'alpine-3.18', 22, 'Bc7#dE4$fG1@', 1, 'daily', 1, 1, 'alpine-3.18', 79.99, '2024-02-10', NOW() - INTERVAL 4 DAY),
('vm-105', 5, 'node-sgp-01', 'Docker Cluster Node', 105, 'running', '192.168.3.105', '2001:db8::105', 4, 100, 8, 120, 2000, 432.10, 'Docker on Ubuntu', 'docker-ubuntu', 22, 'Hj9&kL6$mN3!', 1, 'daily', 1, 1, 'docker-ubuntu', 129.99, '2024-02-15', NOW() - INTERVAL 2 DAY),
('vm-106', 5, 'node-tor-01', 'Backup Server', 106, 'running', '192.168.4.106', '2001:db8::106', 1, 100, 2, 200, 500, 23.45, 'CentOS Stream 9', 'centos-9', 22, 'Op2#qR8$sT5@', 1, 'weekly', 1, 0, 'centos-9', 49.99, '2024-02-15', NOW() - INTERVAL 1 DAY);

-- --------------------------------------------------------
-- Sample VPS Metrics (Recent data)
-- --------------------------------------------------------

INSERT INTO `vps_metrics` (`vps_id`, `cpu_usage`, `memory_used_gb`, `memory_usage`, `disk_used_gb`, `disk_usage`, `network_in_mb`, `network_out_mb`, `network_total_mb`, `load_average`, `uptime_seconds`, `processes`, `recorded_at`) VALUES
('vm-100', 25.50, 2.80, 70.00, 45.20, 56.50, 1250.50, 890.20, 2140.70, 0.85, 1296000, 156, NOW() - INTERVAL 5 MINUTE),
('vm-100', 28.20, 2.95, 73.75, 45.25, 56.56, 1255.80, 895.40, 2151.20, 0.92, 1296300, 158, NOW() - INTERVAL 10 MINUTE),
('vm-101', 45.80, 6.20, 77.50, 89.50, 55.94, 2150.30, 1890.60, 4040.90, 1.25, 1036800, 203, NOW() - INTERVAL 5 MINUTE),
('vm-102', 15.20, 1.40, 70.00, 28.90, 72.25, 890.20, 650.80, 1541.00, 0.45, 691200, 98, NOW() - INTERVAL 5 MINUTE),
('vm-103', 8.50, 1.20, 60.00, 35.60, 71.20, 450.80, 320.50, 771.30, 0.25, 518400, 87, NOW() - INTERVAL 5 MINUTE),
('vm-105', 65.20, 5.80, 72.50, 78.40, 65.33, 3250.90, 2890.40, 6141.30, 2.15, 172800, 245, NOW() - INTERVAL 5 MINUTE),
('vm-106', 12.80, 1.60, 80.00, 156.80, 78.40, 125.40, 89.20, 214.60, 0.35, 86400, 76, NOW() - INTERVAL 5 MINUTE);

-- --------------------------------------------------------
-- Sample Audit Logs
-- --------------------------------------------------------

INSERT INTO `audit_logs` (`user_id`, `action`, `category`, `status`, `details`, `resource_id`, `resource_type`, `ip_address`, `user_agent`, `session_id`, `duration_ms`, `created_at`) VALUES
(1, 'Admin login successful', 'auth', 'success', 'Administrator logged in from trusted IP address', NULL, NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sess_admin_001', 250, NOW() - INTERVAL 1 HOUR),
(2, 'VPS created successfully', 'vps', 'success', 'Created VPS instance "Web Server Production" with 4GB RAM, 2 CPU cores', 'vm-100', 'vps', '203.0.113.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sess_user_002', 15000, NOW() - INTERVAL 15 DAY),
(NULL, 'High CPU usage detected', 'system', 'warning', 'CPU usage exceeded 80% threshold on node-fra-01 for 10 minutes', 'node-fra-01', 'server', '127.0.0.1', 'ProxPanel-Monitor/1.0', NULL, 50, NOW() - INTERVAL 2 HOUR),
(6, 'Failed login attempt', 'auth', 'error', 'Invalid password provided for user test.user@example.com', NULL, NULL, '198.51.100.23', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', NULL, 1200, NOW() - INTERVAL 30 MINUTE),
(3, 'Payment processed successfully', 'billing', 'success', 'Payment of $59.99 processed successfully for invoice INV-2024-003', 'pay_001', 'payment', '203.0.113.67', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'sess_user_003', 3500, NOW() - INTERVAL 1 DAY),
(1, 'Server maintenance started', 'system', 'info', 'Scheduled maintenance started on London node', 'node-lon-01', 'server', '192.168.1.100', 'ProxPanel-Admin/1.0', 'sess_admin_001', 500, NOW() - INTERVAL 2 HOUR),
(4, 'VPS password reset', 'vps', 'success', 'Root password reset for VPS "API Gateway"', 'vm-104', 'vps', '49.12.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sess_user_004', 2000, NOW() - INTERVAL 3 HOUR),
(5, 'Backup created', 'vps', 'success', 'Manual backup created for "Docker Cluster Node"', 'vm-105', 'vps', '65.123.45.89', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sess_user_005', 45000, NOW() - INTERVAL 6 HOUR);

-- --------------------------------------------------------
-- Sample System Alerts
-- --------------------------------------------------------

INSERT INTO `system_alerts` (`title`, `message`, `severity`, `category`, `status`, `resource_id`, `resource_type`, `threshold_value`, `current_value`, `alert_rule_id`, `acknowledged_by`, `acknowledged_at`, `created_at`) VALUES
('High CPU Usage - Frankfurt Node', 'CPU usage on Frankfurt node has exceeded 80% for the last 15 minutes', 'warning', 'performance', 'acknowledged', 'node-fra-01', 'server', 80.00, 78.10, 'cpu_threshold_80', 1, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 2 HOUR),
('Server Maintenance - London', 'London node is currently undergoing scheduled maintenance', 'info', 'maintenance', 'active', 'node-lon-01', 'server', NULL, NULL, 'maintenance_scheduled', NULL, NULL, NOW() - INTERVAL 2 HOUR),
('Payment Failures Detected', 'Multiple payment failures detected in the last hour', 'critical', 'billing', 'active', NULL, NULL, 3.00, 5.00, 'payment_failure_rate', NULL, NULL, NOW() - INTERVAL 45 MINUTE),
('Low Disk Space Warning', 'VPS vm-106 disk usage is approaching 80% capacity', 'warning', 'storage', 'resolved', 'vm-106', 'vps', 80.00, 78.40, 'disk_usage_80', 5, NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 1 HOUR),
('Network Anomaly Detected', 'Unusual network traffic pattern detected on Singapore node', 'warning', 'network', 'active', 'node-sgp-01', 'server', NULL, NULL, 'network_anomaly', NULL, NULL, NOW() - INTERVAL 20 MINUTE);

-- --------------------------------------------------------
-- Sample Payments
-- --------------------------------------------------------

INSERT INTO `payments` (`user_id`, `invoice_id`, `amount`, `currency`, `status`, `payment_method`, `payment_provider`, `transaction_id`, `provider_transaction_id`, `description`, `fee_amount`, `net_amount`, `processed_at`, `created_at`) VALUES
(2, 'INV-2024-001', 89.99, 'USD', 'completed', 'credit_card', 'stripe', 'txn_1234567890', 'pi_1234567890abcdef', 'Monthly VPS hosting - Performance Plan', 2.61, 87.38, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(3, 'INV-2024-002', 59.99, 'USD', 'completed', 'paypal', 'paypal', 'pp_9876543210', '8AB12345CD678901E', 'Monthly VPS hosting - Developer Plan', 1.74, 58.25, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(4, 'INV-2024-003', 79.99, 'USD', 'failed', 'credit_card', 'stripe', 'txn_failed_001', 'pi_failed_001', 'Monthly VPS hosting - Standard Plan', 0.00, 0.00, NULL, NOW() - INTERVAL 2 DAY),
(5, 'INV-2024-004', 129.99, 'USD', 'completed', 'bank_transfer', 'wise', 'wise_transfer_001', 'T123456789', 'Monthly VPS hosting - Enterprise Plan', 3.25, 126.74, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(2, 'INV-2024-005', 149.99, 'USD', 'pending', 'credit_card', 'stripe', 'txn_pending_001', 'pi_pending_001', 'Monthly VPS hosting - Performance + Database', 0.00, 0.00, NULL, NOW() - INTERVAL 6 HOUR);

-- --------------------------------------------------------
-- Sample VPS Backups
-- --------------------------------------------------------

INSERT INTO `vps_backups` (`vps_id`, `name`, `type`, `status`, `size_gb`, `storage_path`, `compression`, `notes`, `created_by`, `expires_at`, `created_at`) VALUES
('vm-100', 'Daily Backup - 2024-01-25', 'scheduled', 'completed', 35.20, '/backups/vm-100/daily-2024-01-25.tar.gz', 'gzip', 'Automated daily backup', NULL, NOW() + INTERVAL 7 DAY, NOW() - INTERVAL 1 DAY),
('vm-101', 'Pre-maintenance Backup', 'manual', 'completed', 78.50, '/backups/vm-101/manual-2024-01-24.tar.gz', 'gzip', 'Backup before database maintenance', 2, NOW() + INTERVAL 30 DAY, NOW() - INTERVAL 2 DAY),
('vm-102', 'Weekly Backup - Week 4', 'scheduled', 'completed', 22.80, '/backups/vm-102/weekly-2024-w4.tar.gz', 'gzip', 'Weekly automated backup', NULL, NOW() + INTERVAL 30 DAY, NOW() - INTERVAL 3 DAY),
('vm-105', 'Docker Images Backup', 'manual', 'completed', 95.60, '/backups/vm-105/docker-2024-01-23.tar.gz', 'gzip', 'Backup of Docker containers and images', 5, NOW() + INTERVAL 14 DAY, NOW() - INTERVAL 4 DAY),
('vm-103', 'Mail Server Snapshot', 'snapshot', 'completed', 28.90, '/backups/vm-103/snapshot-2024-01-22.tar.gz', 'lz4', 'Quick snapshot before email migration', 3, NOW() + INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY);

-- --------------------------------------------------------
-- Sample API Keys
-- --------------------------------------------------------

INSERT INTO `api_keys` (`user_id`, `name`, `key_hash`, `key_prefix`, `permissions`, `last_used_at`, `last_used_ip`, `usage_count`, `rate_limit`, `is_active`, `expires_at`, `created_at`) VALUES
(2, 'Production API Key', '$2b$12$abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', 'pk_live_abc123', '["vps:read", "vps:manage", "metrics:read"]', NOW() - INTERVAL 2 HOUR, '203.0.113.45', 1247, 5000, 1, NOW() + INTERVAL 1 YEAR, NOW() - INTERVAL 10 DAY),
(3, 'Development Key', '$2b$12$xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xy', 'pk_test_xyz789', '["vps:read", "metrics:read"]', NOW() - INTERVAL 1 DAY, '203.0.113.67', 89, 1000, 1, NOW() + INTERVAL 6 MONTH, NOW() - INTERVAL 5 DAY),
(5, 'Monitoring Script', '$2b$12$monitor123monitor123monitor123monitor123monitor123monitor123', 'pk_mon_def456', '["metrics:read", "alerts:read"]', NOW() - INTERVAL 10 MINUTE, '65.123.45.89', 2456, 10000, 1, NULL, NOW() - INTERVAL 2 DAY);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Update auto increment values
ALTER TABLE `users` AUTO_INCREMENT = 7;
ALTER TABLE `vps_metrics` AUTO_INCREMENT = 1000;
ALTER TABLE `audit_logs` AUTO_INCREMENT = 1000;
ALTER TABLE `system_alerts` AUTO_INCREMENT = 100;
ALTER TABLE `payments` AUTO_INCREMENT = 100;
ALTER TABLE `vps_backups` AUTO_INCREMENT = 100;
ALTER TABLE `api_keys` AUTO_INCREMENT = 10;
