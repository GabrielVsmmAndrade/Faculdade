/**
 * LogModel — schema Mongoose para logs no MongoDB.
 * Usa o mongoose global (não cria nova instância).
 */
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  timestamp:      { type: Date, default: Date.now, index: true },
  usuario:        { type: String, default: "anonymous" },
  acao:           { type: String, enum: ["ACCESS","LOGIN","LOGOUT","INSERT","UPDATE","DELETE","ERROR"], default: "ACCESS" },
  tabela:         { type: String, default: null },
  registro_id:    { type: mongoose.Schema.Types.Mixed, default: null },
  endpoint:       { type: String, default: null },
  metodo:         { type: String, default: null },
  status_code:    { type: Number, default: null },
  tempo_resposta: { type: Number, default: null },
  ip:             { type: String, default: null },
  user_agent:     { type: String, default: null },
  detalhes:       { type: mongoose.Schema.Types.Mixed, default: null },
  antes:          { type: mongoose.Schema.Types.Mixed, default: null },
  depois:         { type: mongoose.Schema.Types.Mixed, default: null },
  stack_trace:    { type: String, default: null },
});

module.exports = mongoose.model("Log", logSchema);
