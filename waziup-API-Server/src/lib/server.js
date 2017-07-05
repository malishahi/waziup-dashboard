"use strict";

const express = require('express');
const session = require('express-session');
const accessSetup = require('./access');


const app = express();


/**
 * 
 */
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true
}));

const access = accessSetup(app);

module.exports = {
    app,
    access
};