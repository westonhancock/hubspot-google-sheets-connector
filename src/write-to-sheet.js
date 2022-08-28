const { GOOGLE_AUTH } = require('./variables.js');
const { google } = require('googleapis');

const authentication  = async () => {
    const googleClient = await GOOGLE_AUTH.getClient();
    const sheets = google.sheets({ version: 'v4', auth: googleClient });
    return { sheets }
}

exports.writeToSheet = async function(config) {
    const { sheets } = await authentication();

    if (sheets) {
        try {
            await sheets.spreadsheets.values.append(config);
            console.log(`Google sheet pupulated range ${config.range} successfully`);
        } catch (err) {
            console.log(err)
        }
    }
}