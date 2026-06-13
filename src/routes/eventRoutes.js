const express = require("express");
const EventController = require("../controllers/EventController");
const deviceAuth = require("../middleware/deviceAuthMiddleware");
const validate = require("../middleware/validationMiddleware");
const { validators } = require("../middleware/validationMiddleware");

const router = express.Router();

// Rota pública para o ESP32 (autenticada por X-API-Key)
router.post("/events", deviceAuth, validate(validators.event), (req, res, next) =>
  EventController.store(req, res, next));

// Rotas de gestão (no app real protegidas por authMiddleware/JWT)
router.get("/events",            (req, res, next) => EventController.index(req, res, next));
router.get("/events/stats",      (req, res, next) => EventController.stats(req, res, next));
router.get("/events/:id",        (req, res, next) => EventController.show(req, res, next));
router.post("/events/:id/ack",   validate(validators.action), (req, res, next) => EventController.ack(req, res, next));
router.post("/events/:id/close", validate(validators.action), (req, res, next) => EventController.close(req, res, next));
router.delete("/events/:id",     (req, res, next) => EventController.destroy(req, res, next));

module.exports = router;
