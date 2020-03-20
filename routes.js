var path = require('path')
var { RateLimiterMongo } = require('rate-limiter-flexible');
var databaseComponent = require(path.resolve(__dirname + '/database.js'))
const rateLimiter = new RateLimiterMongo({
    points: 20,
    duration: 1,
    storeClient: databaseComponent.getDb('clientOnly'),
    dbName: 'z371',
    tableName: 'users-rate-limit',
});
var prepareData = require(path.resolve(__dirname + '/prepareData.js'))
var crypto = require('crypto')
var simpleMathOps = require(path.resolve(__dirname + '/simpleMathOps.js'))


var AM = require(path.resolve(__dirname + '/accountManager.js'))
AM.auth.init(databaseComponent.getDb())

module.exports = function (app) {

    app.all('*', (req, res, next) => {
        let key = req.ip;
        let pointsToConsume = 2
        if (req.session.user) {
            key = req.session.user
            pointsToConsume = 1;
        }
        rateLimiter.consume(key, pointsToConsume)
            .then((rateLimiterRes) => {
                next()
            })
            .catch((rej) => {
                let response = {
                    code: 429,
                    status: "too-many-requests",
                    retryIn: rej.msBeforeNext //milliseconds
                }
                res.status(429).json(response)
            });
    })
    app.all('*', function (req, res, next) {

        if (req.body['accessToken'] || req.query['accessToken']) {

            
            var accessToken = req.body['accessToken'] || req.query.accessToken // Проверка accessToken
            if (accessToken) {
                res.clearCookie('quik.z371.sid', { path: '/' })
                req.sessionID = accessToken;
                req.sessionStore.get(accessToken, function (err, ses) {
                    // This attaches the session to the req.
                    if (!err && ses) {
                        //console.log(ses)
                        if (ses.secretAccessToken == req.body['secretAccessToken'] || ses.secretAccessToken == req.query.secretAccessToken) {
                            req.sessionStore.createSession(req, ses);
                            next()
                        }
                        else {

                            var resObj = {
                                code: 401,
                                status: "error",
                                error: "invalid-tokens"
                            }

                            res.status(resObj.code).json(resObj)
                        }
                    }
                    else {

                        var resObj = {
                            code: 401,
                            status: "error",
                            error: "invalid-tokens"
                        }
                        res.status(resObj.code).json(resObj)
                    }
                })
            } else {
                next()
            }
        }
        else {
            next()
        }
    })




    app.all('*', (req, res, next) => {
        res.locals.userSession = req.session
        next()
    })


    app.get('/', (req, res) => {
        if (req.query.returnOk == "true") {
            res.status(200).json({
                code: 200,
                status: "ok"
            })
        }
        else if (req.query.deviceStatus == "true") {
            let lastData = require(path.resolve(__dirname + '/lastResult.js')).get()
            if (process.env.BOARD_READY != "true") {
                res.status(200).json({
                    code: 200,
                    status: "sensors-not-initialized"
                })
            }
            else if (lastData.humidity == undefined || lastData.temperature == undefined) {
                res.status(200).json({
                    code: 200,
                    status: "no-data-yet"
                })
            }
            else {
                res.status(200).json({
                    code: 200,
                    status: "operational"
                })
            }
        }
        else {
            if (req.session.user) {
                res.status(200).render("home", {
                    udata : req.session.user
                })
            }
            else {
                res.redirect('/user/login/')
            }
        }
    })

    app.post('/user/logout/', function(req, res){
		res.clearCookie('login');
		res.clearCookie("connect.sid");
		req.session.destroy(function(e){
			var resObj = {
				code: 200,
				status: "ok"
			}
			res.status(200).send(resObj); 
		});
    })
    app.get('/measurements/', (req,res) => {
        res.redirect('/measurements/current/')
    })
    app.get('/measurements/current/', (req,res) => {
        if (req.session.user) {
            res.render('measurementsCurrent')
        }
        else {
            res.redirect('/')
        }
    })

    app.get('/measurements/setTarget/', (req,res) => {
        if (req.session.user) {
            databaseComponent.getTargetValues((e,o) => {
                if (e) {
                    res.render('setTarget', {})
                }
                else {
                    //console.log(o)
                    res.render('setTarget', {data: {temperature: o.temperature, humidity: o.humidity}})
                }
            })
            
        }
        else {
            res.redirect('/')
        }
    })

    app.get(['/getCurrent/:measurement/:unit/', '/getCurrent/:measurement/', '/getCurrent/'], (req, res) => {
        if (req.session.user) {

            let lastData = require(path.resolve(__dirname + '/lastResult.js'))
            if (req.params.measurement) {
                let measurements = req.params.measurement.split(',')
                let measurementsUnits = null
                if (req.params.unit) {
                    measurementsUnits = req.params.unit.split(',')
                }
                if (measurementsUnits && measurements.length == measurementsUnits.length) {
                    doJob(req, res, measurements, measurementsUnits)
                }
                else {
                    measurementsUnits = []
                    for (let n = 0; n < measurements.length; n++) {
                        measurementsUnits.push('default')
                    }
                    doJob(req, res, measurements, measurementsUnits)
                }
            }
            else {
                measurements = ['temperature', 'humidity', 'height', 'pressure']
                measurementsUnits = ['default', 'default', 'default', 'default']
                doJob(req, res, measurements, measurementsUnits)
            }
        }
        else {
            authRequired(req, res)
        }
    })

    app.get(['/getHistoric/:timeStart/:timeEnd/:measurement/:unit/', '/getHistoric/:timeStart/:timeEnd/:measurement/', '/getHistoric/:timeStart/:timeEnd/', '/getHistoric/'], (req, res) => {
        if (req.session.user) {
            if (req.params.timeStart.match(/^-{0,1}\d+$/) || req.params.timeEnd.match(/^-{0,1}\d+$/)) {
                let timeStart = Number(req.params.timeStart)
                let timeEnd = Number(req.params.timeEnd)
                if (timeStart > timeEnd) {
                    fail()
                }
                else {
                    let lastData = require(path.resolve(__dirname + '/lastResult.js'))
                    let db = databaseComponent.getDb()
                    let records = db.collection('records')
                    records.find({ time: { $gte: Number(timeStart), $lte: Number(timeEnd) } }).toArray(function (err, result) {
                        if (err) {
                            res.status(500).json({
                                code: 500,
                                status: 'db-error'
                            })
                        }
                        else {
                            var finalResults = []
                            result.forEach((item) => {
                                let preliminaryResult
                                if (req.params.measurement) {
                                    let measurements = req.params.measurement.split(',')
                                    let measurementsUnits = null
                                    if (req.params.unit) {
                                        measurementsUnits = req.params.unit.split(',')
                                    }
                                    if (measurementsUnits && measurements.length == measurementsUnits.length) {
                                        preliminaryResult = doJob(req, res, measurements, measurementsUnits, item)
                                    }
                                    else {
                                        measurementsUnits = []
                                        for (let n = 0; n < measurements.length; n++) {
                                            measurementsUnits.push('default')
                                        }
                                        preliminaryResult = doJob(req, res, measurements, measurementsUnits, item)
                                    }
                                }
                                else {
                                    measurements = ['temperature', 'humidity', 'height', 'pressure']
                                    measurementsUnits = ['default', 'default', 'default', 'default']
                                    preliminaryResult = doJob(req, res, measurements, measurementsUnits, item)
                                }
                                finalResults.push(preliminaryResult)
                            })
                            var resObj = {
                                code: 200,
                                status: "ok",
                                results: finalResults
                            }
                            res.status(200).json(resObj)
                        }
                    })
                }
            }
            else {
                fail()

            }
            function fail() {
                res.status(400).json({
                    code: 400,
                    status: "time-parameters-not-proper-integers",
                })
            }
        }
        else {
            authRequired(req, res)
        }
    })

    app.get('/getTargetValues/', (req,res) => {
        if (req.session.user) {
            databaseComponent.getTargetValues((e,o) => {
                var resObj
                if (e) {
                    resObj = {
                        code: 200, 
                        status:"error", 
                        error: e || 'no-target-values'
                    }
                    
                }
                else {
                    delete o._id
                    resObj = {
                        code: 200,
                        status: "ok",
                        data: o
                    }
                }
                res.status(resObj.code).json(resObj)
            })
        }
        else {
            authRequired(req, res)
        }
    })

    app.post('/setTargetValues/', (req, res) => {
        if (req.session.user) {
            let targetValues = {}
            let resObj = {}
            //console.log(req.body)
            if (req.body.temperature && req.body.temperature.match(/^-{0,1}\d+$/)) {
                targetValues.temperature = req.body.temperature
            }
            if (req.body.humidity && req.body.humidity.match(/^-{0,1}\d+$/)) {
                targetValues.humidity = req.body.humidity
            }
            if (Object.keys(targetValues).length > 0) {
                databaseComponent.setTargetValues(targetValues, (e, o) => {
                    if (e) {
                        res.status(500).json({
                            code: 500,
                            status: 'error',
                            error: e || 'unknown-error'
                        })
                    }
                    else {
                        res.status(200).json({
                            code: 200,
                            status: 'ok'
                        })
                    }
                })
            }
            else {
                res.status(400).json({
                    code: 400,
                    status: 'error',
                    error: "one-or-more-target-values-needed"
                })
            }
        }
        else {
            authRequired(req, res)
        }
    })

    app.post('/user/login/', function (req, res) {

        var p0 = new Promise(
            function (resolve, reject) {
                AM.auth.manualLogin(req.body['user'], req.body['pass'], function (e, o) {
                    if (!o) {
                        var resObj = {
                            code: 401,
                            status: "error",
                            error: e
                        }
                        reject(resObj)
                    }

                    else {


                        req.session.user = o;
                        //req.session.config = configGenerator.generate(req.session.user);
                        if (req.body['deviceType'] !== "mobile") {
                            // /console.log(2)
                            if (req.body['remember-me'] == 'false') {
                                //console.log(3)
                                var resObj = {
                                    code: 200,
                                    status: "logged-in"
                                }
                                resolve(resObj)
                                
                            }
                            else {
                                //console.log(4)
                                AM.auth.generateLoginKey(o.user, req.ip, function (key) {
                                    res.cookie('login', key, { maxAge: 900000 });
                                    var resObj = {
                                        code: 200,
                                        status: "logged-in-and-remembered"
                                    }
                                    resolve(resObj)
                                });
                            }
                        }
                        else {

                            req.session.secretAccessToken = simpleMathOps.guid()
                            req.session.user.lastUpdate = parseInt((new Date().getTime() / 1000).toFixed(0))
                            var expiry = new Date(req.session.cookie._expires)

                            var resObj = {
                                code: 200,
                                status: "logged-in",
                                accessToken: req.session.id,
                                secretAccessToken: req.session.secretAccessToken,
                                validUntil: expiry.getTime()
                            }
                            resolve(resObj)
                        }

                    }
                });
            }
        );

        p0
            .then(function (result) {
                //console.log(result)
                res.status(result.code).json(result)
            })
            .catch(function (error) {
                res.status(error.code).json(error)
            });

    });

    app.get('/user/login/', (req,res) => {
        if (!req.session.user) {
            res.status(200).render('login', {
            })
        }
        else {
            res.redirect('/')
        }
    })

    app.all('*', (req,res) => {
        res.status(404).json({code:404,status:'error',error:'page-not-found'})
    })

}

function authRequired(req, res) {
    res.status(401).json({
        code: 401,
        status: "unauthorized",
    })
}

function doJob(req, res, measurements, measurementsUnits, lastData) {
    let dataObject = {}
    if (lastData) {
        var doNotSendResponse = true
    }
    else {
        var lastData = require(path.resolve(__dirname + '/lastResult.js')).get()
    }
    //console.log(lastData)
    measurements.forEach(function (item, index) {
        let temporaryDataObject;
        try {
            temporaryDataObject = prepareData['cur' + item[0].toUpperCase() + item.slice(1)](measurementsUnits[index], lastData)
            dataObject = { ...dataObject, ...temporaryDataObject }
        }
        catch (e) {
            console.log(`${item} is not implemented`)
        }
    })
    let status
    if (dataObject.dataMissing === undefined) {
        delete dataObject.dataMissing
    }
    if (Object.keys(dataObject).length == 3 * measurements.length) {
        status = "ok"
    }
    else if (Object.keys(dataObject).length == 0) {
        status = "no-data-yet"
    }
    else {
        status = "some-data-unavailable"
    }
    let resObj = {}
    if (lastData) {
        resObj = dataObject
    }
    else {

        resObj = {
            code: 200,
            status: status,
        }
        resObj = { ...resObj, ...dataObject }
    }
    delete resObj.dataMissing
    if (doNotSendResponse) {
        return resObj
    }
    else {
        res.status(200).json(resObj)
    }
}


function hashPasser(inp) {
    var hashPass = crypto.createHash('sha256').update(inp).digest("hex")
    return hashPass;
}