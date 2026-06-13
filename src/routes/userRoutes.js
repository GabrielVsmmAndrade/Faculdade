const express          = require("express");
const UserController   = require("../controllers/UserController");
const authMiddleware   = require("../middleware/authMiddleware");

const router = express.Router();

// Todas as rotas de usuários exigem autenticação
router.use(authMiddleware);

router.get("/users",        (req, res, next) => UserController.index(req, res, next));
router.get("/users/:id",    (req, res, next) => UserController.show(req, res, next));
router.post("/users",       requireAdmin, (req, res, next) => UserController.store(req, res, next));
router.put("/users/:id",    requireAdmin, (req, res, next) => UserController.update(req, res, next));
router.delete("/users/:id", requireAdmin, (req, res, next) => UserController.destroy(req, res, next));

function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

module.exports = router;
