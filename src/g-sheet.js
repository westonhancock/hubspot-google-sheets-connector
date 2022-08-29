const { GOOGLE_AUTH } = require('./variables.js');
const { google } = require('googleapis');

const authentication  = async () => {
    const googleClient = await GOOGLE_AUTH.getClient();
    const sheets = google.sheets({ version: 'v4', auth: googleClient });
    return { sheets }
}

const readSheet = async function(config, sheets) {
    try{
        let res = await sheets.spreadsheets.values.get(config);

        return res;
    } catch (err) {
        console.log(err);
    }
}

const writeSheet = async function(config, sheets) {
    try {
        await sheets.spreadsheets.values.append(config);
        console.log(`Google sheet pupulated range ${config.range} successfully`);
    } catch (err) {
        console.log(err);
    }
}

exports.handleSheet = async function(config, bool) {
    const { sheets } = await authentication();
    
    let readWrite = bool ? readSheet : writeSheet;
    
    if (sheets) {
        return readWrite(config, sheets);
    }
}