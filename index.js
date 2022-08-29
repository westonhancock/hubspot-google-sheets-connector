const { propsType } = require('./src/variables.js');
const { getAllContacts, getSelectedProperties } = require('./src/get-hs-contacts.js');
const { getHSProperties } = require('./src/get-hs-properties.js');

const main = function() {
    // getHSProperties(propsType);
    // getAllContacts();
    getSelectedProperties();
};

main();