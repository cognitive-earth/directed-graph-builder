
module.exports = {
    info: {
        title: "connectivity", // Title (required)
        description: "build a connectivity model based on a set of undirected and directed links",
        version: "1.0.0" // Version (required)
    },
    swagger: "2.0",
    schemes: ["https"],
    host: "unset.service.host",
    "x-google-allow": "all",
    "x-google-endpoints": [
        {
            name: "unset.service.host",
            target: "111.111.111.111"
        }
    ],
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ],
    "security": [],
    "securityDefinitions": {
        "api_key": {
            "type": "apiKey",
            "name": "key",
            "in": "query"
        },
        "google_jwt": {
            "authorizationUrl": "",
            "flow": "implicit",
            "type": "oauth2",
            "x-google-issuer": "jwt-client.endpoints.sample.google.com",
            "x-google-jwks_uri": "https://www.googleapis.com/service_accounts/v1/jwk/YOUR-SERVICE-ACCOUNT-EMAIL",
            "x-google-audiences": "echo.endpoints.sample.google.com"
        },
        "google_id_token": {
            "authorizationUrl": "",
            "flow": "implicit",
            "type": "oauth2",
            "x-google-issuer": "https://accounts.google.com",
            "x-google-jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
            "x-google-audiences": "YOUR-CLIENT-ID"
        }
    }

};