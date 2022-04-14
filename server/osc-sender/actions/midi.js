var easymidi = require('easymidi');
var output = new easymidi.Output('Xsens Midi', true);

const midiSend = (type, data) => {
    if (process.env.LOGGING) {
        console.log(type, data)
    }
    output.send(type, data);
}

const silent = async (wait, channel, noteToSilent) => {
    await sleep(wait);
    note(channel, noteToSilent, 0);
};

const note = (channel, note, velocity = 100) =>
    midiSend(velocity === 0 ? 'noteoff' : 'noteon', { velocity, note, channel });

const midi = ({ channel }, noteNr, velocity) => {
    note(channel, noteNr, velocity);
    silent(1000, channel, noteNr);
};

const sane = (val) => Math.abs(Math.round(val)) % 127;

const sanePitch = (val) => Math.round(val) % 16384;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cc = ({ channel, cc = 1 }, ccValue) => {
    midiSend('cc', { controller: cc, value: sane(ccValue), channel })
};

const pitch = ({ channel }, value) => {
    midiSend('pitch', { value: sanePitch(value), channel });
};

module.exports = { midi, cc, pitch };
