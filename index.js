

const cluster = require('cluster');
if (cluster.isMaster) {
	if (process.argv.includes ('--debug')) {
		process.env.DEBUG=true
	}
	console.log('Launcher is running. Trying to run main logic...')
	cluster.fork()
	cluster.on('exit', (worker, code, signal) => {
		cluster.fork()
	});
}
else {
	var path = require('path')
	try {
		
		require('dotenv').config()
		require(path.resolve(__dirname + '/loader.js'))
	}
	catch (e) {
		if (process.env.DEBUG == "true") {
			console.log(e)
		}
		var fs = require('fs');
		fs.access(path.resolve(__dirname + '/FIRSTRUN'), fs.F_OK, (err) => {
			if (err) {
			console.log('It appears it might be the first launch... Trying to install modules')
			const { exec } = require("child_process");
			exec("npm install", (error, stdout, stderr) => {
				fs.writeFile('FIRSTRUN', 'FIRSTRUN', function (err) {
					if (err) throw err;
					console.log('First run record made');
				  }); 
				if (!error && (!stderr || stderr.includes('npm WARN'))) {
					console.log('Successfully installed modules. Restarting...')
					process.exit()
				}
				else {
					console.log(error || stderr)
					console.log('Some problems ocurred... Please debug or contact support')
				}
			});
			}
			else {
				console.log('Some problems with the app were found. Debug or contact support')
			}
		})
	}
}