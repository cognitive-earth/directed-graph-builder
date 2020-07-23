//logger
const logger = require('debug')('bigQuery:app');
logger.log = console.log.bind(console);
logger("Initialise App");

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const indexRouter = require('./routes/routerIndex');
app.use('/', indexRouter);


module.exports = app;
