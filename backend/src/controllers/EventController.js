const IController = require("../interfaces/IController");
const EventService = require("../services/EventService");

/**
 * EventController — camada HTTP das ocorrências. Implementa IController.
 * Não contém SQL nem regra de negócio: apenas traduz req/res ↔ service.
 * Erros são repassados ao errorMiddleware via next(err).
 */
class EventController extends IController {
  // GET /api/events
  async index(req, res, next) {
    try {
      const events = await EventService.list(req.query, req.user);
      res.json(events);
    } catch (err) { next(err); }
  }

  // GET /api/events/:id
  async show(req, res, next) {
    try {
      const event = await EventService.getById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Evento não encontrado" });
      res.json(event);
    } catch (err) { next(err); }
  }

  // POST /api/events  (chamado pelo ESP32 — req.device vem do deviceAuth)
  async store(req, res, next) {
    try {
      const result = await EventService.create(req.device.id, req.body || {});
      const code = result.duplicated ? 200 : 201;
      res.status(code).json({
        ok: true,
        duplicated: result.duplicated,
        event_id: result.event_id,
        status: result.status,
        device: req.device.device_uid,
      });
    } catch (err) { next(err); }
  }

  // POST /api/events/:id/ack
  async ack(req, res, next) {
    try {
      const event = await EventService.getById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Evento não encontrado" });
      if (req.user?.role !== "ADMIN") {
        const allowed = await EventService.userCanAccessEvent(req.user.id, event);
        if (!allowed) return res.status(403).json({ error: "Sem permissão para este evento" });
      }
      const { operator_name, comment = null } = req.body || {};
      const result = await EventService.applyAction(
        Number(req.params.id), "ACK", operator_name, comment, req.user?.id
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  // POST /api/events/:id/close
  async close(req, res, next) {
    try {
      const event = await EventService.getById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Evento não encontrado" });
      if (req.user?.role !== "ADMIN") {
        const allowed = await EventService.userCanAccessEvent(req.user.id, event);
        if (!allowed) return res.status(403).json({ error: "Sem permissão para este evento" });
      }
      const { operator_name, comment = null } = req.body || {};
      const result = await EventService.applyAction(
        Number(req.params.id), "ENCERRAR", operator_name, comment, req.user?.id
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  // DELETE /api/events/:id
  async destroy(req, res, next) {
    try {
      const ok = await EventService.remove(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: "Evento não encontrado" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  }

  // GET /api/events/stats  (para gráficos)
  async stats(req, res, next) {
    try {
      res.json(await EventService.statistics(req.user));
    } catch (err) { next(err); }
  }
}

module.exports = new EventController();
