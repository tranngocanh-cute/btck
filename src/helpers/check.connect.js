'use-strict'
const mongoose = require('mongoose')
const _SECOND = 5000
const os = require('os')
const process = require('process')
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`number of connection::${numConnection}`)
}
//check over load
const checkOverload = () => {
    setInterval( () =>{
        const numConnection = mongoose.connections.length
        const numCores =  os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        // vis duj maxx so luong connect cuar serrver
        const maxxConnections = numCores * 5
        console.log(`memory usage::${memoryUsage / 1024 /1024} mb`);
        if(numConnection > maxxConnections ){
            console.log('connection qua tai');
        }
    },_SECOND)// moniter every 5 second
}
module.exports = {
    countConnect,
    checkOverload
}