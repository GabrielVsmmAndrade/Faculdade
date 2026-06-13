const IController  = require("../interfaces/IController");
const AuthService  = require("../services/AuthService");
const UserService  = require("../services/UserService");

/**
 * AuthController — login, logout, registro e perfil. Implementa IController.
 */
class AuthController extends IController {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: "username e password são obrigatórios" });
      }
      const result = await AuthService.login(
        username, password,
        req.ip, req.get("user-agent")
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      await AuthService.logout(
        req.user?.username || "unknown",
        req.ip, req.get("user-agent")
      );
      res.json({ ok: true });
    } catch (err) { next(err); }
  }

  // POST /api/auth/register  (ADMIN only — protegido pelo authMiddleware)
  async store(req, res, next) {
    try {
      const user = await UserService.create(req.body, req.user?.username);
      res.status(201).json(user);
    } catch (err) { next(err); }
  }

  // GET /api/auth/me
  async me(req, res, next) {
    try {
      const user = await UserService.getById(req.user.id);
      res.json(user);
    } catch (err) { next(err); }
  }

  // Stubs obrigatórios da IController
  async index(req, res, next)   { next(new Error("Não implementado")); }
  async show(req, res, next)    { next(new Error("Não implementado")); }
  async update(req, res, next)  { next(new Error("Não implementado")); }
  async destroy(req, res, next) { next(new Error("Não implementado")); }
}

module.exports = new AuthController();
