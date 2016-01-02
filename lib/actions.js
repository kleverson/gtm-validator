'use strict';
var gtm = require('./gtm');
var checkLocal = require('./check-local');
var checkTags = require('./check-tags');

/**
 * @param  {Number} accountId
 */
function listAccountContainers(accountId, opts) {
    return gtm.accountContainers(accountId)
        .then(containers => {
            console.log(containers);
        });
}

function listAccounts(opts) {
    return gtm.accounts()
        .then(accounts => {
            console.log(accounts);
        });
}

function validateAccount(accountId, opts) {
    return gtm.accountContainers(accountId)
        .then(containers => {
            containers.forEach(container => {
                gtm.containerTags(accountId, container.containerId)
                    .then(tags => {
                        console.log(`\nAccountId #${accountId}\t${container.publicId}: ${container.name}\n`);
                        checkTags(tags, opts.verbose, opts.summary);
                    })
                    .catch(err => console.warn(err));
            });
        });
}

function validateAll(opts) {
    return gtm.accounts()
        .then(accounts => {
            (accounts || []).forEach(acc => {
                validateAccount(acc.accountId, opts);
            });
        });
}

function validateTag(accountId, containerId, tagId, opts) {
    return gtm.tag(accountId, containerId, tagId)
        .then(tag => {
            checkTags([tag], opts.verbose, opts.summary);
        })
        .catch(err => console.warn(err));
}

function validateContainer(accountId, containerId, opts) {
    return gtm.containerTags(accountId, containerId)
        .then(tags => {
            checkTags(tags, opts.verbose, opts.summary);
        });
}

module.exports.validateAll = validateAll;
module.exports.validateAccount = validateAccount;
module.exports.validateContainer = validateContainer;
module.exports.validateTag = validateTag;
module.exports.listAccounts = listAccounts;
module.exports.listAccountContainers = listAccountContainers;
module.exports.checkLocal = checkLocal;