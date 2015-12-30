# GTM Containers validator tool

Allows to check GTM tags against some common pitfalls that might disappoint your happy customers.

Checks can be done against local files (exported JSON containers) or directly with Google tagmanager API

## Export your container as json

In GTM go to `Administration > Export Container` and choose container to export.
Save it in the containers folder or anywhere else.


        node gtm-validator.js local path/to/exportedGTM.json

## Validators

Implemented validators:
* document.write
* http:// links

Checks against all HTML/Script parameters and detects `document.write()` usage without `documentWriteSupport` enabled

Fixes would need to be done manually by clicking on a tag link

Use `-v` or `--verbose` mode to output tag HTML/script.

Use `-s` or `--summary` to display only resulting warnings count instead of tag info.

## GTM API

With the first api call, OAuth token would be requested.
URL should be opened in browser and then `code` should be entered in console prompt


### List available accounts

To get the list of all available to authorized user accounts

```
node gtm-validator gtm:list-accounts

[{ account: '111111', name: 'de.your-website.com'},
    { account: '222222', name: 'uk.your-website.com'},
    ...]
```

### List account containers

To get the list of all containers within account

```
node gtm-validator.js gtm:list-containers 11111111

[ { accountId: '1111111',
    containerId: '2222222',
    name: 'de.your-website.com',
    publicId: 'GTM-NE444YYY',
    timeZoneCountryId: 'US',
    timeZoneId: 'America/Los_Angeles',
    notes: '',
    usageContext: [ 'web' ],
    enabledBuiltInVariable:
    [ 'pageUrl',
        'pageHostname',
        'pagePath',
        'referrer',
        'event',
        'clickElement',
        'clickClasses',
        'clickId',
        'clickTarget',
        'clickUrl',
        'clickText',
        'formId' ],
        fingerprint: '1451386358233' } ]
```

### Validate specific container

To run validations against single container's tags

```
node gtm-validator.js gtm:container 11111 22222

image on documents page                 https://tagmanager.google.com/#/container/accounts/123098056/containers/1537360/tags/5
type:html   DocWrite [0] disabled   http links [0]

script alert                            https://tagmanager.google.com/#/container/accounts/123098056/containers/1537360/tags/7
type:html   DocWrite [0] disabled   http links [0]

Applicata pixel                         https://tagmanager.google.com/#/container/accounts/123098056/containers/1537360/tags/8
type:html   DocWrite [0] disabled   http links [0]


Total: 3
Warnings: 0

```

### Validate all containers for account

To validate all containers within one account

```
node gtm-validator.js gtm:account <accountId>

Found 1 container(s)

GTM-ASD1234S: uk-stage.your-site.com

image on documents page                 https://tagmanager.google.com/#/container/accounts/111111/containers/22222/tags/5
type:html   DocWrite [0] disabled   http links [0]

script alert                            https://tagmanager.google.com/#/container/accounts/111111/containers/22222/tags/7
type:html   DocWrite [0] disabled   http links [0]

Applicata pixel                         https://tagmanager.google.com/#/container/accounts/111111/containers/22222/tags/8
type:html   DocWrite [0] disabled   http links [0]


Total: 3
Warnings: 0
```

### Validate *ALL*

This command will find all accounts that belong to user, fetch all containers and validate every tag for every container of each account.

```
node gtm-validator gtm:all

AccountId: #3333   GTM-XX33YY your.website.com

.....

Total: 0
Warnings: 0

```

## API
https://developers.google.com/tag-manager/api/v1/reference/accounts/containers/tags/update
https://github.com/google/google-api-nodejs-client/


### Get keys: https://developers.google.com/identity/protocols/application-default-credentials
Generate OAuth keys from https://console.developers.google.com/home/dashboard
Export them:

    export GAPI_CLIENT_ID='your-client-id'
    export GAPI_CLIENT_SECRET='your-client-secret'


### License
MIT