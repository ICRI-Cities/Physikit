//var activeLocation = getActiveLocation();
var lastConnElementID;

var instance;
var triggerInit = true;
var triggerDestroy = true;

// this is the paint style for the connecting lines..
var connectorPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#61B7CF",
        "dashstyle": "none"
    },
// .. and this is the hover style.
    connectorHoverStyle = {
        lineWidth: 4,
        strokeStyle: "#216477",
        outlineWidth: 2,
        outlineColor: "white"
    },

//and this is the hidden connector style
    hiddenPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#61B7CF",
        "dashstyle": "2 4"
    },

    endpointHoverStyle = {
        fillStyle: "#216477",
        strokeStyle: "#216477"
    },
// the definition of source endpoints (the small blue ones)
    sourceEndpoint = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: "#7AB02C",
            fillStyle: "transparent",
            radius: 7,
            lineWidth: 3
        },
        isSource: true,
        connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
        connectorStyle: connectorPaintStyle,
        hoverPaintStyle: endpointHoverStyle,
        maxConnection: 0,
        connectorHoverStyle: connectorHoverStyle,
        dragOptions: {}
    },
// the definition of target endpoints (will appear when the user drags a connection)
    targetEndpoint = {
        endpoint: "Dot",
        paintStyle: { fillStyle: "#7AB02C", radius: 11 },
        hoverPaintStyle: endpointHoverStyle,
        maxConnections: 1,
        dropOptions: { hoverClass: "hover", activeClass: "activated" },
        isTarget: true
    };

var init = function (connInfo) {
    //add location name to connection (e.g. "family1")
    var connection = connInfo.connection;
    var activeLocation = getActiveLocation();
    connection.location = activeLocation;

    //get details of sensor and cube for dialog
    var sensor = connInfo.sourceId;
    var box = connInfo.targetId;

    //store ID of last connected box for possible removal
    //due to user cancellation
    lastConnElementID = box;

    //use labels to create rule
    startDialogs(sensor, activeLocation, box);
};

var update = function (connInfo){
    //delete old rule
    var connection = connInfo.connection;

    //get sensor name
    var originalSourceID = connInfo.originalSourceId;
    var sensorData = window.common.getSensorById(originalSourceID);
    var originalSensor = sensorData.name;

    //reset tab for boxElement
    var originalTargetID = connInfo.originalTargetId;
    var boxData = window.common.getCubeById(originalTargetID);
    var originalBox = boxData.name;

    //remove rule from server database
    RemoveRule(originalSensor, connection.location, originalBox);

    //create new rule
    //add location name to connection (e.g. "family1")
    var activeLocation = getActiveLocation();
    connection.location = activeLocation;

    //get details of sensor and cube for dialog
    var newSensor = connInfo.newSourceId;
    var newBox = connInfo.newTargetId;

    //store ID of last connected box for possible removal
    //due to user cancellation
    lastConnElementID = newBox;

    //use labels to create rule
    startDialogs(newSensor, activeLocation, newBox);
};

var destroy = function (connInfo){
    console.log("inside the destroy method");
    var connection = connInfo.connection;

    //reset tab for boxElement
    var boxID = connInfo.targetId;
    var boxData = window.common.getCubeById(boxID);
    var box = boxData.name;

    //get sensor name
    var sensorID = connInfo.sourceId;
    var sensorData = window.common.getSensorById(sensorID);
    var sensor = sensorData.name;

    showProgressBar("Deleting connection...");

    //remove rule from server database
    RemoveRule(sensor, connection.location, box);
};

function initialisePlumb() {
    console.log("initialising jsPlumb...");
    instance = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        Container: "flowchart-demo"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
        hoverPaintStyle: { strokeStyle: "blue" }
    };

    instance.registerConnectionType("basic", basicType);


    var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            instance.addEndpoint(toId, sourceEndpoint, {
                anchor: sourceAnchors[i],
                uuid: sourceUUID
            });
        }
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            instance.addEndpoint(toId, targetEndpoint, {
                anchor: targetAnchors[j],
                uuid: targetUUID
            });
        }
    };

    // suspend drawing and initialise.
    instance.batch(function () {

        //add endpoints for SC sensor boxes
        var sensorElements = window.common.sensors();
        for(var i=0; i<sensorElements.length; i++){
            _addEndpoints(sensorElements[i].id, ["RightMiddle"], []);
        }

        //for physikit boxes
        var boxElements = window.common.cubes();
        for(var i=0; i<boxElements.length; i++){
            _addEndpoints(boxElements[i].id, [], ["LeftMiddle"]);
        }

        // listen for new connections; create rule
        instance.bind("connection", function (connInfo, originalEvent) {
            if(triggerInit){
                init(connInfo);
            }
        });

        //listen for removed connections; delete rule from database
        instance.bind("connectionDetached", function(connInfo, originalEvent) {
            if (triggerDestroy) {
                destroy(connInfo);
            }
        });

        //listen for moved connections; delete old rule and create new one
        instance.bind("connectionMoved", function(connInfo, originalEvent){
            update(connInfo);
        });
    });
}

function refreshConnectionView(location){
    //activeLocation = location;

    var connections = instance.getConnections();
    for(var i=0; i<connections.length; i++){
        var nextConnection = connections[i];

        //check if this connection should be visible in the active tab
        if(nextConnection.location == location){

            //set visible paint style
            nextConnection.setPaintStyle(connectorPaintStyle);
        }else{

            //set hidden paint style
            nextConnection.setPaintStyle(hiddenPaintStyle);
        }
    }
}

//draw a connection from source (at location) to target
function drawConnection(target, source, location){

    triggerInit = false; //turn off dialogs

    var activeLocation = getActiveLocation();

    //get source and target ids
    var cubeData = window.common.getCubeByName(target);
    var sensorData = window.common.getSensorByName(source);

    //check that source, target and location are valid
    if(cubeData != undefined){
        if(sensorData != undefined){
            if(location != undefined){

                var sourceID = sensorData.id;
                var targetID = cubeData.id;

                var existingConnections = instance.getConnections({ target:targetID });

                if(existingConnections.length < 1){  //no existing connection on this target
                    if(location == activeLocation){
                        drawVisibleConnection(sourceID, targetID, location);
                    }else{
                        drawHiddenConnection(sourceID, targetID, location);
                    }
                }/*else{
                 console.log("target already has connection - ignoring this request");
                 }*/
            }else{
                console.log("unknown location - ignoring existing connection");
            }
        }else{
            console.log("unknown sensor - ignoring existing connection");
        }
    }else{
        console.log("unknown box - ignoring existing connection");
    }

    triggerInit = true; //turn dialogs back on
}

//draw a connection with dashed lines
function drawHiddenConnection(sourceID, targetID, location){

    //create connection
    var sourceAnchor = sourceID+"RightMiddle";
    var targetAnchor = targetID+"LeftMiddle";
    var connection = instance.connect({uuids: [sourceAnchor, targetAnchor], editable: true});

    //add location name to connection (e.g. "family1")
    connection.location = location;

    //make it dashed
    connection.setPaintStyle(hiddenPaintStyle);
}

//draw a connection with solid lines
function drawVisibleConnection(sourceID, targetID, location){

    //create connection
    var sourceAnchor = sourceID+"RightMiddle";
    var targetAnchor = targetID+"LeftMiddle";
    var connection = instance.connect({uuids: [sourceAnchor, targetAnchor], editable: true});

    //add location name to connection (e.g. "family1")
    connection.location = location;
}

function deleteConnection(endpoint){
    triggerDestroy = false;
    instance.detachAllConnections(endpoint);
    triggerDestroy = true;
}

//cancel current connection creation (aborted by user mid process)
function cancelConnection(){
    //remove connection due to user cancel
    deleteConnection(lastConnElementID);

    //close all modals
    closeAllModals();
}