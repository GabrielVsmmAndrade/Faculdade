const express          = require("express");
const DeviceController = require("../controllers/DeviceController");
const deviceAuth       = require("../middleware/deviceAuthMiddleware");
const authMiddleware   = require("../middleware/authMiddleware");
const validate         = require("../middleware/validationMiddleware");
const { validators }   = require("../middleware/validationMiddleware");

const router = express.Router();

// ── Middleware para exigir perfil ADMIN ───────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

// ── ESP32 (autenticado por X-API-Key, sem JWT) ────────────────────────────────
router.post("/heartbeat", deviceAuth, (req, res, next) =>
  DeviceController.heartbeat(req, res, next));

// ── Leitura: qualquer usuário autenticado ─────────────────────────────────────
router.get("/devices",     authMiddleware, (req, res, next) => DeviceController.index(req, res, next));
router.get("/devices/:id", authMiddleware, (req, res, next) => DeviceController.show(req, res, next));

// ── Escrita: somente ADMIN ────────────────────────────────────────────────────
router.post("/devices",
  authMiddleware, requireAdmin,
  validate(validators.device),
  (req, res, next) => DeviceController.store(req, res, next));

router.put("/devices/:id",
  authMiddleware, requireAdmin,
  (req, res, next) => DeviceController.update(req, res, next));

router.delete("/devices/:id",
  authMiddleware, requireAdmin,
  (req, res, next) => DeviceController.destroy(req, res, next));

module.exports = router;
