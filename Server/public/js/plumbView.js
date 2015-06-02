var activeTab = 0;
var lastConnElementID;

var instance;
var initialised = false;  //don't register new connections until initialised

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

var drawConnections = function(connectionList){

    for(var i=0; i<connectionList.length; i++){
        var nextConnection = connectionList[i];

        var target = nextConnection.cube;
        var source = nextConnection.smartSensor;
        var location = nextConnection.sensorLoc;

        //console.log("next connection: "+source+", "+target+", "+location);

        //get source and target ids
        var cubeData = window.common.getCubeByName(target);
        var sensorData = window.common.getSensorByName(source);

        //check that source, target and location are valid
        if(cubeData != undefined){
            if(sensorData != undefined){
                if(location != undefined){

                    //console.log(sensorData.name+", "+cubeData.name+", "+location);

                     //set tab for this location in common.js
                    if($("#tab-one").val() == location){
                        window.common.setCubeTab(target, 0);
                    }else if($("#tab-two").val() == location){
                        window.common.setCubeTab(target, 1);
                    }else if($("#tab-three").val() == location){
                        window.common.setCubeTab(target, 2);
                    }else if($("#tab-four").val() == location){
                        window.common.setCubeTab(target, 3);
                    }else if($("#tab-five").val() == location){
                        window.common.setCubeTab(target, 4);
                    }else{
                        console.log("could not set a tab for connection");
                    }

                    var sourceID = sensorData.id;
                    var targetID = cubeData.id;

                    //get tab of target for this connection
                    var targetTab = cubeData.tab;

                    if(targetTab == activeTab){
                        drawVisibleConnection(sourceID, targetID);
                    }else{
                        drawHiddenConnection(sourceID, targetID);
                    }
                }else{
                    console.log("unknown location - ignoring existing connection");
                }
            }else{
                console.log("unknown sensor - ignoring existing connection");
            }
        }else{
            console.log("unknown box - ignoring existing connection");
        }
    }

    initialised = true; //register new connections from here on
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
            if(initialised){
                init(connInfo.connection);

                //get details of box for dialog
                var boxID = connInfo.targetId;
                var boxData = window.common.getCubeById(boxID);
                var boxName = boxData.name;

                //set activeTab for box element with new connection
                window.common.setCubeTab(boxName, activeTab);

                //store ID of last connected box for possible removal
                //due to user cancellation
                lastConnElementID = boxID;

                //get details of sensor for dialog
                var sensorID = connInfo.sourceId;
                var sensorData = window.common.getSensorById(sensorID);

                //show pop-up dialogues for rule creation
                //get location associated with this tab
                var sensorLoc;
                switch(activeTab){
                    case 0: sensorLoc = $("#tab-one").val();
                        break;
                    case 1: sensorLoc = $("#tab-two").val();
                        break;
                    case 2: sensorLoc = $("#tab-three").val();
                        break;
                    case 3: sensorLoc = $("#tab-four").val();
                        break;
                    case 4: sensorLoc = $("#tab-five").val();
                        break;
                    default: console.log("could not set sensorLoc to create new rule");
                        return;
                }

                //use labels to create rule
                createRule(sensorData, sensorLoc, boxData);
            }
        });

        instance.bind("connectionDetached", function(connInfo, originalEvent){
            //reset tab for boxElement
            var boxID = connInfo.targetId;
            var boxData = window.common.getCubeById(boxID);
            var boxName = boxData.name;

            //reset tab for this box to -1
            window.common.setCubeTab(boxID, -1);

            //get sensor name
            var sensorID = connInfo.sourceId;
            var sensorData = window.common.getSensorById(sensorID);
            var sensorName = sensorData.name;

            //remove rule from server database
            RemoveRule(sensorName, boxName);
        });

        // make all the window divs draggable
        //instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        //instance.connect({uuids: ["sc-coRightMiddle", "pk-fanLeftMiddle"], editable: true});
        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        /*instance.bind("click", function (conn, originalEvent) {
           // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
             //   instance.detach(conn);
            conn.toggleType("basic");
        });

        instance.bind("connectionDrag", function (connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        instance.bind("connectionDragStop", function (connection) {
            console.log("connection " + connection.id + " was dragged");
        });

        instance.bind("connectionMoved", function (params) {
            console.log("connection " + params.connection.id + " was moved");
        });*/
    });

    //get existing connections from database and handle in callback
    getExistingConnections(drawConnections);
}

function refreshConnectionView(target){
    activeTab = target;

    var connections = instance.getConnections();
    for(var i=0; i<connections.length; i++){
        var nextConnection = connections[i];
        var targetID = nextConnection.targetId;

        //get tab details of this target from boxElements
        var boxData = window.common.getCubeById(targetID);
        var connectionTab = boxData.tab;

        //check if this connection should be visible in the active tab
        if(connectionTab == activeTab){

            //set visible paint style
            nextConnection.setPaintStyle(connectorPaintStyle);
        }else{

            //set hidden paint style
            nextConnection.setPaintStyle(hiddenPaintStyle);
        }
    }
}

function drawHiddenConnection(sourceID, targetID){

    //create connection
    var sourceAnchor = sourceID+"RightMiddle";
    var targetAnchor = targetID+"LeftMiddle";
    var connection = instance.connect({uuids: [sourceAnchor, targetAnchor], editable: true});

    //make it dashed
    connection.setPaintStyle(hiddenPaintStyle);
}

function drawVisibleConnection(sourceID, targetID){

    //create connection
    var sourceAnchor = sourceID+"RightMiddle";
    var targetAnchor = targetID+"LeftMiddle";
    instance.connect({uuids: [sourceAnchor, targetAnchor], editable: true});
}

function cancelConnection(){
    //remove connection due to user cancel
    instance.detachAllConnections(lastConnElementID);

    //close all modals
    closeAllModals();
}