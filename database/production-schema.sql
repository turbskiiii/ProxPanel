-- Additional production tables for monitoring, alerts, and backups

CREATE TABLE IF NOT EXISTS system_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    cpu_usage DECIMAL(5,2) NOT NULL,
    memory_usage DECIMAL(5,2) NOT NULL,
    disk_usage DECIMAL(5,2) NOT NULL,
    active_vps INT NOT NULL DEFAULT 0,
    failed_vps INT NOT NULL DEFAULT 0,
    response_time INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'resolved', 'acknowledged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS backup_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vps_id VARCHAR(50) NOT NULL,
    schedule VARCHAR(20) NOT NULL DEFAULT 'daily',
    retention INT NOT NULL DEFAULT 7,
    storage VARCHAR(50) NOT NULL DEFAULT 'local',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vps_id) REFERENCES vps_instances(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vps_backup (vps_id)
);

CREATE TABLE IF NOT EXISTS backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vps_id VARCHAR(50) NOT NULL,
    type ENUM('snapshot', 'backup') NOT NULL,
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    task_id VARCHAR(100),
    snapshot_name VARCHAR(100),
    backup_file VARCHAR(255),
    size_mb INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (vps_id) REFERENCES vps_instances(id) ON DELETE CASCADE,
    INDEX idx_vps_id (vps_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS backup_restores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_id INT NOT NULL,
    vps_id VARCHAR(50) NOT NULL,
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    task_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (backup_id) REFERENCES backups(id) ON DELETE CASCADE,
    FOREIGN KEY (vps_id) REFERENCES vps_instances(id) ON DELETE CASCADE,
    INDEX idx_backup_id (backup_id),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS maintenance_windows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    affected_services TEXT,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
);

-- Insert default backup configs for existing VPS
INSERT IGNORE INTO backup_configs (vps_id, schedule, retention, enabled)
SELECT id, 'daily', 7, TRUE FROM vps_instances;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vps_user_status ON vps_instances(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_action_logs_vps ON action_logs(vps_id, created_at);
