const bcrypt  = require("bcrypt");
const IService = require("../interfaces/IService");
const UserDAO  = require("../models/UserDAO");
const Log      = require("../models/LogModel");

/**
 * UserService — CRUD de usuários com hash de senha e logs. Implementa IService.
 */
class UserService extends IService {
  async list() { return UserDAO.findAll(); }

  async getById(id) {
    const user = await UserDAO.findById(id);
    if (!user) { const e = new Error("Usuário não encontrado"); e.status = 404; throw e; }
    return user;
  }

  async create(data, actorUsername = "system") {
    const { username, email, password, full_name, role } = data;

    if (!username || !email || !password || !full_name) {
      const e = new Error("username, email, password e full_name são obrigatórios");
      e.status = 400; throw e;
    }
    if (password.length < 6) {
      const e = new Error("Senha mínima: 6 caracteres"); e.status = 400; throw e;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await UserDAO.create({ username, email, password_hash, full_name, role });

    await Log.create({
      acao: "INSERT", usuario: actorUsername,
      tabela: "users", registro_id: user.id,
      depois: { username, email, full_name, role }
    });

    return user;
  }

  async update(id, data, actorUsername = "system") {
    const antes = await UserDAO.findById(id);
    if (!antes) { const e = new Error("Usuário não encontrado"); e.status = 404; throw e; }

    const updated = await UserDAO.update(id, {
      full_name:  data.full_name  ?? antes.full_name,
      email:      data.email      ?? antes.email,
      role:       data.role       ?? antes.role,
      active:     data.active     ?? antes.active,
      avatar_url: data.avatar_url ?? antes.avatar_url,
    });

    await Log.create({
      acao: "UPDATE", usuario: actorUsername,
      tabela: "users", registro_id: id,
      antes, depois: updated
    });

    return updated;
  }

  async updatePassword(id, newPassword, actorUsername = "system") {
    if (!newPassword || newPassword.length < 6) {
      const e = new Error("Senha mínima: 6 caracteres"); e.status = 400; throw e;
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await UserDAO.updatePassword(id, password_hash);
    await Log.create({
      acao: "UPDATE", usuario: actorUsername,
      tabela: "users", registro_id: id,
      detalhes: { campo: "password_hash" }
    });
    return { ok: true };
  }

  async updateAvatar(id, avatarUrl, actorUsername = "system") {
    const user = await UserDAO.updateAvatar(id, avatarUrl);
    await Log.create({
      acao: "UPDATE", usuario: actorUsername,
      tabela: "users", registro_id: id,
      depois: { avatar_url: avatarUrl }
    });
    return user;
  }

  async remove(id, actorUsername = "system") {
    const user = await UserDAO.findById(id);
    if (!user) { const e = new Error("Usuário não encontrado"); e.status = 404; throw e; }
    await UserDAO.delete(id);
    await Log.create({
      acao: "DELETE", usuario: actorUsername,
      tabela: "users", registro_id: id,
      detalhes: { username: user.username }
    });
    return { ok: true };
  }
}

module.exports = new UserService();
