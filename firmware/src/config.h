#pragma once

// ─── Wi-Fi ────────────────────────────────────────────────────────────────────
#define WIFI_SSID   "nome_rede"
#define WIFI_PASS   "senha"

// ─── API ──────────────────────────────────────────────────────────────────────
#define API_BASE    "http:// ip_local :3000/api"
#define API_KEY     "2963acfdb0b41f71e66ed1cf5b6a4f5c52a5bf365c1d5a2fd983362973e52965"
#define DEVICE_UID  "esp32-02"
//boatao 01:
//#define API_KEY     "ccafce7861d4a29e07297182edd0aea655142ed938a5f4ef802a3678cb1efa0f"
//#define DEVICE_UID  "esp32-01"

//botao 02
//#define API_KEY     "2963acfdb0b41f71e66ed1cf5b6a4f5c52a5bf365c1d5a2fd983362973e52965"
//#define DEVICE_UID  "esp32-02"

// ─── Hardware ─────────────────────────────────────────────────────────────────
#define PIN_BUTTON  26    // Botão emergência — comum no VCC (HIGH = pressionado)

// ─── Comportamento ────────────────────────────────────────────────────────────
#define CONFIRM_MS              2000   // Tempo de acionamento para confirmar pânico
#define HEARTBEAT_INTERVAL_MS  30000   // Intervalo de heartbeat (30 s)
#define MAX_RETRIES                3   // Tentativas de envio antes de desistir
#define RETRY_DELAY_MS          5000   // Espera entre tentativas (5 s)
