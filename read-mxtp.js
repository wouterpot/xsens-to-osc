module.exports = function (buff) {
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
        const res = buff.subarray(0, length).toString()
        buff = buff.subarray(length)
        return res
    }


    const type = readString(6)
    if (!type.startsWith('MXTP')) throw Exception('Invalid packet')
    const sampleCounter = readInt()
    const dgramCounter = readByte()
    const dataCount = readByte()
    const frameTime = readInt()
    const avatarId = readByte()

    const bodySegmentCount = readByte()
    const propCount = readByte()
    const fingerTrackingSegmentCount = readByte()

    readByte()
    readByte()

    const dataSize = readShort()

    const base = { type, sampleCounter, dgramCounter, dataCount, frameTime, avatarId, bodySegmentCount, propCount, fingerTrackingSegmentCount, dataSize, segments: [] }

    if (type === 'MXTP01') { // EulerDatagram
        for (let i = 0; i < dataCount; i++) {
            const segmentId = readInt()
            const posX = readFloat()
            const posY = readFloat()
            const posZ = readFloat()
            const rotX = readFloat()
            const rotY = readFloat()
            const rotZ = readFloat()
            base.segments.push({ segmentId, posX, posY, posZ, rotX, rotY, rotZ })
        }
    }
    else if (type === 'MXTP02') { // QuaternionDatagram
        for (let i = 0; i < dataCount; i++) {
            const segmentId = readInt()
            const posX = readFloat()
            const posY = readFloat()
            const posZ = readFloat()
            const quatA = readFloat()
            const quatB = readFloat()
            const quatC = readFloat()
            const quatD = readFloat()
            base.segments.push({ segmentId, posX, posY, posZ, quatA, quatB, quatC, quatD })
        }
    }
    else if (type === 'MXTP12') { // MetaDatagram
        const stringSize = readInt()
        const string = readString(stringSize)
        base.metadata = string
    }
    else if (type === 'MXTP13') { // ScaleDatagram
        const numberOfSegments = readInt()
        for (let i = 0; i < numberOfSegments; i++) {
            const stringSize = readInt()
            const name = readString(stringSize)
            const posX = readFloat()
            const posY = readFloat()
            const posZ = readFloat()
            base.segments.push({ name, posX, posY, posZ })
        }
    }
    return base
}