const express = require("express");
const segments = require("./sensors");
const router = express.Router();
const { setConfig, getConfig } = require('../osc-sender')

router.get("/", async (req, res) => {
  res.send({ config: getConfig(), segments });
});

router.post("/", async (req, res) => {
  setConfig(req.body);
  res.sendStatus(200);
});

module.exports = { router };
