const express = require("express");
const { getLastPacket, getExtrema } = require("../osc-sender");
const sensors = require("./sensors.json");
const router = express.Router();

router.get("/", async (req, res) => {
    const packet = getLastPacket();
    packet.segments = packet.segments.map((s, i) => ({
        ...s,
        name: sensors[i],
    }));
    res.send({ lastPacket: packet });
});

router.get("/extrema", async (req, res) => {
    const extrema = getExtrema();
    res.send({ ...extrema });
});

module.exports = { pose: router };
