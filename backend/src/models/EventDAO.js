const IDAO = require("../interfaces/IDAO");
const pool = require("../db/mysql");

/**
 * EventDAO — acesso à tabela events. Implementa IDAO.
 */
class EventDAO extends IDAO {
  /**
   * @param {object} filters  { status, device_uid }
   * @param {object|null} user  { id, role } vindo do JWT
   * ADMIN vê tudo; OPERADOR vê apenas dispositivos de suas zonas.
   */
  async findAll(filters = {}, user = null) {
    let sql = `
      SELECT e.id, e.event_uid, e.level, e.status, e.occurred_at, e.received_at,
             d.device_uid, d.name AS device_name, d.location
      FROM events e
      JOIN devices d ON d.id = e.device_id
      WHERE 1=1`;
    const params = [];

    // Filtro de zona — OPERADOR só vê dispositivos das suas zonas
    if (user && user.role !== "ADMIN") {
      sql += ` AND d.zone_id IN (
        SELECT zone_id FROM user_zone_assignments WHERE user_id = ?)`;
      params.push(user.id);
    }

    if (filters.status)     { sql += " AND e.status = ?";     params.push(filters.status); }
    if (filters.device_uid) { sql += " AND d.device_uid = ?"; params.push(filters.device_uid); }

    sql += " ORDER BY e.occurred_at DESC LIMIT 200";
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, d.device_uid, d.name AS device_name, d.location
       FROM events e JOIN devices d ON d.id = e.device_id
       WHERE e.id = ?`, [id]
    );
    return rows[0] || null;
  }

  async findByUid(eventUid) {
    const [rows] = await pool.execute(
      `SELECT id, status FROM events WHERE event_uid = ?`, [eventUid]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { device_id, event_uid, level = "ALTO", occurred_at,
            lat = null, lon = null, wifi_hint = null, notes = null } = data;
    const [result] = await pool.execute(
      `INSERT INTO events
        (device_id, event_uid, level, status, occurred_at, lat, lon, wifi_hint, notes)
       VALUES (?, ?, ?, 'ABERTO', ?, ?, ?, ?, ?)`,
      [device_id, event_uid, level, occurred_at, lat, lon, wifi_hint, notes]
    );
    return result.insertId;
  }

  async updateStatus(id, status) {
    await pool.execute(`UPDATE events SET status = ? WHERE id = ?`, [status, id]);
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute(`DELETE FROM events WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // Agregações para gráficos — respeitam filtro de zona
  async countByStatus(user = null) {
    let sql = `SELECT e.status, COUNT(*) AS total FROM events e
               JOIN devices d ON d.id = e.device_id WHERE 1=1`;
    const params = [];
    if (user && user.role !== "ADMIN") {
      sql += ` AND d.zone_id IN (SELECT zone_id FROM user_zone_assignments WHERE user_id = ?)`;
      params.push(user.id);
    }
    sql += " GROUP BY e.status";
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async countByDevice(user = null) {
    let sql = `SELECT d.device_uid, COUNT(*) AS total FROM events e
               JOIN devices d ON d.id = e.device_id WHERE 1=1`;
    const params = [];
    if (user && user.role !== "ADMIN") {
      sql += ` AND d.zone_id IN (SELECT zone_id FROM user_zone_assignments WHERE user_id = ?)`;
      params.push(user.id);
    }
    sql += " GROUP BY d.device_uid ORDER BY total DESC";
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = new EventDAO();
