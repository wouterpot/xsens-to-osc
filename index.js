var dgram = require('dgram');
var port = 9763;

socket = dgram.createSocket('udp4');



socket.on('message', function (msg, info){
    const values = msg.values();
    let buff = Buffer.from(msg.toString())

    const readInt = () => {
        const res = buff.readUInt32BE()
        buff = buff.subarray(4)
        return res
    }
    const readByte = () => {
        const res = buff.readUInt8()
        buff = buff.subarray(1)
        return res
    }
    const readShort = () => {
        const res = buff.readUint16BE()
        buff = buff.subarray(2)
        return res
    }
    const readFloat = () => {
        const res = buff.readFloatBE()
        buff = buff.subarray(4)
        return res
    }

    const readString = (length) => {
        const res = buff.subarray(0,length).toString()
        buff = buff.subarray(length)
        return res
    }

    
    const type = readString(6)
    const sampleCounter = readInt()
    const m_dgramCounter = readByte()
    const m_dataCount = readByte()
    const m_frameTime = readInt()
    const m_avatarId = readByte()

    const m_bodySegmentCount = readByte()
    const m_propCount = readByte()
    const m_fingerTrackingSegmentCount = readByte()

    let reserved
    readByte()
    readByte()

    const m_dataSize = readShort()

    if (type === 'MXTP01') {
        for (let i = 0; i < m_dataCount; i++) {
            const segmentId = readInt()
            const posX = readFloat()
            const posY = readFloat()
            const posZ = readFloat()
        }
    }
 });

socket.on('listening', function(){
    var address = socket.address();
    console.log("listening on :" + address.address + ":" + address.port);
});

socket.bind(port);