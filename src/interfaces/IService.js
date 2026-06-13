/**
 * IService — Interface para a camada de regras de negócio
 * ─────────────────────────────────────────────────────────────────────────────
 * Services orquestram DAOs, aplicam validações e regras antes de persistir.
 */
class IService {
  constructor() {
    if (new.target === IService) {
      throw new Error("IService é uma interface e não pode ser instanciada diretamente.");
    }
  }

  async list(filters = {}) { throw new Error("list() não implementado."); }
  async getById(id)        { throw new Error("getById() não implementado."); }
  async create(data)       { throw new Error("create() não implementado."); }
  async update(id, data)   { throw new Error("update() não implementado."); }
  async remove(id)         { throw new Error("remove() não implementado."); }
}

module.exports = IService;
