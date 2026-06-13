const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const IService = require("../interfaces/IService");
const UserDAO  = require("../models/UserDAO");
const Log      = require("../models/LogModel");

/**
 * AuthService — login, logout e geração de tokens JWT.
 * Implementa IService (usa list/getById/create herdados; restam login/logout).
 */
class AuthService extends IService {
  /**
   * Autentica usuário e retorna JWT.
   * Grava log de LOGIN no MongoDB.
   */
  async login(username, password, ip, userAgent) {
    const user = await UserDAO.findByUsername(username);

    if (!user || !user.active) {
      await Log.create({
        acao: "LOGIN", usuario: username,
        detalhes: { sucesso: false, motivo: "usuário não encontrado ou inativo" },
        ip, user_agent: userAgent
      });
      const err = new Error("Credenciais inválidas"); err.status = 401; throw err;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await Log.create({
        acao: "LOGIN", usuario: username,
        detalhes: { sucesso: false, motivo: "senha incorreta" },
        ip, user_agent: userAgent
      });
      const err = new Error("Credenciais inválidas"); err.status = 401; throw err;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await Log.create({
      acao: "LOGIN", usuario: user.username,
      detalhes: { sucesso: true, role: user.role },
      ip, user_agent: userAgent
    });

    // Remove hash da resposta
    const { password_hash, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async logout(username, ip, userAgent) {
    await Log.create({
      acao: "LOGOUT", usuario: username,
      ip, user_agent: userAgent
    });
    return { ok: true };
  }

  // Stubs para satisfazer IService (não usados em Auth)
  async list()           { throw new Error("Não aplicável a AuthService"); }
  async getById()        { throw new Error("Não aplicável a AuthService"); }
  async create(data)     { throw new Error("Use UserService.create"); }
  async update()         { throw new Error("Não aplicável a AuthService"); }
  async remove()         { throw new Error("Não aplicável a AuthService"); }
}

module.exports = new AuthService();
