"use strict";

const Keycloak = require('keycloak-connect');

const AccessLevel = {
    VIEW: 0,
    EDIT: 1
};


function setup(app) {

    const keycloak = new Keycloak("../keycloak.json");

    function getServicePathFromHeader(req) {
        /*if (req.headers['fiware-service'] !== 'watersense') {
            return;
        }*/

        return req.headers['fiware-servicepath'];
    }
    /*
     This extracts the "permissions" field from the access token and transforms it in the following way:

     "admin ; advisor : /FARM1;advisor:/FARM2 ; farmer : /FARM2;"

     =>

     {
     admin: [],
     advisor: [ '/FARM1', '/FARM2' ],
     farmer: [ '/FARM2' ]
     }
     */
    function extractPermissions(req) {
        const permString = req.kauth.grant.access_token.content.permissions;
        const permissions = {};
        
        if(permString === undefined)
            return permissions;
        const permPairs = permString.split(/\s*;\s*/).map(permPair => permPair.split(/\s*:\s*/));

        for (const permPair of permPairs) {
            const key = permPair[0];
            const value = permPair[1];

            if (!(key in permissions)) {
                permissions[key] = [];
            }

            if (value !== undefined) {
                permissions[key].push(value);
            }
        }

        return permissions;
    }

    function _servicePathIncluded(permissions, reqServicePath) {
        console.log("permissions: ", permissions, "reqServicePath: ", reqServicePath);
        return permissions && permissions.some(sp => reqServicePath === sp || reqServicePath.startsWith(sp));
    }

    /*
     Allows access to a handler only if the user has permission admin or advisor/farmer with a service path
     which equals is is a parent to the requested service path.

     Parameter "getServicePath" is a function (request => servicePath) that extracts the service path from the request.
     */
    function servicePathProtection(accessLevel, getServicePath) {
        return keycloak.protect((token, req) => {
            const permissions = extractPermissions(req);
            const servicePath = getServicePath(req);

            const result =
                servicePath && (

                    !!permissions['admin'] ||

                    (accessLevel === AccessLevel.EDIT &&
                    _servicePathIncluded(permissions['advisor'], servicePath)) ||

                    (accessLevel === AccessLevel.VIEW && (
                        _servicePathIncluded(permissions['advisor'], servicePath) ||
                        _servicePathIncluded(permissions['farmer'], servicePath)
                    ))
                )
            ;

            return result;
        });
    }

    app.use(keycloak.middleware({
        logout: '/logout',
        admin: '/'
    }));

    return {
        AccessLevel,
        keycloak,
        extractPermissions,
        servicePathProtection,
        getServicePathFromHeader
    }
}

module.exports = setup;