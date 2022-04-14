var osc = require("osc");
const getIp = require("../get-ip");

const ipv4 = getIp()
const ipMask = ipv4
    ? ipv4.replace(/(.*\..*\.*)\..*/, "$1.255")
    : "192.168.1.255";

var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 5000,
    remoteAddress: ipMask,
    remotePort: 57120,
    broadcast: true,
});

// Open the socket.
udpPort.open();

// Every second, send an OSC message to SuperCollider
module.exports = function (address, value, type = "f") {
    var msg = {
        address,
        args: [
            {
                type,
                value,
            },
        ],
    };

    console.log(
        `Sending message ${msg.address}, ${JSON.stringify(msg.args)} to ${udpPort.options.remoteAddress
        }: ${udpPort.options.remotePort}`
    );
    udpPort.send(msg);
};
