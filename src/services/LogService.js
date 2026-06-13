const IService      = require("../interfaces/IService");
const Log           = require("../models/LogModel");
const { logsToXml } = require("../utils/xmlExporter");

/**
 * LogService — consulta e exportação de logs do MongoDB. Implementa IService.
 */
class LogService extends IService {
  async list(filters = {}) {
    const query = {};
    if (filters.usuario)  query.usuario = new RegExp(filters.usuario, "i");
    if (filters.acao)     query.acao    = filters.acao.toUpperCase();
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) query.timestamp.$gte = new Date(filters.from);
      if (filters.to)   query.timestamp.$lte = new Date(filters.to + "T23:59:59Z");
    }

    return Log.find(query).sort({ timestamp: -1 }).limit(500).lean();
  }

  async exportXml(filters = {}) {
    const logs = await this.list(filters);
    if (logs.length === 0) {
      const e = new Error("Nenhum log encontrado para os filtros informados.");
      e.status = 404; throw e;
    }
    return logsToXml(logs);
  }

  // Stubs IService
  async getById(id)  { return Log.findById(id).lean(); }
  async create(data) { return Log.create(data); }
  async update()     { throw new Error("Logs são imutáveis."); }
  async remove()     { throw new Error("Logs são imutáveis."); }
}

module.exports = new LogService();
