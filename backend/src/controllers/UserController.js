const IController  = require("../interfaces/IController");
const UserService  = require("../services/UserService");

/**
 * UserController — CRUD de usuários. Implementa IController.
 * CRUD completo exigido pelo trabalho: Create, Read, Update, Delete.
 */
class UserController extends IController {
  // GET /api/users
  async index(req, res, next) {
    try { res.json(await UserService.list()); }
    catch (err) { next(err); }
  }

  // GET /api/users/:id
  async show(req, res, next) {
    try { res.json(await UserService.getById(Number(req.params.id))); }
    catch (err) { next(err); }
  }

  // POST /api/users
  async store(req, res, next) {
    try {
      const user = await UserService.create(req.body, req.user?.username);
      res.status(201).json(user);
    } catch (err) { next(err); }
  }

  // PUT /api/users/:id
  async update(req, res, next) {
    try {
      const user = await UserService.update(
        Number(req.params.id), req.body, req.user?.username
      );
      res.json(user);
    } catch (err) { next(err); }
  }

  // DELETE /api/users/:id
  async destroy(req, res, next) {
    try {
      // Impede que o admin apague a si mesmo
      if (Number(req.params.id) === req.user?.id) {
        return res.status(400).json({ error: "Não é possível apagar seu próprio usuário" });
      }
      res.json(await UserService.remove(Number(req.params.id), req.user?.username));
    } catch (err) { next(err); }
  }
}

module.exports = new UserController();
