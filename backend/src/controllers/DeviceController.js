const IController = require("../interfaces/IController");
const DeviceService = require("../services/DeviceService");

/**
 * DeviceController — camada HTTP dos dispositivos. Implementa IController.
 */
class DeviceController extends IController {
  // GET /api/devices
  async index(req, res, next) {
    try {
      res.json(await DeviceService.list());
    } catch (err) { next(err); }
  }

  // GET /api/devices/:id
  async show(req, res, next) {
    try {
      const device = await DeviceService.getById(Number(req.params.id));
      if (!device) return res.status(404).json({ error: "Dispositivo não encontrado" });
      res.json(device);
    } catch (err) { next(err); }
  }

  // POST /api/devices
  async store(req, res, next) {
    try {
      res.status(201).json(await DeviceService.create(req.body));
    } catch (err) { next(err); }
  }

  // PUT /api/devices/:id
  async update(req, res, next) {
    try {
      res.json(await DeviceService.update(Number(req.params.id), req.body));
    } catch (err) { next(err); }
  }

  // DELETE /api/devices/:id
  async destroy(req, res, next) {
    try {
      const ok = await DeviceService.remove(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: "Dispositivo não encontrado" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  }

  // POST /api/heartbeat  (ESP32 — req.device vem do deviceAuth)
  async heartbeat(req, res, next) {
    try {
      await DeviceService.heartbeat(req.device.id);
      res.json({
        ok: true,
        device: req.device.device_uid,
        last_seen: new Date().toISOString(),
      });
    } catch (err) { next(err); }
  }
}

module.exports = new DeviceController();
