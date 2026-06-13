/*
 * PanicIoT — Firmware ESP32
 * ─────────────────────────────────────────────────────────────────────────────
 * Hardware:
 *   GPIO 26 → Botão emergência (comum no VCC; HIGH = pressionado)
 *
 * Fluxo:
 *   1. Conecta Wi-Fi
 *   2. Loop: lê botão com debounce + confirmação de 2 s
 *   3. Ao confirmar: envia POST /api/events (retry até 3×)
 *   4. Heartbeat a cada 30 s via POST /api/heartbeat
 * ─────────────────────────────────────────────────────────────────────────────
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "config.h"

// ─── Protótipos ──────────────────────────────────────────────────────────────
void   connectWiFi();
bool   postEvent(const String& eventUid);
bool   postHeartbeat();
String buildEventUid();

// ─── Estado do botão ─────────────────────────────────────────────────────────
enum BtnState { IDLE, PRESSING, CONFIRMED };
BtnState btnState = IDLE;

unsigned long pressStart    = 0;
unsigned long lastHeartbeat = 0;
bool          eventFired    = false;

Preferences prefs;

// ─────────────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== PanicIoT iniciando ===");

  pinMode(PIN_BUTTON, INPUT_PULLUP);

  prefs.begin("paniciot", false);

  connectWiFi();

  postHeartbeat();
  lastHeartbeat = millis();

  Serial.println("✅ Setup concluído. Aguardando acionamento...");
}

// ─────────────────────────────────────────────────────────────────────────────
void loop() {
  // ── Reconexão Wi-Fi ───────────────────────────────────────────────────────
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  Wi-Fi desconectado — reconectando...");
    connectWiFi();
  }

  // ── Leitura do botão ──────────────────────────────────────────────────────
  bool pressed = (digitalRead(PIN_BUTTON) == HIGH);

  switch (btnState) {
    case IDLE:
      if (pressed) {
        pressStart = millis();
        btnState   = PRESSING;
        eventFired = false;
        Serial.println("🟡 Botão pressionado — aguardando confirmação (2 s)...");
      }
      break;

    case PRESSING:
      if (!pressed) {
        Serial.println("↩️  Botão solto antes de confirmar — cancelado.");
        btnState = IDLE;
        break;
      }
      if (millis() - pressStart >= CONFIRM_MS) {
        btnState = CONFIRMED;
      }
      break;

    case CONFIRMED:
      if (!eventFired) {
        eventFired = true;
        Serial.println("🚨 PÂNICO CONFIRMADO! Enviando evento...");

        String uid  = buildEventUid();
        bool   sent = false;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          Serial.printf("   Tentativa %d/%d — event_uid: %s\n",
                        attempt, MAX_RETRIES, uid.c_str());

          if (postEvent(uid)) {
            sent = true;
            Serial.println("✅ Evento enviado com sucesso!");
            break;
          }

          Serial.println("❌ Falha no envio.");
          if (attempt < MAX_RETRIES) delay(RETRY_DELAY_MS);
        }

        if (!sent) {
          Serial.println("🔴 Não foi possível enviar após todas as tentativas.");
        }
      }

      if (!pressed) {
        Serial.println("🔓 Botão liberado. Sistema pronto.");
        btnState = IDLE;
      }
      break;
  }

  // ── Heartbeat ─────────────────────────────────────────────────────────────
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
    postHeartbeat();
    lastHeartbeat = millis();
  }

  delay(20);
}

// ─────────────────────────────────────────────────────────────────────────────
void connectWiFi() {
  Serial.printf("📡 Conectando ao Wi-Fi: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✅ Wi-Fi conectado! IP: %s\n",
                  WiFi.localIP().toString().c_str());
    //Serial.printf("   Gateway: %s\n", WiFi.gatewayIP().toString().c_str());//
  } else {
    Serial.println("\n❌ Falha ao conectar Wi-Fi. Continuando offline...");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
String buildEventUid() {
  uint32_t counter = prefs.getUInt("evt_counter", 0) + 1;
  prefs.putUInt("evt_counter", counter);

  char uid[40];
  snprintf(uid, sizeof(uid), "%s-%07lu", DEVICE_UID, (unsigned long)counter);
  return String(uid);
}

// ─────────────────────────────────────────────────────────────────────────────
bool postEvent(const String& eventUid) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(String(API_BASE) + "/events");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  http.setTimeout(8000);

  JsonDocument doc;
  doc["event_uid"]   = eventUid;
  doc["occurred_at"] = "";
  doc["level"]       = "ALTO";
  doc["notes"]       = "Botao de panico acionado";
  doc["wifi_hint"]   = WiFi.SSID();

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();

  Serial.printf("   HTTP response: %d\n", code);
  return (code == 200 || code == 201);
}

// ─────────────────────────────────────────────────────────────────────────────
bool postHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(String(API_BASE) + "/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  http.setTimeout(5000);

  int code = http.POST("{}");
  http.end();

  Serial.printf("💓 Heartbeat → HTTP %d\n", code);
  return (code == 200);
}