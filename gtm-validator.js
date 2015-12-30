#!/usr/bin/env node

'use strict';

var program = require('commander');

var checkLocal = require('./lib/check-local');
var checkTags = require('./lib/check-tags');
var gtm = require('./lib/gtm');
var info = require('./package.json');

var cmd;

program
    .command('gtm:list-accounts')
    .description('List available accounts')
    .action((opts) => {
        cmd = 'gtm:list-accounts';
        gtm.listAccounts(opts)
            .then(accounts => {
                console.log(accounts);
            });
    });

program
    .command('gtm:list-containers <accountId>')
    .description('List available containers of an account')
    .action((accountId, opts) => {
        cmd = 'gtm:list-containers';
        gtm.listAccountContainers(accountId, opts)
            .then(containers => {
                console.log(containers);
            });
    });

program.version(info.version)
    .description(`
    Description:
    Validate GTM tags against possible integration problems.
    Currently supported:
        * document.write() check tag if supportDocumentWrite is enalbed
        * http:// Non-SSL links
    `)
    .option('-v, --verbose', 'Output tag template');

program
    .command('gtm:account <accountId>')
    .description('Validate all containers of a GTM account')
    .action((accountId, opts) => {
        cmd = 'gtm:account';
        gtm.listAccountContainers(accountId, opts)
            .then(containers => {
                console.log(`Found ${containers.length} container(s)`);
                containers.forEach(container => {
                    console.log(`\n${container.publicId}: ${container.name}\n`);
                    gtm.tags(accountId, container.containerId)
                        .then(tags => checkTags(tags, program.verbose));
                });
            });
    });

program
    .command('gtm:container <accountId> <containerId>')
    .description('Validate specific container of account')
    .action((accountId, opts) => {
        cmd = 'gtm:container';
        gtm.tags(accountId, opts)
            .then(tags => {
                checkTags(tags, program.verbose);
            });
    });

program
    .command('gtm:tag <accountId> <containerId> <tagId>')
    .description('Validate specific tag within container in an account')
    .action((accountId, containerId, tagId, opts) => {
        cmd = 'gtm:tag';
        gtm.tag(accountId, containerId, tagId, opts)
            .then(tag => {
                checkTags([tag], program.verbose);
            })
            .catch(err => console.warn(err));
    });

program
    .command('local <files>')
    .description('Validate local json file')
    .action((files) => {
        cmd = 'local';
        checkLocal(files, program.verbose);
    });

program.parse(process.argv);

if (!cmd) {
    program.outputHelp();
}