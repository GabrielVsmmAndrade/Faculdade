const IController   = require("../interfaces/IController");
const ReportService = require("../services/ReportService");

/**
 * ReportController — endpoints de dados para geração de PDF no frontend.
 * O frontend usa jsPDF + jspdf-autotable para montar o arquivo.
 * Implementa IController.
 */
class ReportController extends IController {
  // GET /api/reports/events?from=2026-01-01&to=2026-12-31&status=ABERTO
  async index(req, res, next) {
    try {
      const data = await ReportService.eventsReport(req.query, req.user);
      res.json(data);
    } catch (err) { next(err); }
  }

  // Stubs IController
  async show(req, res, next)   { next(new Error("N/A")); }
  async store(req, res, next)  { next(new Error("N/A")); }
  async update(req, res, next) { next(new Error("N/A")); }
  async destroy(req, res, next){ next(new Error("N/A")); }
}

module.exports = new ReportController();
