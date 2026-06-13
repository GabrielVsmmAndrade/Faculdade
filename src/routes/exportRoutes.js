const express          = require("express");
const multer           = require("multer");
const ExportController = require("../controllers/ExportController");

const router = express.Router();

// multer: armazena em memória (sem salvar no disco), aceita só .json, max 2MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/json" ||
        file.originalname.endsWith(".json")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .json são aceitos"), false);
    }
  },
});

// GET /api/export/json?table=events
router.get("/export/json", (req, res, next) =>
  ExportController.index(req, res, next));

// POST /api/import/json?table=events  (campo: file)
router.post("/import/json", upload.single("file"), (req, res, next) =>
  ExportController.store(req, res, next));

module.exports = router;
