const DeviceService = require("../services/DeviceService");

/**
 * deviceAuth — autentica o ESP32 via X-API-Key.
 * Popula req.device com os dados do dispositivo.
 */
async function deviceAuth(req, res, next) {
  try {
    const apiKey = req.header("X-API-Key");
    if (!apiKey) return res.status(401).json({ error: "Missing X-API-Key" });

    const device = await DeviceService.authenticate(apiKey);
    if (!device) return res.status(401).json({ error: "Invalid API key" });

    req.device = device;
    next();
  } catch (err) { next(err); }
}

module.exports = deviceAuth;
