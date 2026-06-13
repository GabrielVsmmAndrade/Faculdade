const express        = require("express");
const AuthController = require("../controllers/AuthController");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");
const validate       = require("../middleware/validationMiddleware");

const router = express.Router();

// ── Rota pública ──────────────────────────────────────────────────────────────
router.post("/auth/login", (req, res, next) => AuthController.login(req, res, next));

// ── Rotas protegidas (token obrigatório) ──────────────────────────────────────
router.use(authMiddleware);

router.post("/auth/logout",   (req, res, next) => AuthController.logout(req, res, next));
router.get("/auth/me",        (req, res, next) => AuthController.me(req, res, next));

// Registro de usuário — somente ADMIN
router.post("/auth/register", requireAdmin, (req, res, next) => AuthController.store(req, res, next));

// ── Helpers ───────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

module.exports = router;
