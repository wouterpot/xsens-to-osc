const express = require("express");
const { getLastPacket } = require("../osc-sender");
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

module.exports = { pose: router };
