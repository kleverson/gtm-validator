var fs = require('fs');
var readHostsFile = function *() {
  var inputFile = '/etc/hosts';
  var content;
  try {
    content = yield fs.readFile(inputFile, 'utf8', yield);
  } catch (e) {
    console.error('Error when opening file: ' + err.message);
  }
};
