var bodyParser = require('body-parser');
var app = express();
var helmet = require('helmet');
var expurl = require('express-normalizeurl');
const expressSanitizer = require('express-sanitizer');
app.enable('strict routing');
app.set('case sensitive routing', true);
app.set('port', process.env.QE_PORT || 8000);
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
    lowercase: true,
    trailingSlash: true,
    repeatedSlash: true,
    repeatedQuestionMark: true,
    repeatedAmpersand: true
}));
app.use(helmet.hidePoweredBy({ setTo: `QUIK Embedded ${firmwareVersion} ${firmwareCodename}` }))
app.use(expressSanitizer());