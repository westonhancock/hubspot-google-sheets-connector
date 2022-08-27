const fs = require('fs');
const { DEFUALT_RANGE, GOOGLE_AUTH, HUBSPOT_CLIENT,SHEET_ID } = require('./variables.js');
const { writeToSheet } = require('./write-to-sheet.js');

let sheetConfig = {
    auth: GOOGLE_AUTH,
    spreadsheetId: SHEET_ID,
    range: 'hubspot_properties!A:C',
    valueInputOption: 'USER_ENTERED',
    resource: {
        values: [],
    },
}

let headers = ['Name', 'Label', 'Description']

const parseProperties = function(data) {
    data.forEach(function (item) {
        let items = [headers];
        
        items.push([
            item['name'],
            item['label'],
            item['description']
        ]);
    });
    
    return items;
}

exports.getHSProperties = async function(objType) {
    const objectType = objType || 'contacts';
    
    try {
        const apiResponse = await HUBSPOT_CLIENT.crm.properties.coreApi.getAll(objectType);

        writeToSheet(parseProperties(apiResponse.results));
        fs.writeFile('properties.json', JSON.stringify(apiResponse.results, null, 4), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
    } catch (e) {
        e.message === 'HTTP request failed' ? console.error(JSON.stringify(e.response, null, 2)) : console.error(e)
    }
}