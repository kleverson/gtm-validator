'use strict';

var program = require('commander');

var checkLocal = require('./lib/check-local');
var gtm = require('./lib/gtm');

var cmd;

program.version('0.0.1')
    .command('gtm:download <accountId>')
    .description('Download containers using GAPI_KEY and storing in containers/ folder')
    .action((accountId, opts) => {
        cmd = 'gtm:download';
        gtm.download(accountId, opts);
    });

program
    .command('gtm:list <accountId>')
    .description('List GTM accounts')
    .action((accountId, opts) => {
        cmd = 'gtm:list';
        gtm.list(accountId, opts);
    });

program
    .command('gtm:tags <accountId> <containerId>')
    .description('List GTM tags')
    .action((accountId, opts) => {
        cmd = 'gtm:tags';
        gtm.tags(accountId, opts);
    });

program
    .command('local <files>')
    .description('Validate local json file')
    .action((files) => {
        cmd = 'local';
        checkLocal(files);
    });

program.parse(process.argv);

if (!cmd) {
    program.outputHelp();
}