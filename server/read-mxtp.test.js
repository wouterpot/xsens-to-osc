const reader = require('./read-mxtp')
const fs = require('fs')
const cases = require('jest-in-case')


cases('reads mxtp', opts => {
    const buff = fs.readFileSync(opts.name)
    const mxtp = reader(buff)
    console.log(mxtp)
}, [{ name: './mxtp01.bin' }, { name: './mxtp02.bin' }, { name: './mxtp12.bin' }, { name: './mxtp13.bin' }])
