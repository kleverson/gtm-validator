'use strict';

var fileReader = require('./file-reader');
var tagDocWrite = require('./tag/document-write');

function checkLocal(files) {
    var containers = fileReader(files.split(','));

    for (var fileName of Object.keys(containers)) {
        console.log(`Container: ${fileName}`)

        var container = containers[fileName].containerVersion;

        // console.log(containers[fileName]);
        console.log(
            `containerId: ${container.container.containerId}
accountId: ${container.accountId}
publicId: ${container.container.publicId}
name: ${container.container.name}
`
            );
        // start checks
        tagDocWrite(container.tag, container);

    }
}

module.exports = checkLocal;