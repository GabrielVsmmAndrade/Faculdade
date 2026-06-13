/**
 * validationMiddleware — factory de validação.
 * Recebe uma função validadora (data) => string|null e devolve um middleware.
 * Mantém validação fora dos controllers.
 *
 * Uso:
 *   const v = require("./validationMiddleware");
 *   router.post("/x", v(validarX), controller.store);
 */
function validationMiddleware(validatorFn) {
  return (req, res, next) => {
    const errorMsg = validatorFn(req.body || {});
    if (errorMsg) return res.status(400).json({ error: errorMsg });
    next();
  };
}

// Validadores reutilizáveis ───────────────────────────────────────────────────
const validators = {
  event(body) {
    if (!body.event_uid) return "event_uid é obrigatório";
    if (body.level && !["ALTO", "MEDIO", "BAIXO"].includes(body.level))
      return "level inválido (use ALTO, MEDIO ou BAIXO)";
    return null;
  },
  action(body) {
    if (!body.operator_name) return "operator_name é obrigatório";
    return null;
  },
  device(body) {
    if (!body.device_uid) return "device_uid é obrigatório";
    if (!body.name) return "name é obrigatório";
    if (!body.location) return "location é obrigatório";
    return null;
  },
};

module.exports = validationMiddleware;
module.exports.validators = validators;
