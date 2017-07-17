"use strict";

const Promise = require('bluebird');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const orionProxy = require('./lib/orion-proxy');
const server = require('./lib/server');

//importing individual routes
const sensorDataRoute = require('./routes/sensorData');
const authzRoute = require('./routes/authorization');

const app = server.app;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

//FIXME 
router.use(function(req, res, next) {
  console.log('%s URI: %s PATH: %s', req.method, req.url, req.path);
  next();
});

//serve the client
app.use(express.static("../../client/build"));

app.use('/api/v1', router);
//  .../search/:farmid
router.use('/sensorData', sensorDataRoute);
//  .../permissions .../test
router.use('/authorization', authzRoute);

<<<<<<< HEAD
orionProxy.install(router, '/orion/v2/entities');
=======
///removed entities to support other services such as subscriptions
orionProxy.install(router, '/orion');

keycloakProxy.install(router, '/keycloak');

>>>>>>> parent of 4cefcf1... latest updates

async function run() {
    await new Promise(resolve => app.listen(4000, () => resolve()));
    console.log('Listening on port 4000');
}

run();