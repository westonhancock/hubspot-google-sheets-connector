const vars = require('./src/variables.js');
const { writeToSheet } = require('./src/write-to-sheet.js');
const fs = require('fs');

let objIdIndex = vars.OBJ_ID_START || undefined;
let objIdLog = objIdIndex ? objIdIndex + '\n' : '';

let trackedProperties = [
    {name:'company', label:'Company'},
    {name:'contact_stage', label:'Contact Stage'},
    {name:'createdate', label:'Create Date'},
    {name:'email', label:'Email'},
    {name:'firstname', label:'First Name'},
    {name:'jobtitle', label:'Job Title'},
    {name:'hs_analytics_first_referrer', label:'First Referrer'},
    {name:'hs_analytics_first_touch_converting_campaign', label:'First Touch Converting Campaign'},
    {name:'hs_analytics_first_url', label:'First Page Seen'},
    {name:'hs_analytics_last_touch_converting_campaign', label:'Last Touch Converting Campaign'},
    {name:'hs_analytics_last_url', label:'Last Page Seen'},
    {name:'hs_analytics_num_page_views', label:'Num Pageviews'},
    {name:'hs_analytics_source', label:'Original Source'},
    {name:'hs_analytics_source_data_1', label:'Original Source Drilldown'},
    {name:'hs_analytics_source_data_2', label:'Original Source Drilldown 2'},
    {name:'hs_sa_first_engagement_date', label:'First Engagement Date'},
    {name:'hs_sa_first_engagement_descr', label:'First Engagement Description'},
    {name:'lastname', label:'Last Name'},
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
let items = next ? [] : [headers];

let sheetConfig = {
    auth: vars.GOOGLE_AUTH,
    spreadsheetId: vars.SHEET_ID,
    range: vars.DEFUALT_RANGE,
    valueInputOption: 'USER_ENTERED',
    resource: {
        values: items,
    },
}

let hubspotConfig = {
    objId: objIdIndex,
    archived: false,
    associations: undefined,
    limit: vars.LIMIT,
    properties: properties,
    propertiesWithHistory: undefined,
};

console.log(sheetConfig);
console.log(hubspotConfig);

const main = function() {
    setRange();

    getAllContacts(end);
};

const end = function() {
    writeToSheet(sheetConfig);
    logIndex();
}

const increaseIndex = function(next) {
    objIdIndex = next.after;

    hubspotConfig.objId = objIdIndex;

    fs.writeFile('obj-id-lts.log', objIdIndex, (err) => {
        if (err) throw err;
        console.log('obj-id-lts.log updated with the latest Object ID: ' + objIdIndex);
    });

    objIdLog += objIdIndex + '\n'
}


const getAllContacts = async function(callback) {
    getContacts().then((next) => {
        if (next && next.after != objIdIndex) {
            increaseIndex(next);
            getAllContacts(callback);
        }
        else callback();
    })
};

const getContacts = async function() {
    try {
        const apiResponse = await vars.HUBSPOT_CLIENT.crm.contacts.basicApi.getPage(hubspotConfig.limit, hubspotConfig.objId, hubspotConfig.properties, hubspotConfig.propertiesWithHistory, hubspotConfig.associations, hubspotConfig.archived);
        
        let results = apiResponse.results;
        next = apiResponse.paging ? apiResponse.paging.next : next;
        
        parseData(results);
        
        return next;
    } catch (err) {
        err.message === 'HTTP request failed' ? console.error(JSON.stringify(err.response, null, 2)) : console.error(err)
    }
    return null;
}

const logIndex = function() {
    fs.appendFile('obj-id-index.log', objIdLog, (err) => {
        if (err) throw err;
        console.log('obj-id-index.log has been updated with the latest object ID: ' + objIdIndex);
    });
}

const parseData = function(data) {
    data.forEach(function (item) {
        let itemProperties = item['properties'];

        if (itemProperties.hs_analytics_source != 'OFFLINE') {
            items.push(Object.values(itemProperties));
        }
    });
    
    return sheetConfig.resource.values = items;
}

const setRange = function() {
    let rangeEnd = String.fromCharCode(97 + headers.length);
    sheetConfig.range = 'hubspot_contacts!A:' + rangeEnd;
}

main();