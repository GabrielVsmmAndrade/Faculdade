require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log("✅ Conectou no MySQL");

    const [one] = await conn.execute("SELECT 1 AS ok;");
    console.log("SELECT 1:", one);

    const [tables] = await conn.execute("SHOW TABLES;");
    console.log("Tabelas:", tables);

    // testa a tabela devices e a API key
    const apiKey = "a".repeat(64);
    const [dev] = await conn.execute(
      "SELECT id, device_uid, LENGTH(api_key) AS tam FROM devices WHERE api_key = ?",
      [apiKey]
    );
    console.log("Device encontrado:", dev);

    await conn.end();
    console.log("✅ Teste finalizado");
  } catch (e) {
    console.error("❌ DB FAIL:", e.code, e.message);
  }
})();