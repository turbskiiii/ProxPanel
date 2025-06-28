-- ProxPanel Database Migration 001
-- Initial schema creation
-- Run this file to set up the database from scratch

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `proxpanel` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `proxpanel`;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('001_initial_schema', 1);
