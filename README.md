# GTM Containers validator tool

## Export your container as json

In GTM go to `Administration > Export Container` and choose container to export.
Save it in the containers folder or anywhere else.


## Run the tool


        node gtm-validator.js local path/to/GTM-XXYYZZ-vJJ.json

        node gtm-validator.js gtm:list <accountId>

        node gtm-validator.js gtm:download <accountId> <containerId>


It will output debug information



## API
https://developers.google.com/tag-manager/api/v1/reference/accounts/containers/tags/update
https://github.com/google/google-api-nodejs-client/


### Get keys: https://developers.google.com/identity/protocols/application-default-credentials
Generate OAuth keys from https://console.developers.google.com/home/dashboard
Export them:

    export GAPI_CLIENT_ID='your-client-id'
    export GAPI_CLIENT_SECRET='your-client-secret'

