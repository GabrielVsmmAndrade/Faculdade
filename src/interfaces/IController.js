/**
 * IController — Interface para os controllers (camada HTTP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Controllers recebem (req, res), chamam o service e devolvem a resposta.
 * Não contêm regra de negócio nem SQL.
 */
class IController {
  constructor() {
    if (new.target === IController) {
      throw new Error("IController é uma interface e não pode ser instanciada diretamente.");
    }
  }

  async index(req, res, next)  { throw new Error("index() não implementado."); }
  async show(req, res, next)   { throw new Error("show() não implementado."); }
  async store(req, res, next)  { throw new Error("store() não implementado."); }
  async update(req, res, next) { throw new Error("update() não implementado."); }
  async destroy(req, res, next){ throw new Error("destroy() não implementado."); }
}

module.exports = IController;
