'use strict';

var fileReader = require('./file-reader');
var validateTags = require('./tag/validator');

function checkLocal(files, opts) {
    var containers = fileReader(files.split(','));

    for (var fileName of Object.keys(containers)) {
        console.log(`Container: ${fileName}`)

        var container = containers[fileName].containerVersion;

        console.log(
            `containerId: ${container.container.containerId}
accountId: ${container.accountId}
publicId: ${container.container.publicId}
name: ${container.container.name}
`
            );
        // start checks
        validateTags(container.tag, opts.verbose, opts.summary);
    }
}

module.exports = checkLocal;