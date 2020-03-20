var path = require('path')
var five = require("johnny-five");
const { Board, Led } = require("johnny-five");


var simpleMathOps = require(path.resolve(__dirname + '/simpleMathOps.js'))
var databaseComponent = require(path.resolve(__dirname + '/database.js'))

var board;
var room = {
	coolDown,
	heatUp,
	dryDown,
	humidify
}
module.exports = {
	sensorBoard: {
		prepare: prepareBoard
	},
	room: room
};


function prepareBoard() {
	let lastData = require(path.resolve(__dirname + '/lastResult.js'))
	board = new Board();
	board.on("ready", () => {
		board.samplingInterval(2500);
		process.env.BOARD_READY = "true"
		//setTimeout(init, 1000, firmwareVersion, firmwareCodename, port, database); // database connection imitation
		const led = new Led(13);
		function ledPulse() {
			led.pulse(500);
		}
		ledPulse()
		var bme280Address
		
		if (process.env.BME_ADDRESS == "0x76") {
			bme280Address = 0x76
		}
		else if (process.env.BME_ADDRESS == "0x77") {
			bme280Address = 0x77
		}
		else if (!process.argv.includes('0x76') || process.argv.includes('0x77')) {
			bme280Address = 0x77
		}
		else if (process.argv.includes('0x76')) {
			bme280Address = 0x76
		}
		var sensor = new five.Multi({
			controller: "BME280",
			freq: 2500,
			address: bme280Address
		});
		console.log(2500 + ' ms to next measurement')
		
		sensor.on('change', function() {
			
			console.log(2500 + ' ms to next measurement')
			let currentMeasurements = {
				temperature: this.thermometer.celsius,
				pressure: this.barometer.pressure * 1000,
				humidity: this.hygrometer.relativeHumidity,
				//height: this.altimeter.meters,
				time: Math.floor(Date.now() / 1000)
			}
			let oldMeasurements = lastData.get();
			console.log(oldMeasurements)
			if (oldMeasurements.temperature == undefined || Math.abs(oldMeasurements.temperature - currentMeasurements.temperature) > 0.25 || 
			Math.abs(oldMeasurements.humidity - currentMeasurements.humidity) > 0.5 ||  Math.abs(oldMeasurements.pressure - currentMeasurements.pressure) > 150 || 
			Math.abs(oldMeasurements.time - currentMeasurements.time) > 25) {
				led.strobe(150);
				function pulse() {
					led.pulse(500)
				}
				lastData.set(currentMeasurements, pulse)
			}
			databaseComponent.getTargetValues(function(e,o) {
				if (o) {
					console.log(o)
					let humidityDifference = simpleMathOps.difference(currentMeasurements.humidity, o.humidity)
					let humidityDifferenceAbs = Math.abs(humidityDifference)
					let tempDifference = simpleMathOps.difference(currentMeasurements.temperature, o.temperature)
					let tempDifferenceAbs = Math.abs(tempDifference)
					if (humidityDifference < 0 && humidityDifferenceAbs > 0.25) {
						humidify(humidityDifferenceAbs)
					}
					if (humidityDifference > 0 && humidityDifferenceAbs > 0.25) {
						dryDown(humidityDifferenceAbs)
					}
					if (tempDifference < 0 && tempDifferenceAbs > 0.25) {
						heatUp(tempDifferenceAbs)
					}
					if (tempDifference > 0 && tempDifferenceAbs > 0.25) {
						coolDown(tempDifferenceAbs)
					}
				}
			})
			
			
			
		})

		board.on("exit", () => {
			led.off();
		});

	});

}

function coolDown(diff) {
	console.log('Room temperature will be lowered.')
	console.log(`Temperature difference is ${diff} Celsius`)
	console.log('---Not implemented---')
	return
}
function heatUp(diff) {
	console.log('Room temperature will be raised.')
	console.log(`Temperature difference is ${diff} Celsius`)
	console.log('---Not implemented---')
	return
}
function dryDown(diff) {
	console.log('Room humidity will be lowered.')
	console.log(`Humidity difference is ${diff} %`)
	console.log('---Not implemented---')
	return
}
function humidify(diff) {
	console.log('Room humidity will be raised.')
	console.log(`Humidity difference is ${diff} %`)
	console.log('---Not implemented---')
	return
}
