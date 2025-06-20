-- Create database schema for VPS management system
-- This would integrate with Proxmox VE API

CREATE DATABASE IF NOT EXISTS vps_manager;
USE vps_manager;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- VPS instances table
CREATE TABLE vps_instances (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    vmid INT NOT NULL,
    node VARCHAR(100) NOT NULL,
    status ENUM('running', 'stopped', 'suspended') DEFAULT 'stopped',
    ip_address VARCHAR(45),
    cpu_cores INT DEFAULT 1,
    memory_gb INT DEFAULT 1,
    disk_gb INT DEFAULT 20,
    os VARCHAR(100),
    ssh_port INT DEFAULT 22,
    root_password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- VPS metrics for monitoring
CREATE TABLE vps_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vps_id VARCHAR(50) NOT NULL,
    cpu_usage DECIMAL(5,2),
    memory_used_gb DECIMAL(8,2),
    disk_used_gb DECIMAL(10,2),
    network_in_mb DECIMAL(10,2),
    network_out_mb DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vps_id) REFERENCES vps_instances(id) ON DELETE CASCADE,
    INDEX idx_vps_recorded (vps_id, recorded_at)
);

-- Action logs for audit trail
CREATE TABLE action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vps_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vps_id) REFERENCES vps_instances(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO users (email, password_hash, name) VALUES 
('admin@example.com', '$2b$10$example_hash', 'Admin User'),
('user@example.com', '$2b$10$example_hash', 'Regular User');

INSERT INTO vps_instances (id, user_id, name, vmid, node, status, ip_address, cpu_cores, memory_gb, disk_gb, os, root_password) VALUES
('vm-100', 1, 'Web Server', 100, 'proxmox-node-1', 'running', '192.168.1.100', 2, 2, 40, 'Ubuntu 22.04', 'generated-password-123'),
('vm-101', 1, 'Database Server', 101, 'proxmox-node-1', 'running', '192.168.1.101', 4, 8, 100, 'CentOS 8', 'generated-password-456'),
('vm-102', 1, 'Development', 102, 'proxmox-node-2', 'stopped', '192.168.1.102', 1, 1, 20, 'Debian 11', 'generated-password-789'),
('vm-103', 2, 'Mail Server', 103, 'proxmox-node-2', 'running', '192.168.1.103', 1, 2, 50, 'Ubuntu 20.04', 'generated-password-abc');
