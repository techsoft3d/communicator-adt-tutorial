# Communicator ADT Tutorial
Shows a basic connection between the [HOOPS Web Platform](https://www.techsoft3d.com/products/hoops/web-platform/) and [Azure Digital Twin](https://azure.microsoft.com/en-us/services/digital-twins/) (ADT).

The web application polls the ADT graph every five seconds and displays metadata for each machine in a chocolate factory processing line. If the vibrational value of grinder goes above 300, the machine is highlighted. Alerts can be triggered and reset from the UI to simulate a real life senario.

Our **live demo** is running at: https://adt-communicator.azurewebsites.net 

## Requirements

Node.js 17.0.1

## Getting Started

### Setting up the ADT graph
* Follow this [Microsoft tutorial](https://docs.microsoft.com/en-us/learn/modules/build-azure-digital-twins-graph-for-chocolate-factory/) to set up your digital twin instance.
* The digital twin models we used can be found in the */digital_twin_models* folder. We made some adjustments to the DTDL files. Compared to the Microsoft tutorial, there are more production steps and each production step has two additional properties: *SCSFile* and *Tranformation*. The default values we use for this demo can be found in */twins-init.js*. They will be automatically uploaded when you first-time launch this web app.
  
  ![ADT Node Tree Graph](/readme_pictures/ADT_graph.png)

* In order to use REST API with your digital twin, please register your app following this [tutorial](https://docs.microsoft.com/en-us/learn/modules/ingest-data-into-azure-digital-twins/6-use-rest-apis). Please make sure you have the *tenant_id*, *client_id/app_id*, and *client_secret/password*.
* Update fields in */adt.config.js* to reference your ADT instance.

### Running the demo
`npm install`

`node app.js`

Open a browswer window and navigate to http://localhost:3000/

## Depolying the demo

Before deploying this app, please make sure to change the *serverUrl* in */src/js/adt_helper.js* to match your deployment url.

## Architecture

* /src/index.html is based on hoop_web_viewer_sample.html from the HOOPS Web Platform with small edits to show demo functionality.
* /objects.json contains the mapping between ADT objects and the CAD models as well as the 3D world transforms to place the objects (since ADT does not contain this information)
* /js/adt_helper.js contains functions for querying data from the API found in app.js
* /app.js is an Node.js Express server that serves html and has a very basic API for relaying queries to and from the ADT graph. This server is used to prevent CORS errors. 

## Todo
1. Remove dependance on app.js to relay requests to ADT api but instead use a proxy severvice like ADT_Explorer does
2. Remove 5 second polling and replace with real time SingalR updates
3. Add a UI to represent the ADT graph and enable bidirectional selection between 3d and the graph
4. Instructions for deploying on a azure server
5. Home button needs to zoom to extents of all models loaded, not just the first one

## Data Credits
[Murdianto](https://grabcad.com/murdianto-1)
[Hashim Khan](https://grabcad.com/hashim.khan-6)
[quy49ctu](https://grabcad.com/quy49ctu-1)
[Erkan](https://grabcad.com/erkan--4)
[nowa](https://grabcad.com/nowa-1)
