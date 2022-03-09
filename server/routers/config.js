const express = require("express");
const segments = require("./sensors");
const router = express.Router();
let currentConfig = require("./config.json");

router.get("/", async (req, res) => {
  res.send({ segments, config: currentConfig });
});

router.post("/", async (req, res) => {
  currentConfig = req.body;
  res.sendStatus(200);
});

const getConfig = () => currentConfig;

module.exports = { router, config: getConfig };
