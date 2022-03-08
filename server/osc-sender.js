var dgram = require('dgram');
const readPacket = require('./read-mxtp')
const osc = require('./osc')
const port = 9763;


socket = dgram.createSocket('udp4');

socket.on('message', function (msg, info) {
    try {
        const packet = readPacket(msg)
        if (packet.type === 'MXTP13') {
            //console.log(packet)
        }
        if (packet.type === 'MXTP01') {
            if ((packet.sampleCounter % 40) == 0) {
                midi(0, packet.segments[10].posX)
            }
            if ((packet.sampleCounter % 40) == 18) {
                midi(1, packet.segments[6].posY)
            }
            if ((packet.sampleCounter % 40) == 25) {
                midi(2, packet.segments[14].posX)
            }
        }
    }
    catch (e) { }
});

const playedNotes = {}

const note = (channel, noteNr, noteOn = 1) => osc(`/vkb_midi/${channel}/note/${sane(noteNr)}`, noteOn, 'i')

const midi = (channel, noteNr) => {
    if (!playedNotes[channel]) playedNotes[channel] = []
    playedNotes[channel].push(noteNr)
    note(channel, noteNr)
    if (playedNotes[channel].length > 8) {
        const noteToSilent = playedNotes[channel].shift()
        note(channel, noteToSilent, 0)
    }
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
    new Worker('./read-ncap.js', { workerData: {pcapFile} })
}

