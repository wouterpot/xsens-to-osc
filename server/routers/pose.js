const express = require("express");
const { getLastPacket, getCalibration, setCalibration, setCalibrationMode, setDatagramType } = require("../osc-sender");
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
        res.json({ lastPacket: packet });
    }
    else res.json({ lastPacket: {} })
});

router.post("/toggle-calibration", async (req, res) => {
    setCalibrationMode(req.body)
    const calibration = getCalibration();
    res.json(calibration)
});

router.get("/calibration", async (req, res) => {
    const calibration = getCalibration();
    res.json(calibration);
});

router.post("/calibration", async (req, res) => {
    if (typeof req.body === 'object' && !Array.isArray(req.body) && req.body !== null)
        setCalibration(req.body)
    res.sendStatus(200);
});

router.post("/datagram-type", async (req, res) => {
    const { sendEuler, sendQuaternion } = req.body
    const types = []
    if (sendEuler) types.push("MXTP01")
    if (sendQuaternion) types.push("MXTP02")
    setDatagramType(types)
    res.sendStatus(200);
});

module.exports = { pose: router };
