'use strict';

var fs = require('fs');
var readline = require('readline');
var gapi = require('googleapis');
var tagManager = gapi.tagmanager('v1');
var OAuth2Client = gapi.auth.OAuth2;

var scopes = [
    'https://www.googleapis.com/auth/tagmanager.readonly',
    'https://www.googleapis.com/auth/tagmanager.manage.users',
    'https://www.googleapis.com/auth/tagmanager.manage.accounts',
    'https://www.googleapis.com/auth/tagmanager.edit.containers',
    'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
    'https://www.googleapis.com/auth/tagmanager.publish'
];

var TMP_TOKENS = getUserHome() + '/.gtm-validator.json';
var API_KEY = process.env.GAPI_KEY;
var CLIENT_ID = process.env.GAPI_CLIENT_ID;
var CLIENT_SECRET = process.env.GAPI_CLIENT_SECRET;
var REDIRECT_URL = 'https://de.crosslend.com/oauth-code.html';

var authPromise;
var auth = function () {
    if (authPromise) {
        return authPromise;
    }
    authPromise = new Promise((resolve, reject) => {
        var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

        try {
            var config = JSON.parse(fs.readFileSync(TMP_TOKENS, {
                encoding: 'UTF-8'
            }));
            if (config && config.access_token) {
                oauth2Client.setCredentials(config);
                resolve(oauth2Client);
                return;
            }
        } catch (e) {
            // no file probably..
        }

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // will return a refresh token
            scope: scopes
        });

        console.log('Visit the url: ', url);
        rl.question('Enter the code here:', function (code) {
            // request access token
            oauth2Client.getToken(code, function (err, tokens) {
                if (err) {
                    console.warn(err);
                    return reject(err);
                }
                // save token
                fs.writeFile(TMP_TOKENS, JSON.stringify(tokens), (err) => {
                    if (err) throw err;
                });
                oauth2Client.setCredentials(tokens);
                resolve(oauth2Client);
                rl.close();
            });
        });
    });

    return authPromise;
};


function accounts() {
    return new Promise(resolve => {
        auth().then(authClient => {
            tagManager.accounts.list({
                auth: authClient
            }, (err, res) => {
                handleError(err);

                resolve(res.accounts);
            });
        });
    });
}

function accountContainers(accountId) {
    return new Promise(resolve => {
        auth().then(authClient => {
            tagManager.accounts.containers.list({
                auth: authClient,
                accountId: accountId
            }, (err, res) => {
                handleError(err);

                resolve(res.containers);
            });
        });
    });
}

function conatainerTags(accountId, containerId) {
    return new Promise(resolve => {
        auth().then(authClient => {
            tagManager.accounts.containers.tags.list({
                auth: authClient,
                accountId: accountId,
                containerId: containerId,
            }, (err, res) => {
                handleError(err);

                resolve(res.tags);
            });
        });
    });
}

function tag(accountId, containerId, tagId) {
    return new Promise((resolve, reject) => {
        auth().then(authClient => {
            tagManager.accounts.containers.tags.get({
                auth: authClient,
                accountId: accountId,
                containerId: containerId,
                tagId: tagId
            }, (err, res) => {
                if (err) {
                    if (err.code === 404) {
                        return reject('Tag not found');
                    }
                    return handleError(err);
                }

                resolve(res);
            });
        });
    });
}

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function handleError(err) {
    if (err) {
        console.error(err);
        console.log(`\nSeems like the token expired. Removing cached token, please try again.\n`);
        fs.unlinkSync(TMP_TOKENS);
        process.exit(1);
    }
}


module.exports.accounts = accounts;
module.exports.accountContainers = accountContainers;
module.exports.conatainerTags = conatainerTags;
module.exports.tag = tag;