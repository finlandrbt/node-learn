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
var credentials = require('./credentials.js');

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
//app.disable('x-powered-by');

app.use(require('body-parser').json());

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(require('express-session')({
    resave: false, 
    saveUninitialized: true,
    secret: credentials.cookieSecret, 
}));

app.use(function(req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = fortune.getWeatherData();

    res.locals.flash = req.session.flash;
    delete req.session.flash;

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

app.post('/newsletter', function(req, res) {
    var name = req.body.name || '', email = req.body.email || '';
    /*
    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) return res.json({ error: "Invalid name email address." });
        req.session.flash = {
            type: "danger",
            intro: "Validation error",
            message: "The email address you entered was not valid.",
        };
        return res.redirect(303, "/newsletter");
    }
    */
    console.log("email: " + req.body.email);
    new NewsletterSignup({name: name, email, email}).save(function(err) {
        if (err) {
            if (req.xhr) return res.json({ error: "Database error." });
            req.session.flash = {
                type: "danger",
                intro: "Database error",
                message: "There was a database error; please try again later.",
            }
            return res.redirect(303, "/newsletter");
        }
        if (req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: "success",
            intro: "Thank you",
            message: "You have now been signed up for the newsletter.",
        };
        return res.redirect(303, "/newsletter");
    });
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
