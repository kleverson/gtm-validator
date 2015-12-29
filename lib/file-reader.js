'use strict';

var fs = require('fs');


/**
 * @param {Array} files
 * @return {Object} parsed json files
 */
function containerReader(files) {
    var containers = {};

    (files || []).forEach(file => {
        if (!file.match(/\*/)) {
            containers[file] = readOne(file);
        } else {
            console.warn('Unsupported glob', file);
        }
    });

    return containers;
}

function readOne(file) {
    return JSON.parse(
        fs.readFileSync(file, {
            encoding: 'UTF-8'
        })
    );
}

module.exports = containerReader;
