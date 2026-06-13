const Log = require("../models/LogModel");

/**
 * logMiddleware — registra cada requisição HTTP no MongoDB.
 */
function logMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    Log.create({
      acao:           "ACCESS",
      usuario:        req.user?.username || "anonymous",
      endpoint:       req.originalUrl,
      metodo:         req.method,
      status_code:    res.statusCode,
      tempo_resposta: Date.now() - start,
      ip:             req.ip,
      user_agent:     req.get("user-agent") || null,
    }).catch((err) => {
      console.error("[logMiddleware] Falha ao gravar log:", err.message);
    });
  });

  next();
}

module.exports = logMiddleware;
