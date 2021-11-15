const fetch = require('node-fetch');
const msal = require('../server/msal');

const adtConfig = require('../adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

exports.query_twins = async (query) => {
  let token = await msal.getToken();

  const url = ADT_URL + 'query?api-version=2020-10-31';

  let response = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ "query": query })
  })
    .catch((err) => {
      // console.err(err);
      throw err;
    });

  var data = await response.json();
  // console.log(response);

  return data.value;
};