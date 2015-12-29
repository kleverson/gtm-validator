'use strict';

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

var API_KEY = process.env.GAPI_KEY;
var CLIENT_ID = process.env.GAPI_CLIENT_ID;
var CLIENT_SECRET = process.env.GAPI_CLIENT_SECRET;
var REDIRECT_URL = 'https://de-dev.crosslend.com/';


var auth = new Promise((resolve, reject) => {
    var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

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
            oauth2Client.setCredentials(tokens);
            resolve(oauth2Client);
        });
    });
});


function list(accountId) {
    auth.then(authClient => {
        tagManager.accounts.list({
            auth: authClient,
            accountId: accountId
        }, (err, res) => {
            console.log(res);

            process.exit();
        });
    });
}

function download(accountId) {
    auth.then(authClient => {
        tagManager.accounts.get({
            auth: authClient,
            accountId: accountId
        }, (err, res) => {
            console.log(err, res);
        });
    });
}


module.exports.list = list;
module.exports.download = download;