import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store';
import Layout from './components/Layout';
import Map from './components/Map';
import Sensors from './components/sensors/Sensors';
import Users from './components/users/Users';
import UserDetail from './components/users/UserDetail';
import UserPermissions from './components/users/Perms';
import Gateways from './components/gateways/Gateways';
import SensorDetail from './components/sensors/sensor/SensorDetail';
import MeasurementDetail from './components/sensors/sensor/MeasurementDetail';
import Settings from './components/profile/Settings.js';
import Notifications from './components/notifs/Notifications.js';
import NotifDetail from './components/notifs/NotifDetail.js';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Keycloak from 'keycloak-js';
import config from './config';
import UTIL from './lib/utils.js';
import * as Waziup from 'waziup-js'

injectTapEventPlugin();

export const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

//Define app routes
const routes = {
  path: '/',
  component: Layout,
  indexRoute: { component: Sensors },
  childRoutes: [
    { path: 'map', component: Map },
    { path: 'notifications', component: Notifications },
    { path: 'notifications/:notifId', component: NotifDetail },
    { path: 'sensors', component: Sensors },
    { path: 'sensors/:sensorId', component: SensorDetail },
    { path: 'sensors/:sensorId/:measId', component: MeasurementDetail },
    { path: 'gateways', component: Gateways },
    { path: 'users', component: Users },
    { path: 'users/:userId', component: UserDetail },
    { path: 'users/:userId/perms', component: UserPermissions },
    { path: '*', component: () => <h2> Page not found!</h2> }
  ]
}

//Render the page with the layout and routes
function displayPage() {
  console.info("SERVER_URL: " + process.env.SERVER_URL)
  console.info("API_SERVER_URL: " + process.env.API_SERVER_URL)
  console.info("KEYCLOAK_URL: " + process.env.KEYCLOAK_URL)
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('app'));
}

//Perform the keycloak authentication 
//to get user infos on client side
export function keycloakLogin() {

  var keycloak = Keycloak({
    url: config.keycloakUrl,
    realm: config.realm,
    clientId: config.clientId,
    credentials: {
      secret: '261c186e-7084-4533-9c13-d2ae97e9a1ac'
    }
  });

  keycloak.init({ onLoad: 'login-required', checkLoginIframe: false }).success(authenticated => {
    if (authenticated) {
      console.log(JSON.stringify(keycloak))
      store.getState().keycloak = {token: keycloak.token, logout: keycloak.logout}
      console.log("kc " + JSON.stringify(keycloak.idTokenParsed))
      //getUser(keycloak.idTokenParsed.sub)(store.dispatch)
      store.getState().current_user = getUser(keycloak.idTokenParsed)
      setInterval(() => {
        keycloak.updateToken(30).success(function (refreshed) {
            if(refreshed) {
              store.getState().keycloak = {token: keycloak.token, logout: keycloak.logout}
              store.getState().current_user = getUser(keycloak.idTokenParsed)
            }
          }).error(function () {
            alert('Your session has expired, please log in again');
            keycloak.logout();
          })
        }, 10000);

      displayPage();
    }
  }).error(function (error) {
    console.log(error);
    console.log("Authentication error. Check Keycloak params and cors issues.");
  });
}

function getUser(keycloakId) {
  return {username:  keycloakId.preferred_username, 
          lastName:  keycloakId.family_name,
          firstName: keycloakId.given_name}
}
