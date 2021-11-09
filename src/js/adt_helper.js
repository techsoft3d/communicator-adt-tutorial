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



async function get_allTwins() {

  const url = serverUrl + "allTwins";
  let response = await fetch(url)
  .catch((error) => {
    console.error('Error:', error);
  });
  return await response.json();
}


function force_alert() {
  console.log("fa");

  fetch(serverUrl + 'force_alert', { method: 'POST' });
}

function reset_alert() {
  console.log("ra");
  fetch(serverUrl + 'reset_alert', { method: 'POST' });
}
