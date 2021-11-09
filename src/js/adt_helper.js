const serverUrl = `http://localhost:3000/`;


async function query_twins(query) {

  const url = serverUrl + "query_twins";
  let response = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',     
    },
    body: JSON.stringify({query: query})
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  return await response.json();
}

function force_alert() {
  fetch(serverUrl + 'force_alert', { method: 'POST' });
}

function reset_alert() {
  fetch(serverUrl + 'reset_alert', { method: 'POST' });
}

async function update_transformation(dtid, matrix) {
  const url = serverUrl + "update_transformation";
  let response = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',     
    },
    body: JSON.stringify({
      dtid: dtid, 
      matrix: matrix
    })
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  return await response.json();
}

async function reset_transformation() {
  const url = serverUrl + "reset_transformation";
  let response = await fetch(url, {
    method: 'POST'
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  return await response.json();
}
