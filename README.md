# communicator-adt-tutorial
Shows a basic connection between the [HOOPS Web Platform](https://www.techsoft3d.com/products/hoops/web-platform/) and Azure Digital Twin (ADT).

The web application polls the ADT graph every five seconds and displays metadata for each machine in a chocolate factory processing line. If the vibrational value of grinder goes above 300, the machine is highlighted. Alerts can be triggered and reset from the UI to simulate a real life senario.

## Requirements

Node.js

## Getting Started

### Setting up the ADT graph
* Follow https://docs.microsoft.com/en-us/learn/modules/build-azure-digital-twins-graph-for-chocolate-factory/
* Update fields in adt.config.js to reference your ADT instance

### Running the demo
npm install

node app.js

Open a browswer window and navigate to http://localhost:3000/

## Depolying the demo

Todo

## Architecture

* /src/index.html is based on hoop_web_viewer_sample.html from the HOOPS Web Platform with small edits to show demo functionality.
* /objects.json contains the mapping between ADT objects and the CAD models as well as the 3D world transforms to place the objects (since ADT does not contain this information)
* /js/adt_helper.js contains functions for querying data from the API found in app.js
* /app.js is an Node.js Express server that serves html and has a very basic API for relaying queries to and from the ADT graph. This server is used to prevent CORS errors. 

## Connecting to your own ADT Graph

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


