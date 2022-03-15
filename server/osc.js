var osc = require("osc");

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 5000,
  remoteAddress: "192.168.178.255",
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
    `Sending message ${msg.address}, ${JSON.stringify(msg.args)} to ${
      udpPort.options.remoteAddress
    }: ${udpPort.options.remotePort}`
  );
  udpPort.send(msg);
};
