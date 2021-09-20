const msal = require('@azure/msal-node');
const config = require('../adt.config');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
  auth: {
    clientId: config.appId,
    authority: "https://login.microsoftonline.com/" + config.tenant,
    clientSecret: config.password,
  }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
  scopes: [ "https://digitaltwins.azure.net/.default" ],
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 */
async function getToken() {
  return (await cca.acquireTokenByClientCredential(tokenRequest)).accessToken;
}

module.exports = {
  tokenRequest: tokenRequest,
  getToken: getToken
};