'use strict';

var colors = require('colors');
var _ = require('lodash');

/**
 * Check if document.write support is enabled for tags
 *
 * @param {Array} tags
 */
function checkDocumentWrite(tags, container) {
    (tags || []).forEach(tag => {
        var out = _.padRight(tag.name.substr(0, 40), 45, ' ');
        var tagUrl = `https://tagmanager.google.com/#/container/accounts/${container.accountId}/containers/${container.containerId}/tags/${tag.tagId}`;

        var support = _.first(
            _.filter(tag.parameter, {key: 'supportDocumentWrite'})
        );
        var docWrites = _.filter(tag.parameter, param => {
            return param.type === 'TEMPLATE' && param.value.match(/document\.write/);
        });

        out += _.padRight('doc.write count: ' + colors.blue(docWrites.length), 30, ' ');

        if (support && support.value === 'true') {
            out += colors.green('DocWrite ') + colors.bold.green('enabled') + '  ';
            out += colors.gray(tagUrl);
        } else {
            if (docWrites.length > 0) {
                out += colors.red('DocWrite ') + colors.bold.red('disabled') + ' ';
                out += colors.red(tagUrl);
            } else {
                out += 'DocWrite disabled ';
                out += colors.gray(tagUrl);
            }
        }

        console.log(out);
    });
}

module.exports = checkDocumentWrite;