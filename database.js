var fs = require('fs')
const spawn = require('child_process').spawn;
const MongoClient = require('mongodb').MongoClient;
const os = require('os')

if (!fs.existsSync(`${__dirname}/database/`)) {
    fs.mkdir(`${__dirname}/database/`, { recursive: true }, (err) => {
        if (err) {
			console.log('Error creating Database directory')
			if (process.env.DEBUG == "true") {
				console.log(err)
			}
        }
        else {
            console.log('Successfully created Database directory')
        }
    });
}

var mongoPath
if (os.platform == "darwin") {
	mongoPath = `${__dirname}/platform/mac/bin/mongod`;
}
else if (os.platform == "win32") {
	mongoPath = `${__dirname}/platform/win64/bin/mongod.exe`;
}
else {
	mongoPath = `mongod`;
}

var pipe
if (process.env.DEBUG == "true") {
	pipe = spawn(mongoPath, [`--dbpath=${__dirname}/database/`, '--fork', '--bind_ip', '0.0.0.0', '--port', '7777', '--logpath', `${os.tmpdir()}/embeddedMongo.log`], { shell: true })
	pipe.stdout.on('data', function (data) {
		console.log(data.toString('utf8'));
	});
	pipe.stderr.on('data', (data) => {
		console.log(data.toString('utf8'));
	});
}
else {
	pipe = spawn(mongoPath, [`--dbpath=${__dirname}/database/`, '--fork', '--bind_ip', '127.0.0.1', '--port', '7777', '--logpath', `${os.tmpdir()}/embeddedMongo.log`], { shell: true })
}

pipe.on('error', (err) => {
	if (process.env.DEBUG == "true") {
		console.log(err)
	}
	else {
		if (os.platform == "darwin") {
			console.log('Something went seriously wrong. Please check that the package is not corrupt. If problem persists, contact support.')
		}
		else if (os.platform == "win32") {
			console.log('Something went seriously wrong. Please check that the package is not corrupt. If problem persists, contact support.')
		}
		else {
			console.log("You need to install MongoDB on this machine. Please go to <https://docs.mongodb.com/manual/administration/install-community/>")
		}
	}
	
});


const url = 'mongodb://localhost:7777';
const dbName = 'z371';

let _db;
let __db;

module.exports = {
    getDb,
	initDb,
	setTargetValues,
	getTargetValues
};

function initDb(callback) {
	if (_db) {
		console.warn("Trying to init DB again!");
		return callback(null, _db);
	}
	MongoClient.connect(url, { useUnifiedTopology: true, retryWrites:false }, connected);
	function connected(err, db) {
		if (err) {
			if (process.env.DEBUG == "true") {
				console.log(err)
			}
			return callback(err);
		}
		console.log("DB initialized - connected");
		_db = db
		
		callback(null, _db);

		accounts = _db.db(dbName).collection('accounts')
		accounts.find({}).toArray(function (err, result) {
			if (err || result.length === 0) {
				data = {
					user: 'admin',
					dateCreation: parseInt((new Date().getTime() / 1000).toFixed(0)),
					pass: 'at51GaHfunQFPxWiJ8yWXZ0Qg6IBThPQOhT2XrJU7iGq/s17wMWNOp1o1imx4riMe1cc0d38d5cffe8a48c88a75c2d784ff1256ef7f1527bc82b81fd562f2cdf09954c4c659da2b46dfc796863f09b87b21cbf5bdc9cfd7b2da5bd6a42b97a687e5c765b7392e1ed8faaa7461073a096ba66557d6b293fdfc5e170cdd2278b6957dbccbbb5815fcdba25510216d0f7b8164fa83fed4123fc56fdc58820e67af83fc',
					//default pass is admin
					roles: ["admin"]
				}
				accounts.insertOne(data)
				
			}
		})
	}
}

function getDb(clientOnly) {
	if (!_db) {
		console.warn("DB not initialized")
		return 'db-uninitialized'
	}
	else {
		if (clientOnly) {
			return _db
		}
		else {
			return _db.db(dbName);
		}
	}
}

function setTargetValues(targetValuesObj, callback, attempt) {
	if (!attempt) {
		attempt = 0
	}
	if (attempt < 3) {
		attempt++
		db = getDb();
		let config = db.collection('config')
		config.findOneAndUpdate({ type: "targetValues" }, { $set: { type: "targetValues", temperature: targetValuesObj.temperature, humidity: targetValuesObj.humidity } }, { upsert: true }, function (e, o) {
			if (e) {
				setTargetValues(targetValuesObj, callback, attempt)
			}
			else {
				callback(null, 'success')
			}
		})
	}
	else {
		callback('write-attempts-exceeded-limit')
	}
}

function getTargetValues(callback) {

		let db = getDb();
		let config = db.collection('config')
		config.findOne({ type: "targetValues" }, function (e, o) {
			if (e) {
				callback(e, null)
			}
			else {
				callback(null, o)
			}
		})
}