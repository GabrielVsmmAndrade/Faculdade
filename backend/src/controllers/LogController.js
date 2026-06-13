const IController = require("../interfaces/IController");
const LogService  = require("../services/LogService");

/**
 * LogController — listagem e exportação XML dos logs. Implementa IController.
 */
class LogController extends IController {
  // GET /api/logs?usuario=admin&acao=LOGIN&from=2026-01-01&to=2026-12-31
  async index(req, res, next) {
    try {
      const logs = await LogService.list(req.query);
      res.json(logs);
    } catch (err) { next(err); }
  }

  // GET /api/logs/export/xml?usuario=admin&from=2026-01-01&to=2026-12-31
  async exportXml(req, res, next) {
    try {
      const xml = await LogService.exportXml(req.query);
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="logs_${Date.now()}.xml"`);
      res.send(xml);
    } catch (err) { next(err); }
  }

  // Stubs IController
  async show(req, res, next)   { next(new Error("N/A")); }
  async store(req, res, next)  { next(new Error("N/A")); }
  async update(req, res, next) { next(new Error("N/A")); }
  async destroy(req, res, next){ next(new Error("N/A")); }
}

module.exports = new LogController();
