const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "API working fine" });
});

router.get("/test/slow", async (req, res) => {
  const ms = Number(req.query.ms ?? 20000);
  const delayMs = Number.isFinite(ms) && ms >= 0 ? ms : 20000;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (req.timedout) {
    return;
  }

  res.json({ message: "slow response finished", delayMs });
});

router.get("/test/timeout-config", (req, res) => {
  res.json({
    message: "timeout middleware is active if req.timedout exists",
    hasTimedoutFlag: typeof req.timedout !== "undefined",
    timedout: Boolean(req.timedout),
  });
});

module.exports = router;
