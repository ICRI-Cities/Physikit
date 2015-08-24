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

    //Handles "rules" messages related to rules execution
    socket.on('rule',function(rule){
        HandleRuleMessage(rule);
    });

    //Handles "newRule" messages related to the creation of a new rule
    //Updates sent by our app over socket.io
    socket.on('newRule', function(rule){
        HandleNewRuleMessage(rule);
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

    //Handles "identifier socket.io event
    socket.on("identifier", function(identifier){
        HandleIdentifierMessage(identifier);
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
function Send(cube,sensor,sensorLoc,mode,setting,args,condition){

    var id = window.common.getIdByLoc(sensorLoc);

    var data =
    {
        type: "rule",
        id : $.cookie("physikit"),
        smartSensor :  sensor,
        smartId :id,
        sensorLoc: sensorLoc,
        cube : cube,
        condition : condition,
        mode : mode,
        setting : setting,
        args : args,
        value : 0
    };
    socket.emit('rule',data);
}


//Send remove message to physikit node app
//triggered by the removal of a connection on the web UI
function RemoveRule(sensor,sensorLoc,cube){
    var data =
    {
        type: "rule",
        id : $.cookie("physikit"),
        smartSensor :  sensor,
        smartId :$.cookie("physikit"),
        sensorLoc: sensorLoc,
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

    //JQUERY
    //initialise popovers
    $('[data-toggle="popover"]').popover({ html : true });

    //handle tab changes
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        var activeRef = $(e.target).attr("href");
        handleTabChange(activeRef);
    });

    //initialise sliders when modal shown
    $('#settingModal').on('shown.bs.modal', function (e) {

        //initialise sliderVal
        $('input:hidden[name=sliderVal]').val(1);

        //handle slides
        $('#alertSlider').bootstrapSlider().on('slideStop', function(ev){
                $('input:hidden[name=sliderVal]').val(ev.value);
                //console.log("sliderVal = "+ev.value);
            });
    });
});

//Handles Smart Citizen message and updates UI
function HandleSmartCitizenMessage(id,data){
    console.log(
        "You are currently connected to a device named "
        + data.device.title
        + " that is located in "
        + data.device.location
        + ". \n"
        + "Temperature: "
        + data.device.posts[0].temp + "\n "
        + "Humidity: "
        + data.device.posts[0].hum + "\n"
        + "CO: "
        + data.device.posts[0].co + "\n"
        + "NO2: "
        + data.device.posts[0].no2 +"\n"
        + "Light: "
        + data.device.posts[0].light +"\n"
        + "Noise: "
        + data.device.posts[0].noise
    );
}

//Handles messages about rule execution
function HandleRuleMessage(rule) {
    //console.log("kit "+ rule.cube + " cube message: "+JSON.stringify(rule));
}


//Handles message to update UI for new rules
function HandleNewRuleMessage(rule){
    console.log("new rule: "+JSON.stringify(rule));
    //draw jsPlumb connection to represent new rule
    //update popover with content for new connection
    drawConnection(rule.cube, rule.smartSensor, rule.sensorLoc);
    updatePopContent(rule.cube, rule.smartSensor, rule.sensorLoc, rule.mode, rule.setting, rule.args);
    hideProgressBar();
}


//Handles Rule removal messages
function HandleRemoveMessage(rule){
    //console.log("remove "+ rule.cube + " rule: "+JSON.stringify(rule));
    //remove jsplumb connection attached to cube
    //reset popover content
    var cubeID = window.common.getCubeByName(rule.cube).id;
    deleteConnection(cubeID);
    resetPopContent(rule.cube);
    hideProgressBar();
}

//Handles Identifier login message
function HandleIdentifierMessage(identifier){
    assignTabs(identifier);
    initialisePlumb();
}