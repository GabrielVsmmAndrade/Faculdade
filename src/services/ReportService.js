const IService = require("../interfaces/IService");
const pool     = require("../db/mysql");

/**
 * ReportService — agrega dados para relatório PDF. Implementa IService.
 * O frontend usa esses dados com jsPDF para gerar o PDF final.
 */
class ReportService extends IService {
  /**
   * Relatório de ocorrências por período.
   * Retorna: eventos (tabela), totais por status, totais por dispositivo.
   */
  async eventsReport(filters = {}, user = null) {
    let sql = `
      SELECT e.id, e.event_uid, e.level, e.status,
             e.occurred_at, e.received_at, e.notes,
             d.device_uid, d.name AS device_name, d.location
      FROM events e
      JOIN devices d ON d.id = e.device_id
      WHERE 1=1`;
    const params = [];

    // Filtro de zona — OPERADOR só vê seus dispositivos
    if (user && user.role !== "ADMIN") {
      sql += ` AND d.zone_id IN (
        SELECT zone_id FROM user_zone_assignments WHERE user_id = ?)`;
      params.push(user.id);
    }

    if (filters.from)   { sql += " AND e.occurred_at >= ?"; params.push(filters.from); }
    if (filters.to)     { sql += " AND e.occurred_at <= ?"; params.push(filters.to + " 23:59:59"); }
    if (filters.status) { sql += " AND e.status = ?";       params.push(filters.status); }

    sql += " ORDER BY e.occurred_at DESC";

    const [events] = await pool.execute(sql, params);

    // Totais por status
    const byStatus = events.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    // Totais por dispositivo
    const byDevice = events.reduce((acc, e) => {
      acc[e.device_uid] = (acc[e.device_uid] || 0) + 1;
      return acc;
    }, {});

    // Totais por nível
    const byLevel = events.reduce((acc, e) => {
      acc[e.level] = (acc[e.level] || 0) + 1;
      return acc;
    }, {});

    return {
      generated_at: new Date().toISOString(),
      filters,
      totals: {
        total:       events.length,
        by_status:   byStatus,
        by_device:   byDevice,
        by_level:    byLevel,
      },
      events,
    };
  }

  // Stubs IService
  async list()    { return this.eventsReport(); }
  async getById() { throw new Error("N/A"); }
  async create()  { throw new Error("N/A"); }
  async update()  { throw new Error("N/A"); }
  async remove()  { throw new Error("N/A"); }
}

module.exports = new ReportService();
