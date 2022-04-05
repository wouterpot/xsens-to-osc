const express = require("express");
const { getLastPacket, getCalibration, setCalibration, setCalibrate } = require("../osc-sender");
const sensors = require("./sensors.json");
const { config } = require("./config");
const router = express.Router();

router.get("/", async (req, res) => {
    const packet = getLastPacket();
    const currentConfig = config();
    const activeSensors = currentConfig.map((c) => c.sensor);

    if (packet) {
        packet.segments = packet.segments.map((s, i) => ({
            ...s,
            name: sensors[i],
            active: activeSensors.includes(sensors[i]),
        }));
        res.send({ lastPacket: packet });
    }
    else res.send({ lastPacket: {} })
});

router.get("/:calibrate/calibrate", async (req, res) => {
    setCalibrate(req.params.calibrate)
    const calibration = getCalibration();
    res.send(calibration)
});

router.get("/calibration", async (req, res) => {
    const calibration = getCalibration();
    res.send(calibration);
});

router.post("/calibration", async (req, res) => {
    setCalibration(req.body.min, req.body.max)
    res.sendStatus(200);
});

module.exports = { pose: router };
