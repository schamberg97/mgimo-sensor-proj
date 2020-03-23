var fs = require('fs');
const crypto = require('crypto');

var accounts;
var path=require('path')
var simpleMathOps = require(path.resolve(__dirname + '/simpleMathOps.js'))
var moment = require('moment')

module.exports = {
	auth: {
		init,
		checkIfUserIsFree,
		autoLogin,
		noPassLogin,
		manualLogin,
		generateLoginKey,
		
	},
	profile: {
		updatePassword,
		updateAccount
	}
}

function init(db) {
	accounts = db.collection('accounts')
}

function updateAccount(newData, callback) {
	let findOneAndUpdate = function(data){
		var o = {
			
			companyPosition: data.companyPosition,
			email : data.email,
			firstname : data.firstname,
			
			lastname : data.lastname,
			//dateOfBirthday: data.dateOfBirthday,
			dateUpdate: moment().format('DD-MM-YYYY HH:mm:ss:S')
		}
		if (data.pass) o.pass = data.pass;
		accounts.findOneAndUpdate({_id:getObjectId(data.id)}, {$set:o}, {returnOriginal : false}, callback);
	}
	accounts.findOne({_id:getObjectId(newData.id)}, function(e,r) {
		if (e || r == null) {
			var error = {
				code: 401,
				status: "error",
				error: "could-not-find-account"
			}
			callback(error)
		}
		else {
			saltAndHash(newData.pass, function (hash) {
				newData.pass = hash;
				validatePassword(newData.oldPass, r.pass, function (err, res) {
					if (err || res == null) {
						var error = {
							code: 401,
							status: "error",
							error: "wrong-old-pass"
						}
						callback(error)
					}
					else {
						findOneAndUpdate(newData);
					}
				})
			})

		}
	})
}

function checkIfUserIsFree(user, callback) {
	accounts.findOne({user:user}, function(e, o) {
		if (o) {
			callback(null, "found")
		}
		else {
			callback(e || 'not-found')
		}
	})
}

function generateLoginKey (user, ipAddress, callback)
{
	let cookie = simpleMathOps.guid();
	accounts.findOneAndUpdate({user:user}, {$set:{
		ip : ipAddress,
		cookie : cookie
	}}, {returnOriginal : false}, function(e, o){ 
		callback(cookie);
	});
}

function autoLogin(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

function noPassLogin (user, callback) {
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	
		else{
			callback(null, o);
		}
	})
}

function manualLogin (user, pass, callback)
{
	accounts.findOne({ user: user }, function (e, o) {
		console.log(o||e)
		console.log(pass)
		if (o == null) {
			callback('user-not-found');
		} else {
			validatePassword(pass, o.pass, function (err, res) {
				if (res) {
					callback(null, o);
				} else {
					callback('invalid-password');
				}
			});
		}
	});
}


function updatePassword (passKey, newPass, callback)
{
	//const hasher = crypto.createHash('sha256');
	saltAndHash(newPass, function(hash){
		newPass = hash;
		accounts.findOneAndUpdate({passKey:passKey}, {$set:{pass:newPass}, $unset:{passKey:''}}, {returnOriginal : false}, callback);
	});
}


var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 64);
	crypto.scrypt(salt + plainPass, salt, 128, (err, derivedKey) => {
  		if (err) { 
  			console.err(err)
  			if (callback) {
  				callback("error",null)
  			}
  			else {
  				return err;
  			}
  		}
  		else {
  			//console.log(derivedKey.toString("hex"))
  			if (salt + derivedKey.toString("hex") === hashedPass) {
  				if (callback) {
  					callback(null, true);
  				}
  				else {
  					return true;
  				}
  			}
  			else {
  				if (callback) {
  					callback("error",null)
  				}
  				else {
  					return false;
  				}
  			}
  		}
	});
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var listIndexes = function()
{
	accounts.indexes(null, function(e, indexes){
		for (var i = 0; i < indexes.length; i++) console.log('index:', i, indexes[i]);
	});
}

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

var saltAndHash = function(pass, callback)
{
	//const hasher = crypto.createHash('sha256');
	//hasher.update(pass);
	//pass = hasher.digest('utf8')
	var salt = generateSalt();
	
	crypto.scrypt(salt + pass, salt, 128, (err, derivedKey) => {
  		if (err) { 
  			console.err(err)
  			if (callback) {
  				callback("fail")
  			}
  			else {
  				return "fail"
  			}
  		}
  		else {
  			//console.log(derivedKey.toString("hex"))
  			if (callback) {
  				callback(salt + derivedKey.toString("hex"));
  			}
  			else {
				console.log(salt + derivedKey.toString("hex"))
  				return salt + derivedKey.toString("hex")
  			}
  		}
	});
}

var generateSalt = function()
{
	var salt = crypto.randomBytes(128).toString('base64').slice(0, 64);
	return salt;
}