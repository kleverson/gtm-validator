#!/usr/bin/env node

'use strict';

var program = require('commander');
var actions = require('../lib/actions');
var info = require('../package.json');

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
    .action(() => actions.listAccounts(getOpts));

program
    .command('gtm:list-containers <accountId>')
    .description('List available containers of an account')
    .action(accountId => actions.listAccountContainers(accountId, getOpts()));

program
    .command('gtm:account <accountId>')
    .description('Validate all containers of a GTM account')
    .action(accountId => actions.validateAccount(accountId, getOpts()));

program
    .command('gtm:container <accountId> <containerId>')
    .description('Validate specific container of account')
    .action((accountId, containerId) => actions.validateContainer(accountId, containerId, getOpts()));

program
    .command('gtm:tag <accountId> <containerId> <tagId>')
    .description('Validate specific tag within container in an account')
    .action((accountId, containerId, tagId) => actions.validateTag(accountId, containerId, tagId, getOpts()));

program
    .command('gtm:all')
    .description('Validate all available accounts and containers')
    .action(() => actions.validateAll(getOpts()));

program
    .command('local <files>')
    .description('Validate local json file')
    .action(files => actions.checkLocal(files, getOpts()));

program
    .command('*', null, {noHelp: true})
    .action(() => program.outputHelp());

var results = program.parse(process.argv);
if (results.args.length === 0) {
    program.outputHelp();
}

function getOpts() {
    return {
        verbose: program.verbose,
        summary: program.summary
    };
}