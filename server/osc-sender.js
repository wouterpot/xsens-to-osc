var dgram = require('dgram');
const readPacket = require('./read-mxtp')
const osc = require('./osc')
const port = 9763;


socket = dgram.createSocket('udp4');

const delay = 1

socket.on('message', function (msg, info) {
    try {
        const packet = readPacket(msg)
        if (packet.type === 'MXTP13') {
            //console.log(packet)
        }
        if (packet.type === 'MXTP01') {
            if ((packet.sampleCounter % delay) == 0) {
                midi(0, packet.segments[10].posX + 50)
            }
            if ((packet.sampleCounter % delay) == 18) {
                midi(1, packet.segments[6].posY)
            }
            if ((packet.sampleCounter % delay) == 25) {
                midi(2, packet.segments[14].posX)
            }
        }
    }
    catch (e) { }
});


const silent = async (wait, channel, noteToSilent) => {
    await sleep(wait)
    note(channel, noteToSilent, 0)
}

const note = (channel, noteNr, noteOn = 100) => osc(`/vkb_midi/${channel}/note/${sane(noteNr)}`, noteOn, 'i')

const midi = (channel, noteNr) => {
    note(channel, noteNr)
    silent(1000, channel, noteNr)
}

const sane = (val) => Math.abs(Math.round(val))

socket.on('listening', () => {
    var address = socket.address();
    console.log("listening on: " + address.address + ":" + address.port);
});

socket.bind(port, 'localhost');

const pcapFile = process.env.PCAP_FILE
if (pcapFile) {
    const { Worker } = require('worker_threads')
    new Worker('./read-ncap.js', { workerData: { pcapFile } })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))