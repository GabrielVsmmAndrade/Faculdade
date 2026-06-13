/**
 * IDAO — Interface para Data Access Objects (camada de persistência MySQL)
 * ─────────────────────────────────────────────────────────────────────────────
 * JavaScript não tem interfaces nativas, então usamos classe abstrata:
 *  - new.target impede instanciação direta
 *  - cada método lança erro se a classe concreta não sobrescrever
 */
class IDAO {
  constructor() {
    if (new.target === IDAO) {
      throw new Error("IDAO é uma interface e não pode ser instanciada diretamente.");
    }
  }

  async findAll(filters = {}) { throw new Error("findAll() não implementado."); }
  async findById(id)          { throw new Error("findById() não implementado."); }
  async create(data)          { throw new Error("create() não implementado."); }
  async update(id, data)      { throw new Error("update() não implementado."); }
  async delete(id)            { throw new Error("delete() não implementado."); }
}

module.exports = IDAO;
