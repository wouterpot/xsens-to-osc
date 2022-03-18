const osc = require("../osc");

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

const sanePitch = (val) => Math.round(val) % 8126;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cc = (ccKey) => (channel, ccValue) => {
    osc(`/vkb_midi/${channel}/cc/${ccKey}`, sane(ccValue), "i");
};

const pitch = (channel, ccValue) => {
    osc(`/vkb_midi/${channel}/pitch`, sanePitch(ccValue), "i");
};

module.exports = { midi, cc_mod: cc(1), pitch };
