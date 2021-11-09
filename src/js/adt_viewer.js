let currentSelection = null;
let triggerButton = null;
// {dtid: {nodeId, markup}}
// [{dtid, nodeId, markup}]
let twins = {};

function getDTID(nodeId) {
  for (let i = 0; i < Object.values(twins).length; i++) {
    if (nodeId == Object.values(twins)[i].nodeId) {
      return Object.keys(twins)[i];
    }
  }
}

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
  updateMarkupText(twinData);
}

function updateMarkupText(twinData) {
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
  });

  const markup = twin.markup;
  if (markup != null && markup._textBox != null) {
    markup._textBox.setTextString(text);
    hwv.markupManager.refreshMarkup();
  }
}

async function updateMarkupPosition(dtid) {
  const twin = twins[dtid];
  const markup = twin.markup;
  if (markup != null) {
    let box = await hwv.model.getNodesBounding([twin.nodeId]);
    markup.setPosition(new Communicator.Point3(
      (box.max.x - box.min.x) / 2 + box.min.x, 
      box.max.y + 2500, 
      (box.max.z - box.min.z) / 2 + box.min.z));
    hwv.markupManager.refreshMarkup();
  }
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
  adtData.forEach(twinData => {
    updateMarkupText(twinData);
    twin = twins[twinData["$dtId"]];
    Object.keys(twinData).filter(key => key.includes("Alert")).forEach(key => {
      if (twinData[key] == true) {
        hwv.model.setNodesHighlighted([twin.nodeId], true);
        triggerButton.textContent = "Reset";
      } else {
        hwv.model.setNodesHighlighted([twin.nodeId], false);
        triggerButton.textContent = "Trigger";
      }
    });
  });
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

async function onResetTransformation() {
  await reset_transformation();

  // Update model transformations
  let resultData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(T.SCSFile) AND IS_DEFINED(Transformation)");

  resultData.forEach(async (twinData, index) => {
    console.log(twinData);
    // twins[twinData["$dtId"]] = {};
    let array = [];
    for (let i = 1; i <= 16; i += 1) {
      array.push(twinData["Transformation"][i]);
    }

    let transformationMatrix = Communicator.Matrix.createFromArray(array);
    hwv.model.setNodeMatrix(twins[twinData["$dtId"]["nodeId"]], transformationMatrix);
    twins[twinData["$dtId"]["markup"]]
  });
}

function onLocationUpdate(eventType, nodeIds, initialMatrices, newMatrices) {
  //handle event finished, model has been moved to a new position
  console.log(newMatrices[0].toJson());
  let dtid = getDTID(nodeIds[0]);
  updateMarkupPosition(dtid);
}
