let currentSelection = null;
let triggerButton = null;
// {dtid: {nodeId, markup}}
let twins = {};

async function createMarkup(twinData) {
    let twin = twins[twinData["$dtId"]];
    let box = await hwv.model.getNodesBounding([twin.nodeId]);
    let markup = new CustomMarkupItem(hwv, -5, "",
        new Communicator.Point3((box.max.x - box.min.x) / 2 + box.min.x, 2500, 0),
        new Communicator.Point3(0, 1, 0),
        0);
    let uid = hwv.markupManager.registerMarkup(markup);
    hwv.markupManager.refreshMarkup();
    twin.markup = markup;
    updateMarkup(twinData);
}

async function loadModel() {

    let resultData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(T.SCSFile) AND IS_DEFINED(Transformation)");

    resultData.forEach(async (twinData, index) => {
        console.log(twinData);
        twins[twinData["$dtId"]] = {};
        let scsFile = './scs_models/' + twinData["SCSFile"] + ".scs";
        let array = [];
        for (let i = 1; i <= 16; i += 1) {
            array.push(twinData["Transformation"][i]);
        }
        let transformationMatrix = Communicator.Matrix.createFromArray(array);

        let nodeIds = await hwv.model.loadSubtreeFromScsFile(hwv.model.getRootNode(), scsFile, transformationMatrix);
        hwv.model.setNodeMatrix(nodeIds[0], transformationMatrix);
        let twin = twins[twinData["$dtId"]];
        twin.nodeId = nodeIds[0];
        createMarkup(twinData);
        // All model loaded, resolve the promise
        if (index == resultData.length - 1) {
            return;
        }
    });
}

async function poll() {
    let adtData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(T.SCSFile) AND IS_DEFINED(Transformation)");
    adtData.forEach(twin => {
        updateMarkup(twin);
    });
}

function updateMarkup(twinData) {
  let twin = twins[twinData["$dtId"]];
  let text = twinData["$dtId"] + "\n";
  Object.keys(twinData).forEach(key => {
    if (key != 'StepId' && key[0] != '$' && key != "SCSFile" && key != "Transformation") {
      if (typeof (twinData[key]) === "number") {
        // Round the number to 2 decimal places
        let number = Number(twinData[key]);
        number = Math.round((number + Number.EPSILON) * 100) / 100;
        text = text + key + ": " + number + "\n";
      } else {
        text = text + key + ": " + twinData[key] + "\n";
      }
    }
    if (key.includes("Alert")) {
      if (twinData[key] == true) {
        hwv.model.setNodesHighlighted([twin.nodeId], true);
        triggerButton.textContent = "Reset";
      } else {
        hwv.model.setNodesHighlighted([twin.nodeId], false);
        triggerButton.textContent = "Trigger";
      }
    }
  });

  const markup = twin.markup;
  if (markup != null && markup._textBox != null) {
    markup._textBox.setTextString(text);
    hwv.markupManager.refreshMarkup();
  }
}

function sceneReadyFunc() {
  triggerButton = document.getElementById('trigger-button');
  loadModel();
  // set selection filter to select only the whole models
  hwv.selectionManager.setSelectionFilter(function (nodeId, model) {
    // check if node is a child of twin.nodeId
    let currentNodeId = nodeId;
    let parentNodeId = model.getNodeParent(currentNodeId);
    while (currentNodeId != null) {
      if (parentNodeId == model.getAbsoluteRootNode()) {
        for (let i = 0; i < Object.values(twins).length; i++) {
          if (currentNodeId == Object.values(twins)[i].nodeId) {
            return currentNodeId;
          }
        }
      }
      currentNodeId = parentNodeId;
      parentNodeId = model.getNodeParent(currentNodeId);
    }
    return nodeId;
  });
  setInterval(function () {
    poll();
  }, 5000);

  hwv.view.setCamera(Communicator.Camera.create(new Communicator.Point3(4102, 2692, 11160),
    new Communicator.Point3(6755, 867, 3970),
    new Communicator.Point3(0, 1, 0),
    7877,
    7877,
    0,
    0.01
  )
  );

  window.onresize = function (event) {
    // jQuery resizable triggers onresize, check that the call is not coming from a DOM element object
    if (typeof event.target.getAttribute !== "function" && hwv != null) {
      hwv.resizeCanvas();
    }
  };
}

function selectionArrayFunc(events, removed) {
  const handleOperator = hwv.operatorManager.getOperator(Communicator.OperatorId.Handle);
  if (events[0] != undefined) {
    handleOperator.addHandles([events[0]._selection._nodeId]);
  } else {
    handleOperator.removeHandles();
  }
}

function onToggleTrigger() {
  if (triggerButton.textContent == "Trigger") {
    force_alert();
  } else {
    reset_alert();
  }
  triggerButton.disabled = true;
  setTimeout(() => {
    triggerButton.disabled = false;
  }, 5000);
}




function setupLayout() {


  
  var config = {
      settings: {
          showPopoutIcon: false,
          showMaximiseIcon: true,
          showCloseIcon: false
      },
      content: [
          {
              type: 'row',
              content: [
                  {
                  
                          type: 'component',
                          componentName: 'Viewer',
                          isClosable: false,
                          width: 60,
                          componentState: { label: 'A' }
                      
                  },
                  {
                      type: 'column',
                      width: 40,
                      height: 35,
                      content: [
                          {
                              type: 'component',
                              componentName: 'ADT Graph',
                              isClosable: false,
                              height: 70,
                              componentState: { label: 'C' }
                          },
                          {
                              type: 'component',
                              componentName: 'Machine Info',
                              isClosable: false,
                              height: 30,
                              componentState: { label: 'C' }
                          }
                      ]
                  },
              ],
          }]
  };




    let myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Viewer', function (container, componentState) {
      $(container.getElement()).append($("#content"));
    });

    myLayout.registerComponent('ADT Graph', function (container, componentState) {
      $(container.getElement()).append($("#adtgraphdiv"));
    });

    myLayout.registerComponent('Machine Info', function (container, componentState) {
      $(container.getElement()).append($("#machineinfodiv"));
    });

    myLayout.on('stateChanged', function () {
      if (hwv != undefined) {
        hwv.resizeCanvas();
      }
    });
    myLayout.init();
  }