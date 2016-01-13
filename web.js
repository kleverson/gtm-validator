'use strict';

var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

var gapi = require('googleapis');
var tagManager = gapi.tagmanager('v1');
var OAuth2Client = gapi.auth.OAuth2;

app.set('port', (process.env.PORT || 5000));

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    console.log(req.cookies);
    if (!req.cookies || !req.cookies.gauth) {
        return res.redirect('/login');
    }
    res.redirect('/accounts');
});

app.get('/login', function(req, res) {
    res.render('login');
});
app.get('/accounts', ensureToken, function(req, res) {
// console.log(req.authClient);
    tagManager.accounts.list({
        authClient: req.authClient
    }, function(err, resp) {
        if (err) {
            if (err.code && err.code === 401) {
                res.clearCookie('gauth');
            }
            return res.status(500).send(err);
        }
        // console.log(resp);
        res.render('gtm-accounts', {
            accounts: resp.accounts
        });
    });

});
app.get('/auth', function(req, res) {
    var oauth2Client = getOauthClient(req);
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/tagmanager.readonly',
            'https://www.googleapis.com/auth/tagmanager.manage.users',
            'https://www.googleapis.com/auth/tagmanager.manage.accounts',
            'https://www.googleapis.com/auth/tagmanager.edit.containers',
            'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
            'https://www.googleapis.com/auth/tagmanager.publish'
        ]
    });
    res.redirect(url);
});
app.get('/auth/token', function(req, res) {
    if (!req.query.code) {
        return res.status(412).send('code is missing');
    }
    var oauth2Client = getOauthClient(req);
    oauth2Client.getToken(req.query.code, function(err, tokens) {
        if (err) {
            return res.status(412).send('tokens not found: ' + err);
        }

        res.cookie('gauth', tokens);
        res.redirect('/accounts');
    })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



function getOauthClient(req) {
    var CLIENT_ID = process.env.GAPI_CLIENT_ID;
    var CLIENT_SECRET = process.env.GAPI_CLIENT_SECRET;

    var redirectUrl = req.protocol + '://' + req.get('host') + '/auth/token';

    return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUrl);
}

function ensureToken(req, res, next) {
    if (!req.cookies.gauth) {
        return res.redirect('/login');
    }
    console.log(req.cookies.gauth);
    var oauth2Client = getOauthClient(req);
    oauth2Client.setCredentials(req.cookies.gauth);
    req.authClient = oauth2Client;
    next();
}