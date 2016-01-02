'use strict';

module.exports = require('./lib/actions');

if (require.main === module) {
    require('./bin/gtm-validator');
}