var dgram = require("dgram");
const readPacket = require("../xsens/read-mxtp");
const port = 9763;
const { config } = require("../routers/config");
const sensors = require("../routers/sensors");
const actions = require("./actions");
const getIp = require("../get-ip");
const readline = require('node:readline');

socket = dgram.createSocket("udp4");
console.log(config());

const skip = {};
let lastPacket;
let calibration = {};
let calibrationMode = {};

socket.on("message", function (msg, info) {
    const packet = readPacket(msg);
    if (!packet) return

    if (packet.type === "MXTP13") {
        //console.log(packet)
    }

    const currentConfig = config();
    if (packet.type === "MXTP01" || packet.type === "MXTP02") {
        //console.log(packet)
        lastPacket = packet;
        for (let i = 0; i < currentConfig.length; i++) {
            const {
                skip: skipSamples = 1,
                enabled,
                dimension,
                sensor,
                channel,
                velocity,
                threshold,
                track,
                fx,
                cc,
                fxparam,
                action = "midi",
                multiply = 127,
            } = currentConfig[i];
            const sensorIndex = sensors.indexOf(sensor);
            setMinMax(sensor, packet, enabled);
            let sensorValue = packet.segments[sensorIndex][dimension];
            if (sensorValue <= threshold) continue;
            sensorValue = scale(sensor, dimension, multiply, sensorValue)
            skip[i] = skip[i] || 1;
            skip[i] = (skip[i] % skipSamples) + 1;
            if (skip[i] === skipSamples && actions[action] && enabled) {
                if (process.env.LOGGING) readline.cursorTo(process.stdout, 0, i)
                actions[action](
                    { channel, track, fx, fxparam, cc },
                    sensorValue,
                    velocity
                );
            }
        }
    }
});

const scale = (sensor, dimension, multiply, sensorValue) => {
    const minVal = calibration?.[sensor]?.min?.[dimension]
    const maxVal = calibration?.[sensor]?.max?.[dimension]
    if (minVal && maxVal)
        return (sensorValue - minVal) * multiply / (maxVal - minVal)
    else
        return sensorValue
}

socket.on("listening", () => {
    var address = socket.address();
    console.log("listening on: " + address.address + ":" + address.port);
});

const pcapFile = process.env.PCAP_FILE;
socket.bind(port, pcapFile ? "localhost" : getIp());

if (pcapFile) {
    const { Worker } = require("worker_threads");
    new Worker("./xsens/read-ncap.js", { workerData: { pcapFile } });
}

const setMinMax = (sensor, packet, enabled) => {
    const sensorIndex = sensors.indexOf(sensor);
    const { all, active } = calibrationMode
    if (!all && !active) return
    if (active && !enabled) return
    const { posX, posY, posZ } = packet.segments[sensorIndex]
    calibration[sensor] = {
        name: sensor,
        min: {
            posX: Math.min(posX, calibration?.[sensor]?.min?.posX || Infinity),
            posY: Math.min(posY, calibration?.[sensor]?.min?.posY || Infinity),
            posZ: Math.min(posZ, calibration?.[sensor]?.min?.posZ || Infinity),
        },
        max: {
            posX: Math.max(posX, calibration?.[sensor]?.max?.posX || -Infinity),
            posY: Math.max(posY, calibration?.[sensor]?.max?.posY || -Infinity),
            posZ: Math.max(posZ, calibration?.[sensor]?.max?.posZ || -Infinity),
        }
    };
};

module.exports = {
    getLastPacket: () => lastPacket,
    getCalibration: () => (calibration),
    setCalibration: (_calibration) => calibration = _calibration,
    setCalibrationMode: (mode) => {
        calibrationMode = mode
    }
};
