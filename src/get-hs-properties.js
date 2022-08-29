const fs = require('fs');
const { HUBSPOT_CLIENT, sheetConfig } = require('./variables.js');
const { handleSheet } = require('./g-sheet.js');
const {getRange} = require('./utility.js');

const parseProperties = function(data, headers) {
    let items = [headers];

    data.forEach(function (item) {
        items.push([
            item['name'],
            item['label'],
            item['description']
        ]);
    });
    
    return sheetConfig.resource.values = items;
}

exports.getHSProperties = async function(objType) {
    const objectType = objType || 'contacts';
    
    let headers = ['Name', 'Label', 'Description']

    try {
        const apiResponse = await HUBSPOT_CLIENT.crm.properties.coreApi.getAll(objectType);

        sheetConfig.range = getRange('hubspot_properties', headers);

        parseProperties(apiResponse.results, headers);

        handleSheet(sheetConfig);

        fs.writeFile('properties.json', JSON.stringify(apiResponse.results, null, 4), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    } catch (e) {
        e.message === 'HTTP request failed' ? console.error(JSON.stringify(e.response, null, 2)) : console.error(e)
    }
}