'use strict';

var checkDocumentWrite = require('./tag/document-write');

function checkTags(tags) {
    checkDocumentWrite(tags);
}

module.exports = checkTags;