const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const bodyParser = require ('body-parser');

var indexRouter = require('./routes/api.router');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.send({
	status: err.status || 500,
	message: err.message
  });
});

module.exports = app;
