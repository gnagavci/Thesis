-- Database creation
CREATE DATABASE IF NOT EXISTS abm 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_0900_ai_ci;

USE abm;

-- Users table (must be created first due to foreign key constraint)
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(45) NOT NULL,
  password varchar(255) NOT NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Simulations table
CREATE TABLE simulations (
  id int NOT NULL AUTO_INCREMENT,
  userId int NOT NULL,
  title varchar(255) NOT NULL DEFAULT 'Untitled',
  status enum('Submitted','Running','Done') NOT NULL DEFAULT 'Submitted',
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mode enum('2D','3D') NOT NULL DEFAULT '2D',
  substrate varchar(255) NOT NULL DEFAULT 'Oxygen',
  duration int NOT NULL DEFAULT '5',
  decayRate float DEFAULT '0.1',
  divisionRate float DEFAULT '0.1',
  result json DEFAULT NULL,
  x int NOT NULL DEFAULT '1',
  y int NOT NULL DEFAULT '1',
  z int DEFAULT NULL,
  tumorCount int NOT NULL,
  tumorMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  immuneCount int NOT NULL DEFAULT '0',
  immuneMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  stemCount int NOT NULL DEFAULT '0',
  stemMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  fibroblastCount int NOT NULL DEFAULT '0',
  fibroblastMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  drugCarrierCount int NOT NULL DEFAULT '0',
  drugCarrierMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  PRIMARY KEY (id),
  KEY userId_idx (userId),
  CONSTRAINT userId FOREIGN KEY (userId) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial user data
INSERT INTO users (username, password, createdAt) VALUES
  ('testuser', '$2b$10$sHNnIbthxX4lHHoaN7eJoOWpT2NEVq5F22QIrp48K7EJ56DfZUe4O', '2025-07-08 09:00:29'),
  ('admin123', '$2b$10$hwMLIibKKwSaLQTpIw0querCwJS9eR4xHxgJtFE7q1ftv7UfKXAH.', '2025-07-16 12:22:27');


-- Initial simulation data
INSERT INTO simulations (userId, title, status, mode, substrate, duration, decayRate, divisionRate, x, y, z, tumorCount, tumorMovement, immuneCount, immuneMovement, stemCount, stemMovement, fibroblastCount, fibroblastMovement, drugCarrierCount, drugCarrierMovement, result) VALUES
  (1, 'Completed Cancer Simulation', 'Done', '3D', 'Glucose',120, 0.15, 0.25, 100, 100, 50, 500,'Random', 200, 'Directed', 50, 'None', 100, 'Collective', 25, 'Flow', NULL),
  (1, 'Active Tumor Growth Study', 'Running', '2D', 'Oxygen', 60, 0.10, 0.20, 50, 50, NULL, 250, 'Collective', 150, 'Random', 0, NULL, 0, NULL, 0, NULL, NULL),
  (1, 'Pending Analysis', 'Submitted', '2D', 'Oxygen', 30, 0.05, 0.15,  25,  25,  NULL,  100, 'None', 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL),
  (1, 'Drug Carrier Effectiveness Test', 'Done', '3D', 'Nutrients', 180, 0.20, 0.30, 150, 150, 75, 1000, 'Flow', 500,'Directed', 100, 'Random', 200, 'Collective', 50, 'Directed', '{"finalTumorCount":750,"survivalRate":0.75,"drugEffectiveness":0.82}'),
  (1, 'Basic Simulation Test', 'Submitted', '2D', 'Oxygen', 5, 0.10, 0.10, 1, 1, NULL, 50, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL);

