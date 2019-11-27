var createError = require('http-errors');
var cors = require('cors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var env = require('./env');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: env.salt,
    cookie: { maxAge: 60000 }
}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Database
if (env.isProduction) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect('mongodb://localhost/oauth', { useNewUrlParser: true });
    mongoose.set('debug', true);
}
mongoose.set('useCreateIndex', true);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB error: '));
db.once('open', console.log.bind(console, 'MongoDB connection successful'));

require('./models/user');
require('./models/oauth');

// Routes
app.use(require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = !env.isProduction ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;