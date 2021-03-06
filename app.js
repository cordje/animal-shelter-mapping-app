

// APPLICATION AND MODULE DEFINITIONS
// =================================================================================

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var s3Info = config.get('S3Info');
var aws = require('aws-sdk');

// set the aws identity
aws.config.update({
    accessKeyId: s3Info.UserAccessKeyId,
    secretAccessKey: s3Info.UserAccessSecretKey,
    region: s3Info.Region
});

var routes = require('./routes/index');

// instantiate the app and activate on port
var app = express();
app.set('port', process.env.PORT || 3000);

// test log that server is up
var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// sync our app with exports
module.exports = app;



// DEFINE MIDDLEWARE
// =================================================================================

// uncomment after placing favicon in /public <-- need to do this
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);



// ERROR HANDLERS
// =================================================================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.locals.pretty = true;






