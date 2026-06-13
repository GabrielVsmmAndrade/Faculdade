const express          = require("express");
const ReportController = require("../controllers/ReportController");

const router = express.Router();

// GET /api/reports/events?from=2026-01-01&to=2026-12-31&status=ABERTO
router.get("/reports/events", (req, res, next) =>
  ReportController.index(req, res, next));

module.exports = router;
