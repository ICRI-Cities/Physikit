//var activeLocation = getActiveLocation();
var lastConnElementID;

var instance;
var triggerDialog = true;

// this is the paint style for the connecting lines..
var connectorPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#61B7CF",
        "dashstyle": "none"
        //joinstyle: "round",
        //outlineColor: "white",
        //outlineWidth: 2
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
        //joinstyle: "round",
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
        /*overlays: [
         [ "Label", {
         location: [0.5, 1.5],
         label: "Drag",
         cssClass: "endpointSourceLabel"
         } ]
         ]*/
    },
// the definition of target endpoints (will appear when the user drags a connection)
    targetEndpoint = {
        endpoint: "Dot",
        paintStyle: { fillStyle: "#7AB02C", radius: 11 },
        hoverPaintStyle: endpointHoverStyle,
        maxConnections: 1,
        dropOptions: { hoverClass: "hover", activeClass: "activated" },
        isTarget: true
        /*overlays: [
         [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel" } ]
         ]*/
    },
    init = function (connection) {
        //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
    };

//don't initalise jsPlumb elements until after login
//this ensures all elements get properly initialised with their relative positions
//jsPlumb.ready(function(){
    //var cookieValue = $.cookie("physikit");
    //if(cookieValue != undefined){

        //initialise();


    //}
//});

function initialisePlumb() {
    console.log("initialising jsPlumb...");
    instance = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        /*ConnectionOverlays: [
            [ "Arrow", { location: 1 } ]
            [ "Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
        ],*/
        Container: "flowchart-demo"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
        hoverPaintStyle: { strokeStyle: "blue" }
        /*overlays: [
         "Arrow"
         ]*/
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

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        instance.bind("connection", function (connInfo, originalEvent) {

            if(triggerDialog){
                init(connInfo.connection);

                //add location name to connection (e.g. "family1")
                var connection = connInfo.connection;
                var activeLocation = getActiveLocation();
                connection.location = activeLocation;

                //get details of box for dialog
                var boxID = connInfo.targetId;
                var boxData = window.common.getCubeById(boxID);

                //store ID of last connected box for possible removal
                //due to user cancellation
                lastConnElementID = boxID;

                //get details of sensor for dialog
                var sensorID = connInfo.sourceId;
                var sensorData = window.common.getSensorById(sensorID);

                //use labels to create rule
                startDialogs(sensorData, activeLocation, boxData);
            }
        });

        instance.bind("connectionDetached", function(connInfo, originalEvent){
            //reset tab for boxElement
            var boxID = connInfo.targetId;
            var boxData = window.common.getCubeById(boxID);
            var boxName = boxData.name;

            //get sensor name
            var sensorID = connInfo.sourceId;
            var sensorData = window.common.getSensorById(sensorID);
            var sensorName = sensorData.name;

            //show progress bar modal
            $("#waitText").html("Deleting connection...");
            $("#confirmModal").modal();

            //remove rule from server database
            RemoveRule(sensorName, boxName);
        });
    });

    //get existing connections from database and handle in callback
    getExistingConnections(drawConnections);
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

//once jsplumb in initialised draw all connections to represent existing rules
var drawConnections = function(connectionList){

    for(var i=0; i<connectionList.length; i++){
        var nextConnection = connectionList[i];

        var target = nextConnection.cube; //(e.g. "fan")
        var source = nextConnection.smartSensor;  //(e.g. "light")
        var location = nextConnection.sensorLoc; //(e.g. "family1"))

        drawConnection(target, source, location);
    }
};

//draw a connection from source (at location) to target
function drawConnection(target, source, location){

    triggerDialog = false; //turn off dialogs

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

    triggerDialog = true; //turn dialogs back on
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

function deleteConnection(targetID){
    instance.detachAllConnections(targetID);
}

/*function connectionExists(target, source, location){

}*/

//cancel current connection creation (aborted by user mid process)
function cancelConnection(){
    //remove connection due to user cancel
    deleteConnection(lastConnElementID);

    //close all modals
    closeAllModals();
}