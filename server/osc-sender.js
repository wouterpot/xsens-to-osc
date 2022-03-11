var dgram = require("dgram");
const readPacket = require("./read-mxtp");
const osc = require("./osc");
const port = 9763;
const { config } = require("./routers/config");
const sensors = require("./routers/sensors");

socket = dgram.createSocket("udp4");
console.log(config());

const skip = {};

socket.on("message", function (msg, info) {
    try {
        const packet = readPacket(msg);
        if (packet.type === "MXTP13") {
            //console.log(packet)
        }

        const currentConfig = config();
        if (packet.type === "MXTP01") {
            for (let i = 0; i < currentConfig.length; i++) {
                const {
                    skip: skipSamples,
                    dimension,
                    offset = 0,
                    sensor,
                    channel,
                    velocity,
                    threshold,
                } = currentConfig[i];
                const sensorIndex = sensors.indexOf(sensor);
                const sensorValue = packet.segments[sensorIndex][dimension];
                if (sensorValue <= threshold) continue;
                skip[i] = skip[i] || 0;
                skip[i] = (skip[i] % skipSamples) + 1;
                if (skip[i] === skipSamples) {
                    midi(channel, sensorValue + offset, velocity);
                }
            }
            currentConfig.forEach();
        }
    } catch (e) { }
});

const silent = async (wait, channel, noteToSilent) => {
    await sleep(wait);
    note(channel, noteToSilent, 0);
};

const note = (channel, noteNr, velocity = 100) =>
    osc(`/vkb_midi/${channel}/note/${sane(noteNr)}`, velocity, "i");

const midi = (channel, noteNr, velocity) => {
    note(channel, noteNr, velocity);
    silent(1000, channel, noteNr);
};

const sane = (val) => Math.abs(Math.round(val)) % 127;

socket.on("listening", () => {
    var address = socket.address();
    console.log("listening on: " + address.address + ":" + address.port);
});

socket.bind(port, "localhost");

const pcapFile = process.env.PCAP_FILE;
if (pcapFile) {
    const { Worker } = require("worker_threads");
    new Worker("./read-ncap.js", { workerData: { pcapFile } });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
