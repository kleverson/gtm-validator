'use strict';

var program = require('commander');

var fileReader = require('./lib/file-reader');
var tagDocWrite = require('./lib/tag/document-write');

var files = null;

program.version('0.0.1')
    .option('-w, --document-write', 'Check document.write support [checks by default]')
    .arguments('<files>')
    .action(arg => {
        files = arg;
    })
    .parse(process.argv);

if (files === null) {
    console.error('No files given');
    program.outputHelp();
    process.exit()
}


var containers = fileReader(files.split(','));

for (var fileName of Object.keys(containers)) {
    console.log(`Container: ${fileName}`)

    var container = containers[fileName].containerVersion;

    // console.log(containers[fileName]);
    console.log(
`containerId: ${container.container.containerId}
publicId: ${container.container.publicId}
name: ${container.container.name}
`);
    // start checks
    tagDocWrite(container.tag, container);

}
// console.log(containers);