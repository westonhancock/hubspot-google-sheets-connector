# Hubspot/Google Sheets Connector
A node app to easily pull Hubspot data into Google Sheets

## Setup
1. Create a HubSpot API v3 API Key
2. Create a Google Sheets Service API Credential
3. Configure a new Google Sheet
4. Create a .env file
5. Run npm install
6. Run node .

API_KEY=[hubspot-api-v3-api-key]
LIMIT=[defaults to 10 - max is 100]
OBJ_ID_START=[object id you want to start with]
PATH_TO_JSON_KEY=[relative/path/to/json/key/file]
SHEET_ID=[your google sheet id]

## To Do
Create start script
Create pull properties script
enable append or write configuration flag

### script commands
node get --props
node get --companies
node get --contacts

### Flags
--append //appends records instead or writing over existing records
-s [objectId] //get contacts starting with [object id]
