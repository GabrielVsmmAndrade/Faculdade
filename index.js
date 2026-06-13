require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

// DB
const { connectMongo } = require("./src/db/mongo");

// Rotas
const authRoutes   = require("./src/routes/authRoutes");
const userRoutes   = require("./src/routes/userRoutes");
const deviceRoutes = require("./src/routes/deviceRoutes");
const eventRoutes  = require("./src/routes/eventRoutes");
const exportRoutes = require("./src/routes/exportRoutes");
const logRoutes    = require("./src/routes/logRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const zoneRoutes   = require("./src/routes/zoneRoutes");

// Middlewares globais
const authMiddleware  = require("./src/middleware/authMiddleware");
const logMiddleware   = require("./src/middleware/logMiddleware");
const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(express.static("public"));

connectMongo();

app.get("/", (req, res) => res.send("PanicIoT API funcionando ✅"));

// ── Middlewares globais ───────────────────────────────────────────────────────
app.use("/api", logMiddleware);
app.use("/api", authMiddleware);

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", deviceRoutes);
app.use("/api", eventRoutes);
app.use("/api", exportRoutes);
app.use("/api", logRoutes);
app.use("/api", reportRoutes);
app.use("/api", zoneRoutes);

// ── Error handler (último) ────────────────────────────────────────────────────
app.use(errorMiddleware);

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ PanicIoT API rodando em http://0.0.0.0:${port}`);
});
