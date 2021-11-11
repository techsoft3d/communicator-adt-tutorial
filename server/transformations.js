const fetch = require('node-fetch');
const msal = require('./msal');
const adtConfig = require('../adt.config');
const twins_init = require('../twins-init');

const ADT_URL = 'https://' + adtConfig.hostname + '/';

async function initialise_twins() {
  let token = await msal.getToken();

  for await (let [dtid, data] of Object.entries(twins_init)) {
    const url = ADT_URL + 'digitaltwins/' + dtid + '?api-version=2020-10-31';
    await fetch(url, {
      method: 'PATCH', headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify([
        {
          op: "add",
          path: "/Transformation",
          value: data.Transformation
        },
        {
          op: "add",
          path: "/SCSFile",
          value: data.SCSFile
        },
      ])
    });
  }
}

async function reset_transformations() {
  let token = await msal.getToken();

  for await (let [dtid, data] of Object.entries(twins_init)) {
    const url = ADT_URL + 'digitaltwins/' + dtid + '?api-version=2020-10-31';
    await fetch(url, {
      method: 'PATCH', headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify([
        {
          op: "replace",
          path: "/Transformation",
          value: data.Transformation
        },
      ])
    });
  }
}

async function update_transformation(dtid, matrix) {
  let token = await msal.getToken();

  const url = ADT_URL + 'digitaltwins/' + dtid + '?api-version=2020-10-31';
  await fetch(url, {
    method: 'PATCH', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify([
      {
        op: "replace",
        path: "/Transformation",
        value: matrix
      },
    ])
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = {
  initialise_twins,
  reset_transformations,
  update_transformation
};