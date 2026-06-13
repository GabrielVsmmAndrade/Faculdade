-- ─────────────────────────────────────────────────────────────────────────────
-- PanicIoT — Dados de teste (seeds)
-- Senha dos usuários de teste: "123456" (hash bcrypt — gere o seu na Fase 2)
-- ─────────────────────────────────────────────────────────────────────────────
USE paniciot;

-- Usuários (password_hash de exemplo — substituir por bcrypt real)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin',  'admin@paniciot.com',  '$2b$10$exemploHashBcryptAqui000000000000000000000000000000', 'Administrador', 'ADMIN'),
  ('joao',   'joao@paniciot.com',   '$2b$10$exemploHashBcryptAqui000000000000000000000000000000', 'João Silva',   'OPERADOR'),
  ('maria',  'maria@paniciot.com',  '$2b$10$exemploHashBcryptAqui000000000000000000000000000000', 'Maria Souza',  'OPERADOR');

-- Zonas
INSERT INTO zones (name, description) VALUES
  ('Térreo',      'Recepção e entrada principal'),
  ('1º Andar',    'Escritórios administrativos');

-- Dispositivos
INSERT INTO devices (device_uid, name, location, api_key, zone_id) VALUES
  ('esp32-01', 'Botão Recepção', 'Térreo / Recepção',
   'ccafce7861d4a29e07297182edd0aea655142ed938a5f4ef802a3678cb1efa0f', 1);

-- Atribuições N:N (operadores ↔ zonas)
INSERT INTO user_zone_assignments (user_id, zone_id) VALUES
  (2, 1),  -- João → Térreo
  (3, 2),  -- Maria → 1º Andar
  (1, 1), (1, 2);  -- Admin → ambas

-- Eventos de teste
INSERT INTO events (device_id, event_uid, level, status, occurred_at) VALUES
  (1, 'esp32-01-0000001', 'ALTO', 'ENCERRADO', '2026-05-10 09:15:00'),
  (1, 'esp32-01-0000002', 'ALTO', 'ACK',       '2026-05-15 14:30:00'),
  (1, 'esp32-01-0000003', 'ALTO', 'ABERTO',    '2026-05-20 11:00:00'),
  (1, 'esp32-01-0000004', 'MEDIO','ABERTO',    '2026-05-21 16:45:00'),
  (1, 'esp32-01-0000005', 'ALTO', 'ABERTO',    '2026-05-22 08:20:00');

-- Ações de teste
INSERT INTO event_actions (event_id, action, operator_name, comment, user_id) VALUES
  (1, 'ACK',      'João Silva', 'Verificado no local', 2),
  (1, 'ENCERRAR', 'João Silva', 'Falso alarme',        2),
  (2, 'ACK',      'Maria Souza','Em atendimento',       3);
