const dgram = require('dgram');
socket = dgram.createSocket('udp4');
const pcapp = require('pcap-parser');

const { workerData, parentPort } = require('worker_threads')
const parser = pcapp.parse(workerData.pcapFile);

let i = 0

let lastTimestamp

const packets = []

const sendPackets = async ()=>{
    do {
        for (const {payload, wait } of packets ) {
            await socket.send(payload, 9763, '127.0.0.1')
            await sleep(wait)
        }
    } while (process.env.REPEAT)
}

parser.on('packet', async (packet) => {
    if (Buffer.isBuffer(packet.data)) {
        try {
            const { timestampSeconds, timestampMicroseconds } = packet.header
            const currentTimestamp = timestampSeconds * 1000 + timestampMicroseconds / 1000
            const payload = packet.data.subarray(32);
            parentPort.postMessage({ i: i++ })
            let wait
            if (lastTimestamp) {
                wait = currentTimestamp - lastTimestamp
            }
            packets.push({payload, wait})
            lastTimestamp = currentTimestamp
        }
        finally {}
    }
});

parser.on('end', ()=>{
    sendPackets()
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))