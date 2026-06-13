const jwt = require("jsonwebtoken");

/**
 * authMiddleware — verifica JWT em todas as rotas exceto as públicas.
 * Popula req.user com { id, username, role }.
 *
 * Rotas públicas (sem token):
 *   POST /api/auth/login
 *   POST /api/heartbeat    (ESP32 usa X-API-Key, não JWT)
 *   POST /api/events       (ESP32 usa X-API-Key, não JWT)
 */
// req.path dentro de app.use("/api", ...) já não contém o prefixo /api
const PUBLIC_ROUTES = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/heartbeat"  },
  { method: "POST", path: "/events"     },
];

function authMiddleware(req, res, next) {
  const isPublic = PUBLIC_ROUTES.some(
    (r) => r.method === req.method && req.path === r.path
  );
  if (isPublic) return next();

  const header = req.header("Authorization");
  const token  = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação obrigatório" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

module.exports = authMiddleware;
