const { append, HUBSPOT_CLIENT, LIMIT, OBJ_ID_START, sheetConfig } = require('./variables.js');
const { getRange, logData } = require('./utility.js');
const { handleSheet } = require('./g-sheet.js');

//if a starting location is set, use it
let objIdIndex = OBJ_ID_START || undefined;
let objIdLog = objIdIndex ? objIdIndex + '\n' : '';

//to-do: make this dynamic. read from sheet?
let trackedProperties = [
    {name:'company', label:'Company'},
    {name:'contact_stage', label:'Contact Stage'},
    {name:'createdate', label:'Create Date'},
    {name:'email', label:'Email'},
    {name:'firstname', label:'First Name'},
    {name:'hs_analytics_first_referrer', label:'First Referrer'},
    {name:'hs_analytics_first_touch_converting_campaign', label:'First Touch Converting Campaign'},
    {name:'hs_analytics_first_url', label:'First Page Seen'},
    {name:'hs_analytics_last_touch_converting_campaign', label:'Last Touch Converting Campaign'},
    {name:'hs_analytics_last_url', label:'Last Page Seen'},
    {name:'hs_analytics_num_page_views', label:'Num Pageviews'},
    {name:'hs_analytics_source', label:'Original Source'},
    {name:'hs_analytics_source_data_1', label:'Original Source Drilldown'},
    {name:'hs_analytics_source_data_2', label:'Original Source Drilldown 2'},
    {name:'hs_object_id', label:'Object ID'},
    {name:'jobtitle', label:'Job Title'},
    {name:'lastmodifieddate', label:'Last Modified Date'},
    {name:'lastname', label:'Last Name'},
    {name:'leadsource', label:'Lead Source'},
    {name:'lifecyclestage', label:'Lifecycle Stage',},
    {name:'website', label:'Website'},
];

let headers = [];
let properties= [];

trackedProperties.forEach(({name, label}) => {
    headers.push(label);
    properties.push(name);
});

let next;
let items = append ? [] : [headers];
sheetConfig.range = getRange('testing', headers);
//sheetConfig.range = getRange('hubspot_contacts', headers);

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

    // fs.writeFile('./logs/obj-id-lts.log', objIdIndex, (err) => {
    //     if (err) throw err;
    //     console.log('obj-id-lts.log updated with the latest Object ID: ' + objIdIndex);
    // });

    objIdLog += objIdIndex + '\n'
};

const getAllContacts = async function() {
    getSelectedProperties().then(getHSContacts().then((next) => {
        if (next && next.after != objIdIndex) {
            increaseIndex(next);
            getAllContacts();
        }
        else end();
    }))
};

const getHSContacts = async function() {
    try {
        const apiResponse = await HUBSPOT_CLIENT.crm.contacts.basicApi.getPage(hsConfig.limit, hsConfig.objId, hsConfig.properties, hsConfig.propertiesWithHistory, hsConfig.associations, hsConfig.archived);
        
        let results = apiResponse.results;
        next = apiResponse.paging ? apiResponse.paging.next : next;
        
        parseData(results, headers);
        
        return next;
    } catch (err) {
        err.message === 'HTTP request failed' ? console.error(JSON.stringify(err.response, null, 2)) : console.error(err)
    }
    return null;
}

const getSelectedProperties = function() {
    let config = {
        auth: sheetConfig.auth,
        spreadsheetId: sheetConfig.spreadsheetId,
        range: 'hubspot_properties!A2:D400',
        valueRenderOption: 'FORMATTED_VALUE',
        majorDimension: 'ROWS'
    };

    handleSheet(config, true).then(res => {
        let propsAry = [];

        res.data.values.forEach(prop => {
            if (prop.pop() == 'TRUE') {
                propsAry.push({
                    name: prop[0],
                    label: prop[1]
                });
            }
        });
    });
}

const parseData = function(data, headers) {
    data.forEach(function (item) {
        let itemProperties = item['properties'];

        if (itemProperties.leadsource) {
            items.push(Object.values(itemProperties));
        }
    });
    
    return sheetConfig.resource.values = items;
};

exports.getAllContacts = getAllContacts;
exports.getSelectedProperties = getSelectedProperties;