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

    //Handles "rules" messages related to new rules
    //updates send by our app over socket.io
    socket.on('rule',function(rule){
        HandleRuleMessage(rule);
    })

    //Handles "onconnect" socket.io event
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
function Send(cube,mode,setting,args,value){
    var data =
    {
        type: "rule",
        id : $.cookie("physikit"),
        smartSensor :  "co",
        smartId :$.cookie("physikit"),
        cube : cube,
        condition : "constant",
        mode : mode,
        setting : setting,
        args : args,
        value : value
    }
    socket.emit('rule',data);
};



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
    }else{
        $("#loginForm").hide();
        $("#loggedInForm").show();
        $("#username").text("You are logged in as: " + username);
        $("#username").prop('disabled', false);

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
        SwitchLogin(true)
    else
        Login(url,cookieValue);

    //JQUERY STUFF Initialize accordion
    $("#accordion").accordion({
        header: "h3"
    });

    //JQUERY STUFF  Initialize synchronized checkbox slider
    $("[type='checkbox']").bootstrapSwitch();

    //Initialize slider + switch events
    HandleSwitchEvent("light",true);
    HandleSwitchEvent("fan",true);
    HandleSwitchEvent("buzz",true);
    HandleSwitchEvent("move",true);
});

//Handles Smart Citizen message and updates UI
function HandleSmartCitizenMessage(id,data){

    //Todo put them in separate containers
        console.log(data.device.last_insert_datetime);
        $("#sc").html(
            "You are currently connected to a device named "
            + data.device.title
            + " that is located in "
            + data.device.location
            + ". "
            + "The temperature in <strong><span style='color: #ff0000'>"
            + data.device.location
            + "</span></strong> is currently "
            + data.device.posts[0].temp + " and the co level is "
            + data.device.posts[0].co + ".");
}

//Handles Physikit Messages
function HandleRuleMessage(rule){
    console.log("kit "+ rule.cube + " cube message: "+JSON.stringify(rule));

    var checkState = (rule.value > 0);

    if(rule.mode == 0){
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
    }
}

//Handle UI switches to control Kit
function HandleMainSwitch(cube,state,sendmessage){
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
};

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
}
