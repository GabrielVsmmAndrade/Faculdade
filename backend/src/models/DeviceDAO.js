const IDAO = require("../interfaces/IDAO");
const pool = require("../db/mysql");

/**
 * DeviceDAO — acesso à tabela devices. Implementa IDAO.
 */
class DeviceDAO extends IDAO {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT id, device_uid, name, location, zone_id, last_seen, created_at
       FROM devices ORDER BY id ASC`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, device_uid, name, location, zone_id, last_seen, created_at
       FROM devices WHERE id = ?`, [id]
    );
    return rows[0] || null;
  }

  async findByApiKey(apiKey) {
    const [rows] = await pool.execute(
      `SELECT id, device_uid, name, location FROM devices WHERE api_key = ?`,
      [apiKey]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { device_uid, name, location, api_key, zone_id = null } = data;
    const [result] = await pool.execute(
      `INSERT INTO devices (device_uid, name, location, api_key, zone_id)
       VALUES (?, ?, ?, ?, ?)`,
      [device_uid, name, location, api_key, zone_id]
    );
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const { name, location, zone_id = null } = data;
    await pool.execute(
      `UPDATE devices SET name = ?, location = ?, zone_id = ? WHERE id = ?`,
      [name, location, zone_id, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute(`DELETE FROM devices WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  async touchLastSeen(id) {
    await pool.execute(`UPDATE devices SET last_seen = NOW() WHERE id = ?`, [id]);
  }
}

module.exports = new DeviceDAO();
