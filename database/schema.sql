-- ProxPanel Database Schema
-- Complete database setup for VPS management system with Proxmox integration
-- Version: 1.0.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database
CREATE DATABASE IF NOT EXISTS `proxpanel` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `proxpanel`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(10) DEFAULT 'en',
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email_active` (`email`, `is_active`),
  KEY `idx_admin` (`is_admin`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `server_nodes`
-- --------------------------------------------------------

CREATE TABLE `server_nodes` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hostname` varchar(255) NOT NULL,
  `location` varchar(100) NOT NULL,
  `datacenter` varchar(100) DEFAULT NULL,
  `status` enum('online','offline','maintenance','error') DEFAULT 'offline',
  `cpu_cores` int(11) NOT NULL,
  `cpu_model` varchar(255) DEFAULT NULL,
  `cpu_usage` decimal(5,2) DEFAULT 0.00,
  `memory_total_gb` int(11) NOT NULL,
  `memory_used_gb` decimal(8,2) DEFAULT 0.00,
  `memory_usage` decimal(5,2) DEFAULT 0.00,
  `storage_total_tb` decimal(8,2) NOT NULL,
  `storage_used_tb` decimal(8,2) DEFAULT 0.00,
  `storage_usage` decimal(5,2) DEFAULT 0.00,
  `network_speed_gbps` decimal(4,1) DEFAULT 1.0,
  `vps_count` int(11) DEFAULT 0,
  `vps_limit` int(11) DEFAULT 100,
  `uptime_percentage` decimal(5,2) DEFAULT 0.00,
  `load_average` decimal(4,2) DEFAULT 0.00,
  `temperature` decimal(4,1) DEFAULT NULL,
  `power_usage_watts` int(11) DEFAULT NULL,
  `last_seen` timestamp NOT NULL DEFAULT current_timestamp(),
  `maintenance_mode` tinyint(1) DEFAULT 0,
  `maintenance_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_location` (`location`),
  KEY `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `vps_instances`
-- --------------------------------------------------------

CREATE TABLE `vps_instances` (
  `id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `node_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `vmid` int(11) NOT NULL,
  `status` enum('running','stopped','suspended','error','creating','deleting') DEFAULT 'stopped',
  `ip_address` varchar(45) DEFAULT NULL,
  `ipv6_address` varchar(45) DEFAULT NULL,
  `cpu_cores` int(11) DEFAULT 1,
  `cpu_limit` int(11) DEFAULT 100,
  `memory_gb` int(11) DEFAULT 1,
  `disk_gb` int(11) DEFAULT 20,
  `bandwidth_gb` int(11) DEFAULT 1000,
  `bandwidth_used_gb` decimal(10,2) DEFAULT 0.00,
  `os` varchar(100) DEFAULT NULL,
  `os_template` varchar(255) DEFAULT NULL,
  `ssh_port` int(11) DEFAULT 22,
  `root_password` varchar(255) DEFAULT NULL,
  `vnc_password` varchar(255) DEFAULT NULL,
  `backup_enabled` tinyint(1) DEFAULT 1,
  `backup_schedule` varchar(50) DEFAULT 'daily',
  `backup_retention` int(11) DEFAULT 7,
  `monitoring_enabled` tinyint(1) DEFAULT 1,
  `firewall_enabled` tinyint(1) DEFAULT 1,
  `auto_start` tinyint(1) DEFAULT 0,
  `template_id` varchar(50) DEFAULT NULL,
  `plan_id` varchar(50) DEFAULT NULL,
  `monthly_cost` decimal(8,2) DEFAULT 0.00,
  `next_billing_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vmid_node` (`vmid`, `node_id`),
  KEY `user_id` (`user_id`),
  KEY `node_id` (`node_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `vps_instances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vps_instances_ibfk_2` FOREIGN KEY (`node_id`) REFERENCES `server_nodes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `vps_metrics`
-- --------------------------------------------------------

CREATE TABLE `vps_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vps_id` varchar(50) NOT NULL,
  `cpu_usage` decimal(5,2) DEFAULT NULL,
  `memory_used_gb` decimal(8,2) DEFAULT NULL,
  `memory_usage` decimal(5,2) DEFAULT NULL,
  `disk_used_gb` decimal(10,2) DEFAULT NULL,
  `disk_usage` decimal(5,2) DEFAULT NULL,
  `network_in_mb` decimal(10,2) DEFAULT NULL,
  `network_out_mb` decimal(10,2) DEFAULT NULL,
  `network_total_mb` decimal(10,2) DEFAULT NULL,
  `load_average` decimal(4,2) DEFAULT NULL,
  `uptime_seconds` bigint(20) DEFAULT NULL,
  `processes` int(11) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `vps_id` (`vps_id`),
  KEY `idx_vps_recorded` (`vps_id`, `recorded_at`),
  KEY `idx_recorded_at` (`recorded_at`),
  CONSTRAINT `vps_metrics_ibfk_1` FOREIGN KEY (`vps_id`) REFERENCES `vps_instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
-- --------------------------------------------------------

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `category` enum('auth','vps','user','system','billing','security','admin') NOT NULL,
  `status` enum('success','warning','error','info') NOT NULL,
  `details` text DEFAULT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `request_id` varchar(255) DEFAULT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_resource` (`resource_type`, `resource_id`),
  KEY `idx_ip_address` (`ip_address`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `system_alerts`
-- --------------------------------------------------------

CREATE TABLE `system_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('info','warning','critical','emergency') NOT NULL,
  `category` varchar(50) NOT NULL,
  `status` enum('active','acknowledged','resolved','suppressed') DEFAULT 'active',
  `resource_id` varchar(100) DEFAULT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `threshold_value` decimal(10,2) DEFAULT NULL,
  `current_value` decimal(10,2) DEFAULT NULL,
  `alert_rule_id` varchar(100) DEFAULT NULL,
  `acknowledged_by` int(11) DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`),
  KEY `acknowledged_by` (`acknowledged_by`),
  KEY `resolved_by` (`resolved_by`),
  CONSTRAINT `system_alerts_ibfk_1` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `system_alerts_ibfk_2` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `payments`
-- --------------------------------------------------------

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `invoice_id` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `status` enum('pending','processing','completed','failed','refunded','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_provider` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `provider_transaction_id` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `fee_amount` decimal(10,2) DEFAULT 0.00,
  `net_amount` decimal(10,2) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT 0.00,
  `refund_reason` text DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_invoice_id` (`invoice_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `vps_templates`
-- --------------------------------------------------------

CREATE TABLE `vps_templates` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `os_family` varchar(50) NOT NULL,
  `os_version` varchar(50) NOT NULL,
  `architecture` varchar(20) DEFAULT 'x86_64',
  `template_file` varchar(255) NOT NULL,
  `min_cpu` int(11) DEFAULT 1,
  `min_memory_gb` int(11) DEFAULT 1,
  `min_disk_gb` int(11) DEFAULT 10,
  `default_packages` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `icon_url` varchar(255) DEFAULT NULL,
  `documentation_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_os_family` (`os_family`),
  KEY `idx_active_featured` (`is_active`, `is_featured`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `vps_backups`
-- --------------------------------------------------------

CREATE TABLE `vps_backups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vps_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('manual','scheduled','snapshot') DEFAULT 'manual',
  `status` enum('creating','completed','failed','restoring','deleted') DEFAULT 'creating',
  `size_gb` decimal(8,2) DEFAULT NULL,
  `storage_path` varchar(500) DEFAULT NULL,
  `compression` varchar(20) DEFAULT 'gzip',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `restored_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `vps_id` (`vps_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `vps_backups_ibfk_1` FOREIGN KEY (`vps_id`) REFERENCES `vps_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vps_backups_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `api_keys`
-- --------------------------------------------------------

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `key_prefix` varchar(20) NOT NULL,
  `permissions` json DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `last_used_ip` varchar(45) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `rate_limit` int(11) DEFAULT 1000,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_hash` (`key_hash`),
  UNIQUE KEY `key_prefix` (`key_prefix`),
  KEY `user_id` (`user_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
