var express = require('express')
var bodyParser = require('body-parser');

var helmet = require('helmet');
var expurl = require('express-normalizeurl');
const expressSanitizer = require('express-sanitizer');
var fs = require('fs')
var path = require('path')
var https = require('https')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
let crypto = require('crypto')
var databaseComponent = require(path.resolve(__dirname + '/database.js'))
require('http-shutdown').extend();
var httpsServer


const internalIp = require('internal-ip');

module.exports = function (firmwareVersion, firmwareCodename, port, database) {
    const statusMonitor = require('express-status-monitor')({ path: '' });
    var app = express();
    app.use(statusMonitor.middleware); // use the "middleware only" property to manage websockets
    app.get('/status', statusMonitor.pageRoute); // use the pageRoute property to serve the dashboard html page
    app.enable('strict routing');
    app.set('trust proxy', true)
    app.set('case sensitive routing', true);
    app.use('/', express.static('static'));
    app.set('port', port);
    app.set('views', './views')
    app.set('view engine', 'pug')
    app.set('firmwareCodename', firmwareCodename);
    app.set('firmwareVersion', firmwareVersion);
    app.use(helmet({
        hsts: false
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expurl({
        requestType: 'GET',
        redirectStatusCode: 301,
        lowercase: false,
        trailingSlash: true,
        repeatedSlash: true,
        repeatedQuestionMark: true,
        repeatedAmpersand: true
    }));
    app.use(helmet.hidePoweredBy({ setTo: `QUIK Embedded ${firmwareVersion} ${firmwareCodename}` }))
    app.use(expressSanitizer());
    app.use(session({
        secret: crypto.randomBytes(64).toString('hex'),
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
            client: databaseComponent.getDb('clientOnly'),
            dbName: "z371",
            touchAfter: 24 * 3600, // time period in seconds
            secret: crypto.randomBytes(64).toString('hex'),
        })
    }));
    
    this.startHTTPS = function() {
        require(path.resolve(__dirname + '/routes.js'))(app, database);
        var credentials = {
            key: fs.readFileSync('certs/server.key', 'utf8'), 
            cert: fs.readFileSync('certs/server.crt', 'utf8'),
            ca: [fs.readFileSync('certs/ca.crt', 'utf8')], //client auth ca OR cert
            requestCert: true,                   //new
            rejectUnauthorized: false            //new
        };
        httpsServer = https.createServer(credentials, app).listen(app.get('port'), '0.0.0.0').withShutdown();
    }
    this.stopHTTPS = function () {
        httpsServer.shutdown(function(err) {
            if (err) {
                return console.log('shutdown failed', err.message);
            }
            console.log('Everything is cleanly shutdown.');
        });
    }
}