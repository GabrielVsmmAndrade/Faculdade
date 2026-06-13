const IService = require("../interfaces/IService");
const pool     = require("../db/mysql");
const Log      = require("../models/LogModel");

/**
 * ExportService — exportação e importação de dados JSON. Implementa IService.
 *
 * Tabelas exportáveis: devices, events, users, zones
 * A importação valida estrutura e insere linha a linha com tratamento de erro.
 */

// Mapa: nome da tabela → colunas permitidas na importação (evita injeção)
const ALLOWED_TABLES = {
  devices: ["device_uid", "name", "location", "api_key", "zone_id"],
  events:  ["device_id", "event_uid", "level", "status", "occurred_at", "notes", "lat", "lon", "wifi_hint"],
  zones:   ["name", "description"],
  users:   ["username", "email", "full_name", "role"],
};

class ExportService extends IService {
  // ── Exportação ──────────────────────────────────────────────────────────────
  async exportTable(tableName) {
    if (!ALLOWED_TABLES[tableName]) {
      const e = new Error(`Tabela '${tableName}' não é exportável. Use: ${Object.keys(ALLOWED_TABLES).join(", ")}`);
      e.status = 400; throw e;
    }
    const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\``);
    return rows;
  }

  // ── Importação ──────────────────────────────────────────────────────────────
  async importTable(tableName, records, actorUsername = "system") {
    if (!ALLOWED_TABLES[tableName]) {
      const e = new Error(`Tabela '${tableName}' não é importável.`);
      e.status = 400; throw e;
    }
    if (!Array.isArray(records) || records.length === 0) {
      const e = new Error("O JSON deve conter um array com pelo menos 1 registro.");
      e.status = 400; throw e;
    }

    const allowedCols = ALLOWED_TABLES[tableName];
    const results = { inserted: 0, skipped: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // Filtra apenas as colunas permitidas
      const filteredKeys = Object.keys(record).filter(k => allowedCols.includes(k));
      if (filteredKeys.length === 0) {
        results.errors.push({ index: i, reason: "Nenhuma coluna válida encontrada" });
        results.skipped++;
        continue;
      }

      const cols   = filteredKeys.join(", ");
      const placeholders = filteredKeys.map(() => "?").join(", ");
      const values = filteredKeys.map(k => record[k]);

      try {
        await pool.execute(
          `INSERT INTO \`${tableName}\` (${cols}) VALUES (${placeholders})`,
          values
        );
        results.inserted++;
      } catch (err) {
        results.errors.push({ index: i, reason: err.message });
        results.skipped++;
      }
    }

    // Grava log da importação
    await Log.create({
      acao: "INSERT", usuario: actorUsername,
      tabela: tableName,
      detalhes: {
        total: records.length,
        inserted: results.inserted,
        skipped: results.skipped,
      },
    }).catch(() => {});

    return results;
  }

  // Stubs IService
  async list()         { throw new Error("Use exportTable()"); }
  async getById()      { throw new Error("N/A"); }
  async create()       { throw new Error("Use importTable()"); }
  async update()       { throw new Error("N/A"); }
  async remove()       { throw new Error("N/A"); }
}

module.exports = new ExportService();
