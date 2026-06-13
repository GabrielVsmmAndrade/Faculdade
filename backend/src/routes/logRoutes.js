const express       = require("express");
const LogController = require("../controllers/LogController");

const router = express.Router();

// GET /api/logs?usuario=admin&acao=LOGIN&from=...&to=...
router.get("/logs", (req, res, next) =>
  LogController.index(req, res, next));

// GET /api/logs/export/xml?from=...&to=...&usuario=...
router.get("/logs/export/xml", (req, res, next) =>
  LogController.exportXml(req, res, next));

module.exports = router;
