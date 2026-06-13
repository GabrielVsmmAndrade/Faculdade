const Log = require("../models/LogModel");

/**
 * errorMiddleware — captura global de exceções. DEVE ser o último middleware.
 * Grava o erro no MongoDB e devolve JSON padronizado.
 */
function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  Log.create({
    acao:        "ERROR",
    usuario:     req.user?.username || "anonymous",
    endpoint:    req.originalUrl,
    metodo:      req.method,
    status_code: err.status || 500,
    ip:          req.ip,
    user_agent:  req.get("user-agent") || null,
    stack_trace: err.stack,
    detalhes:    { message: err.message },
  }).catch(() => {}); // silencioso

  res.status(err.status || 500).json({
    error: err.message || "Internal error",
  });
}

module.exports = errorMiddleware;
