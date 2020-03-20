let isObject = function(o) {
    return o === Object(o);
};
var path = require('path')
var hardware = require(path.resolve(__dirname + '/hardware.js'))
var simpleMathOps = require(path.resolve(__dirname + '/simpleMathOps.js'))

let lastData = {
	humidity: undefined,
	temperature: undefined,
	//height: undefined,
	pressure: undefined,
	time: parseInt((new Date().getTime() / 1000).toFixed(0))
}

var databaseComponent = require(path.resolve(__dirname + '/database.js'))

const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}


module.exports = {
	get,
	set
};

function get() {
	return lastData;
}

function set(obj, cb) {
	console.log(obj)
	if (isObject(obj)) {
		lastData = {...lastData, ...obj};

		
		let db = databaseComponent.getDb();
		let records = db.collection('records')
		records.insertOne(obj, function (err, res) {
			if (err) { 
				console.log(err)
			}
			if (cb) {
				cb()
			}
		})

		
	}
}

function logRecord(data, attempt) {
	if (!attempt) {
		attempt = 1		
	}
	if (attempt < 3) {
		console.log("attempt: " + attempt)
		attempt++
		let dbM = databaseComponent.getDb();
		console.log(dbM)
		let records = dbM.collection('records')
		records.insertOne( data, function (err, res) {
			console.log(res||err)
		})
	}
	else {
		console.log('failure-inserting-data')
	}
}