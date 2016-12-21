var express = require('express');
var app = express();
var formidable = require('formidable');
var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
var fortune = require('./lib/fortune.js');

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
//app.disable('x-powered-by');

app.use(require('body-parser')());

app.use(function(req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = fortune.getWeatherData();
    next();
});

app.get('/', function(req, res) {
    res.render('home', { layout: 'ajax' });
});

app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.get('/newsletter', function(req, res) {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/process', function(req, res) {
    if (req.xhr || req.accepts('json,html') === 'json') {
        console.log(req.body);
        res.send({ success: true, name: req.body.name, email: req.body.email });    
    } else {
        res.redirect(303, '/newsletter');
    }
});

app.get('/thank-you', function(req, res) {
    res.render('home')
});

app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res) {
    res.json({
        animal: 'squirrel',
        bodyPary: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

app.get('/jquery', function(req, res) {
    res.render('jquerytest');
});

app.get('/request', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var s = 'params: ' + req.params + '\n' +
            'query: ' + req.query + '\n' +
            'body: ' + req.body + '\n' +
            'route: ' + req.route + '\n' +
            'cookies: ' + req.cookies + '\n' +
            'headers: ' + req.headers + '\n' +
            'ip: ' + req.ip + '\n' +
            'path: ' + req.path + '\n' +
            'host: ' + req.hostname + '\n' +
            'xhr: ' + req.xhr + '\n' +
            'protocol: ' + req.protocol + '\n' +
            'secure: ' + req.secure + '\n' +
            'url: ' + req.url + '\n' +
            'lang: ' + req.acceptedLanguages;
    res.send(s);
    
});

app.get('/header', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/about', function(req, res) {
    res.render('about', { fortune: fortune.getFortune() });
});

app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Exporess started on http://localhost:' + app.get('port') + '; Press Ctrl-C to terminate.');
});
