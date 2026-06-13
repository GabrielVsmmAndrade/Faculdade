-- ─────────────────────────────────────────────────────────────────────────────
-- PanicIoT — Schema MySQL (6 tabelas, relacionamentos 1:N e N:N)
-- ─────────────────────────────────────────────────────────────────────────────
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS paniciot
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paniciot;

-- Tabela 1: usuários (operadores/admins) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          ENUM('ADMIN','OPERADOR') NOT NULL DEFAULT 'OPERADOR',
  avatar_url    VARCHAR(255) NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela 2: zonas/áreas monitoradas ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela 3: dispositivos (1:N com zones) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  device_uid VARCHAR(64)  NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  location   VARCHAR(150) NOT NULL,
  api_key    CHAR(64)     NOT NULL UNIQUE,
  zone_id    INT NULL,
  last_seen  DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_devices_zone
    FOREIGN KEY (zone_id) REFERENCES zones(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabela 4: ocorrências (1:N com devices) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_id   INT NOT NULL,
  event_uid   VARCHAR(80) NOT NULL UNIQUE,
  type        ENUM('PANIC') NOT NULL DEFAULT 'PANIC',
  level       ENUM('ALTO','MEDIO','BAIXO') NOT NULL DEFAULT 'ALTO',
  status      ENUM('ABERTO','ACK','ENCERRADO') NOT NULL DEFAULT 'ABERTO',
  occurred_at DATETIME NOT NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lat         DECIMAL(10,7) NULL,
  lon         DECIMAL(10,7) NULL,
  wifi_hint   VARCHAR(255) NULL,
  notes       TEXT NULL,
  CONSTRAINT fk_events_device
    FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_events_status_time ON events(status, occurred_at);
CREATE INDEX idx_events_device_time ON events(device_id, occurred_at);

-- Tabela 5: histórico de ações (1:N com events e users) ───────────────────────
CREATE TABLE IF NOT EXISTS event_actions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id      BIGINT NOT NULL,
  action        ENUM('ACK','ENCERRAR') NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  comment       VARCHAR(255) NULL,
  user_id       INT NULL,
  action_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_actions_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_actions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabela 6 (N:N): atribuição de operadores a zonas ────────────────────────────
CREATE TABLE IF NOT EXISTS user_zone_assignments (
  user_id     INT NOT NULL,
  zone_id     INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, zone_id),
  CONSTRAINT fk_uza_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_uza_zone
    FOREIGN KEY (zone_id) REFERENCES zones(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
