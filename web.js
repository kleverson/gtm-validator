'use strict';

var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var _ = require('lodash');

var gapi = require('googleapis');
var tagManager = gapi.tagmanager('v1');
var OAuth2Client = gapi.auth.OAuth2;

app.set('port', (process.env.PORT || 5000));

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    if (!req.cookies || !req.cookies.gauth) {
        return res.redirect('/login');
    }
    res.redirect('/accounts');
});

app.get('/login', function(req, res) {
    res.render('login');
});
app.get('/accounts', ensureToken, function(req, res) {
    tagManager.accounts.list({}, function(err, resp) {
        if (err) {
            return errorHandler(err, res);
        }

        res.render('gtm-accounts', {
            accounts: resp.accounts
        });
    });
});
app.get('/account/:accountId', ensureToken, function(req, res) {
    if (!req.params.accountId) {
        res.redirect('/accounts');
    }
    tagManager.accounts.containers.list({
        accountId: req.params.accountId
    }, function(err, resp) {
        if (err) {
            return errorHandler(err, res);
        }

        res.render('gtm-account', {
            accountId: req.params.accountId,
            containers: resp.containers
        });
    });
});
app.get('/account/:accountId/container/:containerId', ensureToken, function(req, res) {
    if (!req.params.accountId || !req.params.containerId) {
        res.redirect('/accounts');
    }
    tagManager.accounts.containers.tags.list({
        accountId: req.params.accountId,
        containerId: req.params.containerId
    }, function(err, resp) {
        if (err) {
            return errorHandler(err, res);
        }

        res.render('gtm-container', {
            accountId: req.params.accountId,
            containerId: req.params.containerId,
            tags: prepareTags(resp.tags || [])
        });
    });
});


/* Auth */
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

        oauth2Client.credentials = tokens;
        gapi.options({auth: oauth2Client});
        res.cookie('gauth', tokens);
        res.redirect('/');
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
    var oauth2Client = getOauthClient(req);
    oauth2Client.credentials = req.cookies.gauth;

    gapi.options({auth: oauth2Client});

    req.authClient = oauth2Client;
    next();
}

function errorHandler(err, res) {
    if (err.code && err.code === 401) {
        res.clearCookie('gauth');
    }
    return res.status(500).send(err);
}

function prepareTags(tags) {
    // TODO: refactor validator.js to split this logic
    tags.forEach(tag => {
        tag.scripts = _.map(
            _.filter(tag.parameter, param => param.type.match(/template/i)),
            param => param.value.replace(/</gm, '&lt;').replace(/\n/gm, "<br>")
        ).join("\n");

        var support = _.first(
            _.filter(tag.parameter, { key: 'supportDocumentWrite' })
        );
        var htmls = _.filter(tag.parameter, param => param.type.match(/template/i));
        var docWrites = _.filter(htmls, param => param.value.match(/document\.write/));

        tag.docWriteSupport = (support && support.value === 'true') ? true : false;
        tag.docWriteCount = docWrites.length > 0;
    });
    return tags;
}