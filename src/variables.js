require('dotenv').config();

const API_KEY = process.env.API_KEY;
const LIMIT = process.env.LIMIT || 10;
const OBJ_ID_START = process.env.OBJ_ID_START || '';
const PATH_TO_JSON_KEY = process.env.PATH_TO_JSON_KEY;
const SHEET_ID = process.env.SHEET_ID;

let sheetName = 'hubspot_contacts';
let rangeStart = 'A';
let rangeEnd = 'G';
const DEFUALT_RANGE = sheetName + '!' + rangeStart + ':' + rangeEnd;

if (!API_KEY) throw new Error('Missing API_KEY environment variable.');
if (!PATH_TO_JSON_KEY) throw new Error('Missing PATH_TO_JSON_KEY environment variable.');
if (!SHEET_ID) throw new Error('Missing SHEET_ID environment variable.');

const { google } = require('googleapis');
const hubspot = require('@hubspot/api-client');

const GOOGLE_AUTH = new google.auth.GoogleAuth({
    keyFile: PATH_TO_JSON_KEY,
    scopes: 'https://www.googleapis.com/auth/spreadsheets', 
});

exports.HUBSPOT_CLIENT = new hubspot.Client({
    'accessToken': API_KEY
});

exports.sheetConfig = {
    auth: GOOGLE_AUTH,
    spreadsheetId: SHEET_ID,
    range: DEFUALT_RANGE,
    valueInputOption: 'USER_ENTERED',
    resource: {
        values: [],
    },
};

exports.GOOGLE_AUTH = GOOGLE_AUTH;
exports.LIMIT = LIMIT;
exports.OBJ_ID_START = OBJ_ID_START;
exports.PATH_TO_JSON_KEY = PATH_TO_JSON_KEY;
exports.SHEET_ID = SHEET_ID;

exports.sheetName = sheetName;
exports.rangeStart = rangeStart;
exports.propsType = 'contacts';
exports.append = true;