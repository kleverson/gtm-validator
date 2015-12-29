'use strict';

var validateTags = require('./tag/validator');

function checkTags(tags, verbose) {
    validateTags(tags, verbose);
}

module.exports = checkTags;