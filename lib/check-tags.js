'use strict';

var validateTags = require('./tag/validator');

function checkTags(tags, verbose, summary) {
    validateTags(tags, verbose, summary);
}

module.exports = checkTags;