const IDAO = require("../interfaces/IDAO");
const pool = require("../db/mysql");

/**
 * EventActionDAO — histórico de ações (ACK/ENCERRAR). Implementa IDAO.
 */
class EventActionDAO extends IDAO {
  async findAll(filters = {}) {
    const [rows] = await pool.execute(
      `SELECT * FROM event_actions ORDER BY action_at DESC LIMIT 200`
    );
    return rows;
  }

  async findByEvent(eventId) {
    const [rows] = await pool.execute(
      `SELECT * FROM event_actions WHERE event_id = ? ORDER BY action_at ASC`,
      [eventId]
    );
    return rows;
  }

  async create(data) {
    const { event_id, action, operator_name, comment = null, user_id = null } = data;
    const [result] = await pool.execute(
      `INSERT INTO event_actions (event_id, action, operator_name, comment, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, action, operator_name, comment, user_id]
    );
    return result.insertId;
  }
}

module.exports = new EventActionDAO();
