document.addEventListener('DOMContentLoaded', function () {
	periodicRefetch()
	function periodicRefetch(num) {
		if (!num) {
			num = 0
		}
		getData()
		getTargetValues()
		num++
		setTimeout(periodicRefetch, 4500, num);
	}
	function getData() {
		$.ajax({
			url: '/getCurrent/',
			type: 'GET',
			success: function(data){
				
				$("#humidityNum").text(data.humidityNum)
				$("#temperatureNum").text(data.temperatureNum)
			},
			error: function(jqXHR){
				console.log(jqXHR)
				alert('System failure. Try reloading page or restarting device. If the problem persists, please contact support.')
			}
		});
	}
	function getTargetValues() {
		$.ajax({
			url: '/getTargetValues/',
			type: 'GET',
			success: function(data){
				console.log(data.data)
				$("#humidityNumTarget").text(data.data.humidity)
				$("#temperatureNumTarget").text(data.data.temperature)
			},
			error: function(jqXHR){
				console.log(jqXHR)
				$("#humidityNumTarget").text('Not set')
				$("#temperatureNumTarget").text('Not set')
			}
		});
	}
})

