var dgram = require("dgram");
const readPacket = require("../xsens/read-mxtp");
const port = 9763;
const { config } = require("../routers/config");
const sensors = require("../routers/sensors");
const actions = require("./actions");

socket = dgram.createSocket("udp4");
console.log(config());

const skip = {};
let lastPacket;
let min = [];
let max = [];

socket.on("message", function (msg, info) {
    try {
        const packet = readPacket(msg);
        if (packet.type === "MXTP13") {
            //console.log(packet)
        }

        const currentConfig = config();
        if (packet.type === "MXTP01") {
            lastPacket = packet;
            setMinMax(packet);
            for (let i = 0; i < currentConfig.length; i++) {
                const {
                    skip: skipSamples,
                    dimension,
                    offset = 0,
                    sensor,
                    channel,
                    velocity,
                    threshold,
                    track,
                    fx,
                    cc,
                    fxparam,
                    action = "midi",
                    multiply = 1,
                } = currentConfig[i];
                const sensorIndex = sensors.indexOf(sensor);
                const sensorValue = packet.segments[sensorIndex][dimension];
                if (sensorValue <= threshold) continue;
                skip[i] = skip[i] || 1;
                skip[i] = (skip[i] % skipSamples) + 1;
                if (skip[i] === skipSamples && actions[action]) {
                    actions[action](
                        { channel, track, fx, fxparam, cc },
                        sensorValue * multiply + offset,
                        velocity
                    );
                }
            }
            currentConfig.forEach();
        }
    } catch (e) { }
});

socket.on("listening", () => {
    var address = socket.address();
    console.log("listening on: " + address.address + ":" + address.port);
});

socket.bind(port, "localhost");

const pcapFile = process.env.PCAP_FILE;
if (pcapFile) {
    const { Worker } = require("worker_threads");
    new Worker("./xsens/read-ncap.js", { workerData: { pcapFile } });
}

const setMinMax = (packet) => {
    min = packet.segments.map(({ posX, posY, posZ }, i) => ({
        posX: Math.min(posX, min[i]?.posX || Infinity),
        posY: Math.min(posY, min[i]?.posY || Infinity),
        posZ: Math.min(posZ, min[i]?.posZ || Infinity),
    }));
    max = packet.segments.map(({ posX, posY, posZ }, i) => ({
        posX: Math.max(posX, max[i]?.posX || -Infinity),
        posY: Math.max(posY, max[i]?.posY || -Infinity),
        posZ: Math.max(posZ, max[i]?.posZ || -Infinity),
    }));
};

module.exports = {
    getLastPacket: () => lastPacket,
    getExtrema: () => ({ min, max }),
};
