require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const prisma = require("./prismaClient")
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const timeout = require("connect-timeout");

const { config } = require("dotenv");

const app = express();
app.use(cors());
app.use(timeout(process.env.REQUEST_TIMEOUT || "15s"));
app.use((req, res, next) => {
  if (req.timedout) {
    return;
  }
  next();
});
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

const routesPath = path.join(__dirname, "./app/routes");
if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const route = require(path.join(routesPath, file));
      app.use("/api", route);
    }
  });
} else {
  console.log("Routes folder not found — skipping route loading");
}
app.get("/", (req, res) => {
  res.send(`Api is running......`);
});

app.use((err, req, res, next) => {
  if (err && err.code === "ETIMEDOUT") {
    return res.status(503).json({
      error: "request timeout",
      message: "Request timed out",
    });
  }
  console.error("stack", err.stack);
  res.status(500).json({
    error: "something went wrong on the server",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server is running
        PORT: ${PORT}
        Mode: ${process.env.NODE_ENV || "production"}`,
  );
});
