#!/usr/bin/env node

'use strict';

var program = require('commander');

var checkLocal = require('./lib/check-local');
var checkTags = require('./lib/check-tags');
var gtm = require('./lib/gtm');
var info = require('./package.json');

program.version(info.version)
    .description(`
    Description:
    Validate GTM tags against possible integration problems.
    Currently supported:
        * document.write() check tag if supportDocumentWrite is enalbed
        * http:// Non-SSL links
    `)
    .option('-v, --verbose', 'Output tag template')
    .option('-s, --summary', 'Show only summary, without tags');

program
    .command('gtm:list-accounts')
    .description('List available accounts')
    .action(listAccounts);

program
    .command('gtm:list-containers <accountId>')
    .description('List available containers of an account')
    .action(listAccountContainers);

program
    .command('gtm:account <accountId>')
    .description('Validate all containers of a GTM account')
    .action(validateAccount);

program
    .command('gtm:container <accountId> <containerId>')
    .description('Validate specific container of account')
    .action(validateContainer);

program
    .command('gtm:tag <accountId> <containerId> <tagId>')
    .description('Validate specific tag within container in an account')
    .action(validateTag);

program
    .command('gtm:all')
    .description('Validate all available accounts and containers')
    .action(validateAll);

program
    .command('local <files>')
    .description('Validate local json file')
    .action(checkLocal);

program
    .command('*')
    .action(() => program.outputHelp());

var results = program.parse(process.argv);
if (results.args.length === 0) {
    program.outputHelp();
}


function listAccountContainers(accountId) {
    return gtm.listAccountContainers(accountId)
        .then(containers => {
            console.log(containers);
        });
}

function listAccounts() {
    return gtm.listAccounts()
        .then(accounts => {
            console.log(accounts);
        });
}

function validateAccount(accountId) {
    return gtm.accountContainers(accountId)
        .then(containers => {
            containers.forEach(container => {
                gtm.containerTags(accountId, container.containerId)
                    .then(tags => {
                        console.log(`\nAccountId #${accountId}\t${container.publicId}: ${container.name}\n`);
                        checkTags(tags, program.verbose, program.summary);
                    });
            });
        });
}

function validateAll() {
    return gtm.accounts()
        .then(accounts => {
            (accounts || []).forEach(acc => {
                validateAccount(acc.accountId);
            });
        });
}

function validateTag(accountId, containerId, tagId) {
    return gtm.tag(accountId, containerId, tagId)
        .then(tag => {
            checkTags([tag], program.verbose, program.summary);
        })
        .catch(err => console.warn(err));
}

function validateContainer(accountId, containerId) {
    return gtm.containerTags(accountId, containerId)
        .then(tags => {
            checkTags(tags, program.verbose, program.summary);
        });
}