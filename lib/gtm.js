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
var REDIRECT_URL = 'https://de-dev.crosslend.com/';

var auth = new Promise((resolve, reject) => {
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
        console.info(e);
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
        });
    });
});


function listAccounts() {
    return new Promise(resolve => {
        auth.then(authClient => {
            tagManager.accounts.list({
                auth: authClient
            }, (err, res) => {
                handleError(err);

                resolve(res.accounts);
            });
        });
    });
}

function listAccountContainers(accountId) {
    return new Promise(resolve => {
        auth.then(authClient => {
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

function listTags(accountId, containerId) {
    return new Promise(resolve => {
        auth.then(authClient => {
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

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function handleError(err) {
    if (err) {
        console.error(err);
        console.log(`\nIf the problem occurs again, please remove manually ${TMP_TOKENS} and try again\n`);
        process.exit(1);
    }
}


module.exports.listAccounts = listAccounts;
module.exports.listAccountContainers = listAccountContainers;
module.exports.tags = listTags;