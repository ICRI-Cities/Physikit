/**
 * Created by Steven on 12-5-2015.
 */

//Local javascript file

//websocket
var socket;

//develop url. Change for deployment.
//var url= "https://physikit.herokuapp.com/api/";

var url = "/api/";

//login the user with id (id: 1-5 depending on famility/kit; can be changed to more complex
//password and username)
function Login(url,id){

    var data = {};
    data.id = id;

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: url,
        success: function(secret) {
            //recognized
            if(secret =="405 access denied")
            {
                //We can do UI stuff to show bad login
                console.log(secret);
                return;
            }

            //Connect to the socket with out secret
            connect_socket(id,secret);

            //Set a cookie with our id, NOT the secret
            $.cookie("physikit",id);

            //Uodate UI
            SwitchLogin(false,id);

            console.log("logged in");
        }});

}

//after login complete - initalise jsPlumb connections
//get rules from database
function getExistingConnections(callback){
    //Check for cookie todo auto login
    var cookieValue = $.cookie("physikit");
    if(cookieValue != undefined){

        var data = {};
        data.id = cookieValue;

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: url+"getConnections/",
            success: function(connectionList) {
                callback(connectionList);
            }
        });
    }
}

//Connect the socket with secret
function connect_socket (id,token) {
    console.log("Log in response: " + token.token);

    //Connect to server with secret
    socket = io.connect('', {
        'query':
        'token=' + token.token +
        "&id=" +id
    });

    //Handles "sck" messages related to smart citizen api
    //updates send by our app over socket.io
    socket.on('smartcitizen', function(id,data){
        HandleSmartCitizenMessage(id,data);
    });

    //Handles "spm" messages related to physikit api
    //updates send by our app over socket.io
    socket.on('physikit',function(source,msg){
        HandlePhysikitMessage(source,msg);
    });

    //Handles "rules" messages related to new rules
    //updates send by our app over socket.io
    socket.on('rule',function(rule){
        HandleRuleMessage(rule);
    });

    //Handles "remove" messages related to rule deletion
    //Updates sent by our app over socket.io
    socket.on('remove', function(rule){
        HandleRemoveMessage(rule);
    });

    //Handles "connect" socket.io event
    socket.on("connect",function(msg){
        //send an it so server know which kit we need
        //socket.emit('id', $.cookie("physikit"));
    });

    //Problem with token
    socket.on("error", function(error) {
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
            // redirect user to login page perhaps?
            console.log("Bad token");
        }
    });
}

//Send new message to Physikit node app
//id: 1-5 depending on famility/kit
//cube: light, fan, buzz or move
//mode: 0-9
//setting: 0-9
//value: 0-9
function Send(cube,sensor,sensorLoc,mode,setting,args,value){
    var data =
    {
        type: "rule",
        id : $.cookie("physikit"),
        smartSensor :  sensor,
        smartId :$.cookie("physikit"),
        sensorLoc: sensorLoc,
        cube : cube,
        condition : "m",
        mode : mode,
        setting : setting,
        args : args,
        value : value
    };
    socket.emit('rule',data);
}

//Send remove message to physikit node app
//triggered by the removal of a connection on the web UI
function RemoveRule(sensor,cube){
    var data =
    {
        type: "rule",
        id : $.cookie("physikit"),
        smartSensor :  sensor,
        smartId :$.cookie("physikit"),
        cube : cube
    };
    socket.emit('remove',data);
}



//Html event handlers for Button
function HandleLogIn(){
    var content = $( "#logIn").val();
    Login(url,content);
}
function HandleLogOut(){
    $.removeCookie("physikit");
    SwitchLogin(true);
    socket.disconnect();
    location.reload();
}

//Update UI
function SwitchLogin(value,username){
    if(value){
        $("#loginForm").show();
        $("#loggedInForm").hide();
        $("#loggedInView").hide();
        $("#loggedOutView").show();
    }else{
        $("#loginForm").hide();
        $("#loggedInForm").show();
        $("#username").text("You are logged in as: " + username);
        $("#username").prop('disabled', false);
        $("#loggedOutView").hide();
        $("#loggedInView").show();

        //assign families to tabs based on logged in user
        assignTabs();

        //initialise content in popovers depending on existing rules for logged in user
        initialisePopContent();

        //initialise jsPlumb view depending on logged in user
        initialisePlumb();
    }
}

$("#logIn").keypress(function (e) {
    if (e.keyCode == 13) {
        console.log("---------");
        HandleLogIn();// Do something
    }
});

//On document load
$(document).ready(function() {

    //Check for cookie todo auto login
    var cookieValue = $.cookie("physikit");
    if(cookieValue == undefined)
        SwitchLogin(true);
    else
        Login(url,cookieValue);

    //JQUERY STUFF

    //initialise popovers
    $('[data-toggle="popover"]').popover({ html : true });

    //handle tab changes
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        var activeRef = $(e.target).attr("href");
        HandleTabChange(activeRef);
    });

    //initialise sliders when modal shown
    $('#settingModal').on('shown.bs.modal', function (e) {
        //initialise slider
        $('#alertSlider').slider({
            formatter: function (value) {
                $('input:hidden[name=sliderVal]').val(value);
            }
        });
    });

    //Initialize accordion
    /*$("#accordion").accordion({
        header: "h3"
    });

    //JQUERY STUFF  Initialize synchronized checkbox slider
    $("[type='checkbox']").bootstrapSwitch();

    //Initialize slider + switch events
    HandleSwitchEvent("light",true);
    HandleSwitchEvent("fan",true);
    HandleSwitchEvent("buzz",true);
    HandleSwitchEvent("move",true);*/
});

//Handles Smart Citizen message and updates UI
function HandleSmartCitizenMessage(id,data){

    //Todo put them in separate containers
        console.log(data);
        $("#sc").html(
            "<strong><span style='color: #00ff00'>Connected</span></strong>"
            /*"You are currently connected to a device named "
            + data.device.title
            + " that is located in "
            + data.device.location
            + ". "
            + "The temperature in <strong><span style='color: #ff0000'>"
            + data.device.location
            + "</span></strong> is currently "
            + data.device.posts[0].temp + " and the co level is "
            + data.device.posts[0].co + "."*/
            );
}

//Handles Physikit Messages
function HandleRuleMessage(rule){
    console.log("kit "+ rule.cube + " cube message: "+JSON.stringify(rule));

    //draw jsPlumb connection to represent new rule
    drawConnection(rule.cube, rule.smartSensor, rule.sensorLoc);

    //update popover with content for new connection
    updatePopContent(rule.cube, rule.smartSensor, rule.sensorLoc, rule.mode, rule.setting, rule.args);

    //var checkState = (rule.value > 0);

    /*if(rule.mode == 0){
        if($('#'+rule.cube +'Checkbox').get(0).checked != checkState)
        {
            $('#'+rule.cube +'Checkbox').bootstrapSwitch("state",checkState,true);
            HandleMainSwitch(rule.cube ,checkState,false);
        }
        else{
            $('#'+rule.cube +'Slider').slider('value', rule.value);
            $('#'+rule.cube +'SliderValue').text(rule.value);
        }
    }else if(rule.mode ==1){
        if($('#'+rule.cube +'AlertCheckbox').get(0).checked !=  checkState)
        $('#'+rule.cube +'AlertCheckbox').bootstrapSwitch("state",checkState,true);
        HandleSecondarySwitch(rule.cube,checkState,false);
    }*/
}

//Handles Rule removal messages
function HandleRemoveMessage(rule){
    console.log("remove "+ rule.cube + " rule: "+JSON.stringify(rule));

    //remove jsplumb connection attached to cube
    var cubeID = window.common.getCubeByName(rule.cube).id;
    deleteConnection(cubeID);

    //reset popover content
    resetPopContent(rule.cube);
}




//TABS
//assign location names (families) to tabs based on who has logged in
function assignTabs(){
    var cookieValue = $.cookie("physikit");
    if(cookieValue != undefined) {

        var data = {};
        data.id = cookieValue;

        //get location names
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: url+"getLoginLocation/",  //(family name)
            success: function(location) {

                var locations = window.common.locations();
                var locIndex = window.common.getLocationIndex(location);

                //do this statically to ensure consistency
                switch(locIndex){
                    case 0: $("#tab-one").val(locations[0].name);  //set location name in tab hidden input
                        $("#tab-two").val(locations[1].name);
                        $("#tab-three").val(locations[2].name);
                        $("#tab-four").val(locations[3].name);
                        $("#tab-five").val(locations[4].name);
                        $("#tab1-label").html(locations[0].label); //set labels on tabs
                        $("#tab2-label").html(locations[1].label);
                        $("#tab3-label").html(locations[2].label);
                        $("#tab4-label").html(locations[3].label);
                        $("#tab5-label").html(locations[4].label);
                        break;
                    case 1: $("#tab-one").val(locations[1].name);
                        $("#tab-two").val(locations[0].name);
                        $("#tab-three").val(locations[2].name);
                        $("#tab-four").val(locations[3].name);
                        $("#tab-five").val(locations[4].name);
                        $("#tab1-label").html(locations[1].label);
                        $("#tab2-label").html(locations[0].label);
                        $("#tab3-label").html(locations[2].label);
                        $("#tab4-label").html(locations[3].label);
                        $("#tab5-label").html(locations[4].label);
                        break;
                    case 2: $("#tab-one").val(locations[2].name);
                        $("#tab-two").val(locations[0].name);
                        $("#tab-three").val(locations[1].name);
                        $("#tab-four").val(locations[3].name);
                        $("#tab-five").val(locations[4].name);
                        $("#tab1-label").html(locations[2].label);
                        $("#tab2-label").html(locations[0].label);
                        $("#tab3-label").html(locations[1].label);
                        $("#tab4-label").html(locations[3].label);
                        $("#tab5-label").html(locations[4].label);
                        break;
                    case 3: $("#tab-one").val(locations[3].name);
                        $("#tab-two").val(locations[0].name);
                        $("#tab-three").val(locations[1].name);
                        $("#tab-four").val(locations[2].name);
                        $("#tab-five").val(locations[4].name);
                        $("#tab1-label").html(locations[3].label);
                        $("#tab2-label").html(locations[0].label);
                        $("#tab3-label").html(locations[1].label);
                        $("#tab4-label").html(locations[2].label);
                        $("#tab5-label").html(locations[4].label);
                        break;
                    case 4: $("#tab-one").val(locations[4].name);
                        $("#tab-two").val(locations[0].name);
                        $("#tab-three").val(locations[1].name);
                        $("#tab-four").val(locations[2].name);
                        $("#tab-five").val(locations[3].name);
                        $("#tab1-label").html(locations[4].label);
                        $("#tab2-label").html(locations[0].label);
                        $("#tab3-label").html(locations[1].label);
                        $("#tab4-label").html(locations[2].label);
                        $("#tab5-label").html(locations[3].label);
                        break;
                    default: console.log("tabs not assigned!");
                        return;
                }
            }
        });

        //set active tab
        $( "#location_tabs" ).tabs().tabs({ active: 0 });
    }
}

//get the currently active tab and return the location
//associated with this tab
function getActiveLocation(){
    var tabIndex = $("#location_tabs").tabs('option', 'active');
    switch(tabIndex){
        case 0: return $("#tab-one").val();
        case 1: return $("#tab-two").val();
        case 2: return $("#tab-three").val();
        case 3: return $("#tab-four").val();
        case 4: return $("#tab-five").val();
        default: console.log("no active tab found");
            return;
    }
}

//update tabs and jsplumb connections
//when tab change occurs
function HandleTabChange(activeRef){
    var locationName = "";

    if(activeRef == "#tabOne"){
        locationName = $("#tab-one").val();  //e.g. "family1"
    }else if(activeRef == "#tabTwo"){
        locationName = $("#tab-two").val();
    }else if(activeRef == "#tabThree"){
        locationName = $("#tab-three").val();
    }else if(activeRef == "#tabFour"){
        locationName = $("#tab-four").val();
    }else if(activeRef == "#tabFive"){
        locationName = $("#tab-five").val();
    }

    //set tab background
    var url = window.common.getLocationByName(locationName).background;
    $("#tab-background").css("background-image", "url("+url+")");

    //update jsPlumb connections
    refreshConnectionView(locationName);
}



//POPOVERS
//Popover content handlers
//initialise content on login based on existing rules
function initialisePopContent(){
    var cookieValue = $.cookie("physikit");
    if(cookieValue != undefined) {

        //get existing rules for this user
        getExistingConnections(function(connectionList){
            for(var i=0; i<connectionList.length; i++) {
                var nextConnection = connectionList[i];

                var cubeName = nextConnection.cube;
                var sensorName = nextConnection.smartSensor;
                var locationName = nextConnection.sensorLoc;

                if (cubeName != undefined) {
                    if (sensorName != undefined) {
                        if (locationName != undefined) {

                            var mode = nextConnection.mode;
                            var setting = nextConnection.setting;
                            var arg = nextConnection.args;

                            updatePopContent(cubeName, sensorName, locationName, mode, setting, arg);

                        }
                    }
                }
            }
        });
    }
}

//reset popover content on rule removal
function resetPopContent(cubeName){
    if (cubeName == "fan") {
        $("#pk-fan").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "light") {
        $("#pk-led").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "move") {
        $("#pk-motion").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "buzz") {
        $("#pk-vibro").attr('data-content', "Not connected to any sensor");
    }
}

//update popover content on new rule creation
function updatePopContent(cubeName, sensorName, locationName, mode, setting, arg){

    var cubeLabel = window.common.getCubeByName(cubeName).label;
    var sensorLabel = window.common.getSensorByName(sensorName).label;
    var locationLabel = window.common.getLocationByName(locationName).label;

    //set sensor and cube labels in dataModel
    loadDataModel(sensorLabel, cubeLabel);

    //get text for popover
    var cubeIndex = window.common.getCubeIndexByName(cubeName);
    var modeText = getModeData(cubeIndex, mode).modeText;
    var settingText = getSettingData(cubeIndex, mode, setting).settingText;
    //check if there is any arg text
    var argText = "";
    var settingArgs = getSettingData(cubeIndex, mode, setting).settingArgs;
    if (settingArgs.length > 0) {
        argText = getArgData(cubeIndex, mode, setting, arg).argText;
    }

    var popText = "<div>Connected to: <strong>" + sensorLabel + " sensor </strong><br>"
        + "From: <strong>" + locationLabel + "</strong><br><br>";
    if (modeText != undefined) {
        popText = popText + cubeLabel + " cube will: <br>" + modeText + ". ";
    }
    if (settingText != undefined) {
        popText = popText + settingText +". ";
    }
    if (argText != "") {
        popText = popText + argText +".";
    }
    popText = popText+"</div>";

    //set text in popover
    if (cubeName == "fan") {
        $("#pk-fan").attr('data-content', popText);
    } else if (cubeName == "light") {
        $("#pk-led").attr('data-content', popText);
    } else if (cubeName == "move") {
        $("#pk-motion").attr('data-content', popText);
    } else if (cubeName == "buzz") {
        $("#pk-vibro").attr('data-content', popText);
    }
}


//Handle UI switches to control Kit
/*function HandleMainSwitch(cube,state,sendmessage){
 //Grab value and toggle state based on switch state (checked == true)
 var value = (state) ? 255:0;
 var on = (value == 255);

 //if state is on:
 // - send the value over socket
 // - adjust the slider and value field
 // - turn off the alert switch if needed
 if(on){
 if(sendmessage)
 Send(cube,0,0,0,value);
 $('#'+cube+'Slider').slider('value', value);
 $('#'+cube+'SliderValue').text(value);
 if($('#'+cube+'AlertCheckbox').get(0).checked)
 $('#'+cube+'AlertCheckbox').bootstrapSwitch("state",!value);
 }

 //if state is off:
 // - only send the value over socket if other switch is also off
 // - reset the slider and value field
 if(!on){
 if(!$('#'+cube+'AlertCheckbox').get(0).checked) {
 if(sendmessage)
 Send(cube,0,0,0,value);
 }
 $('#'+cube+'Slider').slider('value', value);
 $('#'+cube+'SliderValue').text(value);
 }
 }

 //Handle interval switch for kit
 function HandleSecondarySwitch(cube,state,sendmessage){
 //Grab value and toggle state based on switch state (checked == true)
 var value = (state) ? 255 : 0;
 var on = (value == 255);

 //if state is on:
 // - turn the main checkbox switch off
 // - send the value over socket
 if(on){
 $('#'+cube+'Checkbox').bootstrapSwitch("state",!on);
 if(sendmessage)
 Send(cube,1,0,0,value);
 }

 //if state is off:
 // - only send the value over socket if main switch is also off
 if(!on){
 if(!$('#'+cube+'Checkbox').get(0).checked) {
 if(sendmessage)
 Send(cube,1,0,0,value);
 }
 }
 }

 //Handle slides
 function HandleSliders(cube,value,sendmessage){
 //Send the value over socket
 if(sendmessage)
 Send(cube,0,0,0,value);

 //Calculate toggle state based on slider value
 var state = (value>0) ? true : false;

 //Set the main switch
 $('#'+cube+'Checkbox').bootstrapSwitch("state",state);
 }

 //Generic handler that works for every 'cube' keyword
 //and their representations in the UI.
 //E.g. 'light'
 // -> #lightCheckbox
 // -> #lightAlertCheckbox
 // -> #lightSlider
 // -> #lightSliderValue
 function HandleSwitchEvent(cube,sendmessage){
 //Handle the basic switch event
 $('#'+cube+'Checkbox').on('switchChange.bootstrapSwitch', function(event, state) {
 HandleMainSwitch(cube,state,sendmessage);
 });

 //Handle the alert box switch event
 $('#'+cube+'AlertCheckbox').on('switchChange.bootstrapSwitch', function(event, state) {

 HandleSecondarySwitch(cube,state,sendmessage);
 });

 //Handles the sliders
 $('#'+cube+'Slider').slider({
 orientation: "horizontal",
 range: "min",
 min: 0,
 max: 255,
 value: 0,

 //We don't want to send data continuously, so we only
 //send data when the slide adjustment is done
 stop: function (event, ui) {

 HandleSliders(cube,ui.value,sendmessage);
 },

 //While sliding is going on
 slide: function (event, ui) {

 //Update the value field
 $('#'+cube+'SliderValue').text(ui.value);
 }
 });
 }*/