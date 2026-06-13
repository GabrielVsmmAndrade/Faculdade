const IService = require("../interfaces/IService");
const EventDAO = require("../models/EventDAO");
const EventActionDAO = require("../models/EventActionDAO");

/**
 * EventService — regras de negócio das ocorrências. Implementa IService.
 * Aqui ficam: idempotência, transição de status (ABERTO→ACK→ENCERRADO),
 * e a validação de datas.
 */
class EventService extends IService {
  async list(filters = {}, user = null) {
    return EventDAO.findAll(filters, user);
  }

  async getById(id) {
    const event = await EventDAO.findById(id);
    if (!event) return null;
    event.actions = await EventActionDAO.findByEvent(id);
    return event;
  }

  /**
   * Cria ocorrência com idempotência por event_uid.
   * Retorna { duplicated, event_id, status }.
   */
  async create(deviceId, data) {
    const { event_uid, occurred_at, level = "ALTO",
            notes = null, lat = null, lon = null, wifi_hint = null } = data;

    if (!event_uid) {
      const err = new Error("event_uid é obrigatório");
      err.status = 400;
      throw err;
    }

    // occurred_at: ISO ou agora
    const occurredDate = occurred_at ? new Date(occurred_at) : new Date();
    if (Number.isNaN(occurredDate.getTime())) {
      const err = new Error("occurred_at inválido");
      err.status = 400;
      throw err;
    }

    // Idempotência: se já existe, não duplica
    const existing = await EventDAO.findByUid(event_uid);
    if (existing) {
      return { duplicated: true, event_id: existing.id, status: existing.status };
    }

    const insertId = await EventDAO.create({
      device_id: deviceId, event_uid, level,
      occurred_at: occurredDate, lat, lon, wifi_hint, notes
    });
    return { duplicated: false, event_id: insertId, status: "ABERTO" };
  }

  /**
   * Aplica ACK ou ENCERRAR e registra no histórico.
   */
  async applyAction(eventId, action, operatorName, comment, userId = null) {
    if (!eventId) {
      const err = new Error("id inválido"); err.status = 400; throw err;
    }
    if (!operatorName) {
      const err = new Error("operator_name é obrigatório"); err.status = 400; throw err;
    }

    const statusMap = { ACK: "ACK", ENCERRAR: "ENCERRADO" };
    const newStatus = statusMap[action];
    if (!newStatus) {
      const err = new Error("Ação inválida"); err.status = 400; throw err;
    }

    await EventDAO.updateStatus(eventId, newStatus);
    await EventActionDAO.create({
      event_id: eventId, action, operator_name: operatorName, comment, user_id: userId
    });

    return { ok: true, event_id: eventId, status: newStatus };
  }

  async remove(id) {
    return EventDAO.delete(id);
  }

  /**
   * Verifica se um OPERADOR tem acesso a um evento
   * (o dispositivo deve estar numa zona atribuída ao usuário)
   */
  async userCanAccessEvent(userId, event) {
    if (!event.zone_id) return false;
    const pool = require("../db/mysql");
    const [rows] = await pool.execute(
      `SELECT 1 FROM user_zone_assignments
       WHERE user_id = ? AND zone_id = ? LIMIT 1`,
      [userId, event.zone_id]
    );
    return rows.length > 0;
  }

  async statistics(user = null) {
    return {
      byStatus: await EventDAO.countByStatus(user),
      byDevice: await EventDAO.countByDevice(user),
    };
  }
}

module.exports = new EventService();
