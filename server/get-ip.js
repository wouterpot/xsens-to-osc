const { networkInterfaces } = require("os");

const getIp = () => {
    const interfaces = Object.values(networkInterfaces()).flat();
    const ipv4 = interfaces.find((i) => i.family === "IPv4" && !i.internal)?.address;
    return ipv4
}

module.exports = getIp