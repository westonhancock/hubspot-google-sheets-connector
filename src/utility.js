const { rangeStart } = require('./variables.js');
const fs = require('fs');

exports.getRange = function(name, arr) {
    let rangeEnd = String.fromCharCode(97 + arr.length);
    return name + '!' + rangeStart + ':' + rangeEnd;
};

exports.logData = function(data, id) {
    fs.appendFile('./logs/obj-id-index.log', data, (err) => {
        if (err) throw err;
        console.log('obj-id-index.log has been updated with the latest object ID: ' + id);
    });
}
