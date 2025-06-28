-- Admin and audit tables for ProxPanel

-- Add admin flag to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create server nodes table
CREATE TABLE IF NOT EXISTS server_nodes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('online', 'offline', 'maintenance') DEFAULT 'offline',
    cpu_cores INT NOT NULL,
    cpu_usage DECIMAL(5,2) DEFAULT 0,
    memory_total_gb INT NOT NULL,
    memory_used_gb DECIMAL(8,2) DEFAULT 0,
    memory_usage DECIMAL(5,2) DEFAULT 0,
    storage_total_tb DECIMAL(8,2) NOT NULL,
    storage_used_tb DECIMAL(8,2) DEFAULT 0,
    vps_count INT DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    category ENUM('auth', 'vps', 'user', 'system', 'billing', 'security') NOT NULL,
    status ENUM('success', 'warning', 'error', 'info') NOT NULL,
    details TEXT,
    resource_id VARCHAR(100),
    resource_type VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create system alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'critical') NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
    resource_id VARCHAR(100),
    resource_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create payments table for billing tracking
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    invoice_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample server nodes
INSERT INTO server_nodes (id, name, location, status, cpu_cores, cpu_usage, memory_total_gb, memory_used_gb, memory_usage, storage_total_tb, storage_used_tb, vps_count, uptime_percentage) VALUES
('node-ny-01', 'New York Primary', 'New York, USA', 'online', 64, 45.2, 256, 128.5, 50.2, 10.0, 2.5, 45, 99.98),
('node-fra-01', 'Frankfurt Primary', 'Frankfurt, Germany', 'online', 64, 78.1, 256, 180.3, 70.4, 10.0, 4.2, 52, 99.95),
('node-sgp-01', 'Singapore Primary', 'Singapore', 'online', 48, 32.7, 192, 96.8, 50.4, 8.0, 1.8, 38, 99.99),
('node-lon-01', 'London Primary', 'London, UK', 'maintenance', 64, 0.0, 256, 0.0, 0.0, 10.0, 3.1, 0, 99.92);

-- Make the first user an admin
UPDATE users SET is_admin = TRUE WHERE id = 1;

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, category, status, details, ip_address, user_agent) VALUES
(1, 'Admin login successful', 'auth', 'success', 'Administrator logged in from trusted IP address', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'VPS created', 'vps', 'success', 'Created VPS instance "web-server-01" with 4GB RAM, 2 CPU cores', '203.0.113.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(NULL, 'High CPU usage detected', 'system', 'warning', 'CPU usage exceeded 80% threshold on node-fra-01', '127.0.0.1', 'ProxPanel-Monitor/1.0'),
(3, 'Failed login attempt', 'auth', 'error', 'Invalid password provided for user jane.smith', '198.51.100.23', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(4, 'Payment processed', 'billing', 'success', 'Payment of $89.99 processed successfully for invoice INV-2024-001', '203.0.113.67', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');

-- Insert sample system alerts
INSERT INTO system_alerts (title, message, severity, category, resource_id, resource_type) VALUES
('High CPU Usage', 'CPU usage on Frankfurt node has exceeded 80% for the last 15 minutes', 'warning', 'performance', 'node-fra-01', 'server'),
('Server Maintenance', 'London node is currently undergoing scheduled maintenance', 'info', 'maintenance', 'node-lon-01', 'server'),
('Payment Failure', 'Multiple payment failures detected in the last hour', 'critical', 'billing', NULL, NULL);

-- Insert sample payment records
INSERT INTO payments (user_id, invoice_id, amount, status, payment_method, transaction_id, description) VALUES
(2, 'INV-2024-001', 89.99, 'completed', 'credit_card', 'txn_1234567890', 'Monthly VPS hosting - Performance Plan'),
(3, 'INV-2024-002', 149.99, 'completed', 'paypal', 'pp_9876543210', 'Monthly VPS hosting - Enterprise Plan'),
(4, 'INV-2024-003', 29.99, 'failed', 'credit_card', 'txn_failed_001', 'Monthly VPS hosting - Developer Plan'),
(2, 'INV-2024-004', 89.99, 'pending', 'bank_transfer', NULL, 'Monthly VPS hosting - Performance Plan');
