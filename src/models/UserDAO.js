const IDAO = require("../interfaces/IDAO");
const pool = require("../db/mysql");

/**
 * UserDAO — acesso à tabela users. Implementa IDAO.
 */
class UserDAO extends IDAO {
  async findAll(filters = {}) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, avatar_url, active, created_at
       FROM users ORDER BY id ASC`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, avatar_url, active, created_at
       FROM users WHERE id = ?`, [id]
    );
    return rows[0] || null;
  }

  // Inclui password_hash para autenticação (nunca expor no controller)
  async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, active, password_hash
       FROM users WHERE username = ?`, [username]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { username, email, password_hash, full_name, role = "OPERADOR" } = data;
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, role]
    );
    return this.findById(result.insertId);
  }

  async update(id, data) {
    const { full_name, email, role, active, avatar_url } = data;
    await pool.execute(
      `UPDATE users SET full_name=?, email=?, role=?, active=?, avatar_url=? WHERE id=?`,
      [full_name, email, role, active, avatar_url, id]
    );
    return this.findById(id);
  }

  async updatePassword(id, password_hash) {
    await pool.execute(`UPDATE users SET password_hash=? WHERE id=?`, [password_hash, id]);
  }

  async updateAvatar(id, avatar_url) {
    await pool.execute(`UPDATE users SET avatar_url=? WHERE id=?`, [avatar_url, id]);
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute(`DELETE FROM users WHERE id=?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new UserDAO();
