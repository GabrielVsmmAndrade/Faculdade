/**
 * Conexão MongoDB — exporta a instância conectada do mongoose
 * para que todos os models usem a mesma conexão.
 */
const mongoose = require("mongoose");
require("dotenv").config();

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB conectado:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ Falha ao conectar MongoDB:", err.message);
  }
}

// Exporta a instância global do mongoose (mesma usada pelos models)
module.exports = { connectMongo, mongoose };
