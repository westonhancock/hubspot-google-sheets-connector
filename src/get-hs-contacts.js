const { append, HUBSPOT_CLIENT, LIMIT, OBJ_ID_START, sheetConfig, sheetName } = require('./variables.js');
const { getRange, logData } = require('./utility.js');
const { handleSheet } = require('./g-sheet.js');

//if a starting location is set, use it
let objIdIndex = OBJ_ID_START || undefined;
let objIdLog = objIdIndex ? objIdIndex + '\n' : '';

let headers = [];
let properties= [];
let next;
let items = append ? [] : [headers];

let hsConfig = {
    objId: objIdIndex,
    archived: false,
    associations: undefined,
    limit: LIMIT,
    properties: properties,
    propertiesWithHistory: undefined,
};

const end = function() {
    handleSheet(sheetConfig);
    logData(objIdLog, objIdIndex);
}

const increaseIndex = function(next) {
    objIdIndex = next.after;
    hsConfig.objId = objIdIndex;
    objIdLog += objIdIndex + '\n'
};

const getAllContacts = async function() {
    if (!properties.length) {
        await getSelectedProperties().then((data) => {
            sheetConfig.range = getRange(sheetName, data);
        });
    }

    getHSContacts().then((next) => {
        if (next && next.after != objIdIndex) {
            increaseIndex(next);
            getAllContacts();
        }
        else end();
    })
};

const getHSContacts = async function() {
    try {
        const apiResponse = await HUBSPOT_CLIENT.crm.contacts.basicApi.getPage(hsConfig.limit, hsConfig.objId, hsConfig.properties, hsConfig.propertiesWithHistory, hsConfig.associations, hsConfig.archived);

        let results = apiResponse.results;
        next = apiResponse.paging ? apiResponse.paging.next : next;
        
        parseData(results);
        
        return next;
    } catch (err) {
        err.message === 'HTTP request failed' ? console.error(JSON.stringify(err.response, null, 2)) : console.error(err)
    }
    return null;
}

const getSelectedProperties = async function() {
    let config = {
        auth: sheetConfig.auth,
        spreadsheetId: sheetConfig.spreadsheetId,
        range: 'hubspot_properties!A2:D400',
        valueRenderOption: 'FORMATTED_VALUE',
        majorDimension: 'ROWS'
    };

    await handleSheet(config, true).then(res => {
        res.data.values.forEach(prop => {
            if (prop.pop() == 'TRUE') {
                headers.push(prop[1]);
                properties.push(prop[0]);
            }
        });
    });

    return headers;
}

const parseData = function(data) {
    data.forEach(function (item) {
        let itemProperties = item['properties'];

        if (itemProperties.leadsource) {
            items.push(Object.values(itemProperties));
        }
    });
    
    return sheetConfig.resource.values = items;
};

exports.getAllContacts = getAllContacts;