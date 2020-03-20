
const firmwareVersion = 0.1
const firmwareCodename = "Mango"
require('dotenv').config()
console.log(`Firmware: ${firmwareVersion} ${firmwareCodename}`)
var path = require('path')
var webComponent = require(path.resolve(__dirname + '/web.js'))


var lastData = require(path.resolve(__dirname + '/lastResult.js'))

var port = process.env.QE_PORT || 8000

var databaseComponent = require(path.resolve(__dirname + '/database.js'))

databaseComponent.initDb(function(err,db) {
    var web = new webComponent(firmwareVersion, firmwareCodename, port, db)
    web.startHTTPS()
})

var hardware = require(path.resolve(__dirname + '/hardware.js'))
hardware.sensorBoard.prepare(lastData)



