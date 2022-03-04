var dgram = require('dgram');
var port = 9763;

const readPacket = require('./read-mxtp')
const osc = require('./osc')

socket = dgram.createSocket('udp4');

socket.on('message', function (msg, info) {
    const packet = readPacket(msg)
    if (packet.type === 'MXTP01') {
        if ((packet.sampleCounter % 40) == 0) {
            midi(0, packet.segments[0].posX)
        }
        if ((packet.sampleCounter % 40) == 25) {
            midi(1, packet.segments[1].posX)
        }
    }
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

socket.bind(port);