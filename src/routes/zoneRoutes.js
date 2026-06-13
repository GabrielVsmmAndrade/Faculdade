const express        = require("express");
const pool           = require("../db/mysql");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

// GET /api/zones — lista todas
router.get("/zones", authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description FROM zones ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/zones/:id/users — lista usuários vinculados à zona
router.get("/zones/:id/users", authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.full_name, u.role
       FROM users u
       JOIN user_zone_assignments uza ON uza.user_id = u.id
       WHERE uza.zone_id = ?
       ORDER BY u.full_name ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/zones — cria zona (ADMIN)
router.post("/zones", authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { name, description = null } = req.body || {};
    if (!name) return res.status(400).json({ error: "name é obrigatório" });
    const [result] = await pool.execute(
      "INSERT INTO zones (name, description) VALUES (?, ?)", [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) { next(err); }
});

// POST /api/zones/assign — vincula usuário a zona (ADMIN)
router.post("/zones/assign", authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { user_id, zone_id } = req.body || {};
    if (!user_id || !zone_id) {
      return res.status(400).json({ error: "user_id e zone_id são obrigatórios" });
    }
    await pool.execute(
      `INSERT IGNORE INTO user_zone_assignments (user_id, zone_id) VALUES (?, ?)`,
      [user_id, zone_id]
    );
    res.json({ ok: true, user_id, zone_id });
  } catch (err) { next(err); }
});

// DELETE /api/zones/assign — remove vínculo usuário-zona (ADMIN)
router.delete("/zones/assign", authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { user_id, zone_id } = req.body || {};
    await pool.execute(
      "DELETE FROM user_zone_assignments WHERE user_id = ? AND zone_id = ?",
      [user_id, zone_id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
