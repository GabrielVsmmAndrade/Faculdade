/**
 * reset-admin.js
 * Gera hash bcrypt correto para "123456" e atualiza/insere os usuários de teste.
 * Rode UMA VEZ: node reset-admin.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql  = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log("✅ Conectado ao MySQL");

  const hash = await bcrypt.hash("123456", 10);
  console.log("🔑 Hash gerado:", hash);

  const users = [
    { username: "admin", email: "admin@paniciot.com", full_name: "Administrador", role: "ADMIN" },
    { username: "joao",  email: "joao@paniciot.com",  full_name: "João Silva",    role: "OPERADOR" },
    { username: "maria", email: "maria@paniciot.com", full_name: "Maria Souza",   role: "OPERADOR" },
  ];

  for (const u of users) {
    // Tenta atualizar; se não existir, insere
    const [rows] = await conn.execute(
      "SELECT id FROM users WHERE username = ?", [u.username]
    );

    if (rows.length > 0) {
      await conn.execute(
        "UPDATE users SET password_hash = ? WHERE username = ?",
        [hash, u.username]
      );
      console.log(`✅ Senha atualizada: ${u.username}`);
    } else {
      await conn.execute(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        [u.username, u.email, hash, u.full_name, u.role]
      );
      console.log(`✅ Usuário criado: ${u.username}`);
    }
  }

  await conn.end();
  console.log("\n✅ Pronto! Todos os usuários têm senha: 123456");
})();
