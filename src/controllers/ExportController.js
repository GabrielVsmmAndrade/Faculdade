const IController    = require("../interfaces/IController");
const ExportService  = require("../services/ExportService");

/**
 * ExportController — exportação e importação de dados JSON. Implementa IController.
 */
class ExportController extends IController {
  // GET /api/export/json?table=events
  async index(req, res, next) {
    try {
      const { table } = req.query;
      if (!table) return res.status(400).json({ error: "Parâmetro 'table' é obrigatório" });

      const data = await ExportService.exportTable(table);
      const json = JSON.stringify({ table, exported_at: new Date().toISOString(), total: data.length, data }, null, 2);

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${table}_${Date.now()}.json"`);
      res.send(json);
    } catch (err) { next(err); }
  }

  // POST /api/import/json?table=events  (multipart com arquivo)
  async store(req, res, next) {
    try {
      const { table } = req.query;
      if (!table) return res.status(400).json({ error: "Parâmetro 'table' é obrigatório" });
      if (!req.file) return res.status(400).json({ error: "Arquivo JSON não enviado" });

      let records;
      try {
        // Remove BOM (UTF-8: EF BB BF) caso presente — comum no Windows/PowerShell
        const raw = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
        const parsed = JSON.parse(raw);
        // Aceita { data: [...] } ou array direto
        records = Array.isArray(parsed) ? parsed : (parsed.data || []);
      } catch {
        return res.status(400).json({ error: "Arquivo JSON inválido ou malformado" });
      }

      const result = await ExportService.importTable(table, records, req.user?.username);
      res.json({ ok: true, table, ...result });
    } catch (err) { next(err); }
  }

  // Stubs IController
  async show(req, res, next)   { next(new Error("N/A")); }
  async update(req, res, next) { next(new Error("N/A")); }
  async destroy(req, res, next){ next(new Error("N/A")); }
}

module.exports = new ExportController();
