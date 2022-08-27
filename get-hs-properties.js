const fs = require('fs');
const { HUBSPOT_CLIENT } = require('./variables.js');


exports.getHSProperties = async function(objType) {
    const objectType = objType || 'contacts';
    
    try {
        const apiResponse = await HUBSPOT_CLIENT.crm.properties.coreApi.getAll(objectType);
        fs.writeFile('properties.json', JSON.stringify(apiResponse.results, null, 4), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
    } catch (e) {
        e.message === 'HTTP request failed' ? console.error(JSON.stringify(e.response, null, 2)) : console.error(e)
    }
}