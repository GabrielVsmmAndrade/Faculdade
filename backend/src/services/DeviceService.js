const IService = require("../interfaces/IService");
const DeviceDAO = require("../models/DeviceDAO");

/**
 * DeviceService — regras de negócio dos dispositivos. Implementa IService.
 * Inclui o cálculo de online/offline a partir do last_seen.
 */
class DeviceService extends IService {
  async list() {
    const devices = await DeviceDAO.findAll();
    const now = Date.now();
    return devices.map((d) => {
      const last = d.last_seen ? new Date(d.last_seen).getTime() : 0;
      const online = d.last_seen && (now - last) <= 2 * 60 * 1000;
      return { ...d, online };
    });
  }

  async getById(id) { return DeviceDAO.findById(id); }
  async create(data) { return DeviceDAO.create(data); }
  async update(id, data) { return DeviceDAO.update(id, data); }
  async remove(id) { return DeviceDAO.delete(id); }

  async authenticate(apiKey) {
    return DeviceDAO.findByApiKey(apiKey);
  }

  async heartbeat(deviceId) {
    await DeviceDAO.touchLastSeen(deviceId);
  }
}

module.exports = new DeviceService();
