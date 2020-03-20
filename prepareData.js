module.exports = {
	curTemperature,
	curHumidity,
	curPressure,
	curHeight
};

function curTemperature(unit, lastData) {
	let temperature;
	let temperatureNum;
	let temperatureUnits;
	let dataMissing
	if (lastData.temperature) {
		if (unit === 'celsius') {
			temperatureNum = Number(lastData.temperature)
			temperatureUnits = 'celsius'
			temperature = temperatureNum + " °C"

		}
		else if (unit === 'kelvin') {
			temperatureNum = Number(lastData.temperature + 273, 15)
			temperatureUnits = 'kelvin'
			temperature = temperatureNum + " K"
		}
		else if (unit === 'fahrenheit') {
			temperatureNum = Number((lastData.temperature * 9 / 5) + 32)
			temperatureUnits = 'fahrenheit'
			temperature = temperatureNum + " °F"
		}
		else {
			temperatureNum = Number(lastData.temperature)
			temperatureUnits = 'celsius'
			temperature = temperatureNum + " °C"
		}
	}
	else {
		if (unit === 'celsius') {
			temperatureNum = 'N/A'
			temperatureUnits = 'celsius'
			temperature = "N/A °C"
			dataMissing = true
		}
		else if (unit === 'kelvin') {
			temperatureNum = 'N/A'
			temperatureUnits = 'kelvin'
			temperature = "N/A K"
			dataMissing = true
		}
		else if (unit === 'fahrenheit') {
			temperatureNum = 'N/A'
			temperatureUnits = 'fahrenheit'
			temperature = "N/A °F"
			dataMissing = true
		}
		else {
			temperatureNum = 'N/A'
			temperatureUnits = 'celsius'
			temperature = "N/A °C"
			dataMissing = true
		}
	}
	let obj = {
		temperatureNum,
		temperatureUnits,
		temperature,
		dataMissing
	}
	return obj
}

function curHumidity(unit, lastData) {
	let humidity;
	let humidityNum;
	let humidityUnits;
	let dataMissing
	if (lastData.humidity) {
		humidityNum = Number(lastData.humidity)
		humidityUnits = '%'
		humidity = humidityNum + " %"
	}
	else {
		humidityNum = 'N/A'
		humidityUnits = '%'
		humidity = "N/A %"
		dataMissing = true
	}
	let obj = {
		humidityNum,
		humidityUnits,
		humidity,
		dataMissing
	}
	return obj
}

function curHeight(unit, lastData) {
	let height;
	let heightNum;
	let heightUnits;
	let dataMissing
	if (lastData.height) {
		if (unit === 'meters') {
			heightNum = Number(lastData.height)
			heightUnits = 'meters'
			height = heightNum + " m"

		}
		else if (unit === 'feet') {
			heightNum = Number(lastData.height) * 3.28084
			heightUnits = 'feet'
			height = heightNum + " ft"
		}
		else {
			heightNum = Number(lastData.height)
			heightUnits = 'meters'
			height = heightNum + " m"
		}
	}
	else {
		if (unit === 'meters') {
			heightNum = "N/A"
			heightUnits = 'meters'
			height = heightNum + " m"
			dataMissing = true
		}
		else if (unit === 'feet') {
			heightNum = "N/A"
			heightUnits = 'feet'
			height = heightNum + " ft"
			dataMissing = true
		}
		else {
			heightNum = "N/A"
			heightUnits = 'meters'
			height = heightNum + " m"
			dataMissing = true
		}
	}
	let obj = {
		heightNum,
		heightUnits,
		height,
		dataMissing
	}
	return obj
}

function curPressure(unit, lastData) {
	let pressure;
	let pressureNum;
	let pressureUnits;
	let dataMissing
	if (lastData.pressure) {
		//lastData.pressure = lastData.pressure * 1000 // we receive kPa, so we convert it into Pa
		if (unit === 'pascal') {
			pressureNum = Number(lastData.pressure)
			pressureUnits = 'pascal'
			pressure = pressureNum + " Pa"
		}
		else if (unit === 'bar') {
			pressureNum = Number(lastData.pressure) / 100000
			pressureUnits = 'bar'
			pressure = pressureNum + " bar"
		}
		else if (unit === "atmosphere") {
			pressureNum = Number(lastData.pressure) / 101325
			pressureUnits = 'atmosphere'
			pressure = pressureNum + " atm"
		}
		else {
			pressureNum = Number(lastData.pressure)
			pressureUnits = 'pascal'
			pressure = pressureNum + " Pa"
		}
	}
	else {
		if (unit === 'pascal') {
			pressureNum = "N/A"
			pressureUnits = 'pascal'
			pressure = pressureNum + " Pa"
		}
		else if (unit === 'bar') {
			pressureNum = "N/A"
			pressureUnits = 'bar'
			pressure = pressureNum + " bar"
		}
		else if (unit === "atmosphere") {
			pressureNum = "N/A"
			pressureUnits = 'atmosphere'
			pressure = pressureNum + " atm"
		}
		else {
			pressureNum = "N/A"
			pressureUnits = 'pascal'
			pressure = pressureNum + " Pa"
		}
	}
	let obj = {
		pressureNum,
		pressureUnits,
		pressure,
		dataMissing
	}
	return obj
}