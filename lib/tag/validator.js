'use strict';

var colors = require('colors');
var _ = require('lodash');

/**
 * Check if document.write support is enabled for tags and number of non-ssl links
 *
 * @param {Array} tags
 * @param {Boolean|null} verbose tag info
 */
function validateTags(tags, verbose) {
    var total = 0;
    var warnings = 0;

    (tags || []).forEach(tag => {
        console.log();

        var out = _.padRight(colors.yellow(tag.name), 50, ' ') +
            colors.gray.underline(`https://tagmanager.google.com/#/container/accounts/${tag.accountId}/containers/${tag.containerId}/tags/${tag.tagId}`);

        out += "\n" + _.padRight(colors.gray('type:') + colors.blue(tag.type), 32, ' ');

        //
        // Check document.write snippets that don't enable `supportDocumentWrite`
        //
        var support = _.first(
            _.filter(tag.parameter, {key: 'supportDocumentWrite'})
        );
        var htmls = _.filter(tag.parameter, param => param.type.match(/template/i));
        var docWrites = _.filter(htmls, param => param.value.match(/document\.write/));

        out += colors.gray('DocWrite ') + '[' + colors.red(docWrites.length) + '] ';

        if (support && support.value === 'true') {
            out += colors.bold.green('enabled') + '  ';
        } else {
            if (docWrites.length > 0) {
                warnings++;
                out += colors.bold.bgRed.white('disabled') + ' ';
            } else {
                out += colors.gray('disabled ');
            }
        }

        //
        // http:// links
        //
        var nonHttpsLinks = _.filter(htmls, param => param.type.match(/http:\/\//));
        out += `  http links [${colors.blue(nonHttpsLinks.length)}] `;
        if (nonHttpsLinks.length > 0) {
            warnings++;
        }

        console.log(out);

        if (verbose) {
            console.log();
            console.log(
                _.map(
                    _.filter(tag.parameter, param => param.type.match(/template/)),
                    obj => obj.value
                ).join("\n")
            );

        }

        total++;
    });

    console.log(`
Total: ${colors.bold.white(total)}
Warnings: ${colors.bold.yellow(warnings)}
    `);

    return {
        total: total,
        warnings: warnings
    };
}

module.exports = validateTags;