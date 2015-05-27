

//Document is fully loaded
$(document).ready(function() {

    //Grab the cookie
    var cookie =  $.cookie("data");

    //If cookie is not null, set the values
    if(cookie != undefined){

        var message = JSON.parse(cookie);
        Text("token",message.token);
        Text("deviceId",message.deviceId);
        Value("mode",message.mode);
        Value("args",message.args);
        Value("setting",message.setting);
        Value("value",message.value);
    }
    //If not set the fields to default values
    else{
        Reset();
    }

    //If we change token, we need to log in again
    $('#token').on('input', function() {
        loggedIn = false;
    });

    $('#token').on('input propertychange paste', function() {
        loggedIn = false;
    });
});

//Set text of input fields
function Text(propertyName,text){
    $( "#" + propertyName).val(text);
}

//Set value of value fields
function Value(propertyName,value){
    $( "#" + propertyName ).val(value);
}

//Check if we logged in already
var loggedIn = false;

//Handles form submit
function SendMessage(){

    //Grab the message from the form
    var message = {};
    message.token =  $( "#token" ).val();
    message.deviceId = $( "#deviceId" ).val();

    message.mode = $( "#mode" ).val()
    message.args = $( "#args" ).val();
    message.value = $( "#value" ).val();
    message.setting = $( "#setting" ).val();

    //Check if the value parameter is between 0 and 255
    var vvalue = parseInt(message.value);

    if(isNaN(vvalue) || vvalue<0 || vvalue >255){
        Error(" Value '" + message.value + " ' is not a valid argument. Please choose a value between 0 and 255.",4000);
        return;
    }

    //Save the cookie if needed
    if($("#saveCookie").is(':checked')){
        $.cookie("data",JSON.stringify(message));
        Info("We saved your input data to a cookie",4000);
    }

    //When spark is logged in
    spark.on('login', function(err, body) {

        if(err){
            console.log("Spark login error: "+err);
            Error("Please provide a valid API token. You can find this token in the settings tab of" +
                " the online <a href='https://build.particle.io/build#settings' target='_blank'>build.particle.io</a>" +
                " editor.",10000);
            return;
        }
        SendSparkMessage(message);

    });

    if(!loggedIn){
        spark.login({ accessToken: message.token });
        loggedIn = true;
    }
    else{
        SendSparkMessage(message);
    }
}

function SendSparkMessage(message){
    spark.getDevice(message.deviceId, function(err, device) {

        if (err) {
            console.log('Spark error:', err);

            if(err.message == "invalid_token"){
                Error("Please provide a valid API token. You can find this token in the settings tab of" +
                    " the online <a href='https://build.particle.io/build#settings' target='_blank'>build.particle.io</a>" +
                    " editor.",10000);
            }
            else Error(" We could not find the device id, please check if the id is correct or check the" +
                " javascript console for detailed feedback.",4000);
            return;
        }

        console.log('Device name: ' + device.name);
        var msg = message.mode+"-"+message.setting+"-"+message.args+"-"+message.value;

        device.callFunction('run',msg, function(err, data) {
            if (err) {
                console.log('Spark error:', err);
                Error(" We could not find the function 'run', please make sure the main function in the" +
                    "Physikit Cube is called 'run' and check if the cube is connected to the network.",10000);
            } else {
                console.log('Function "run" called succesfully:', data)
                console.log('Message sent: ', msg);

                Success("Function 'run' was called with message: " +
                    "{mode: "+message.mode + ", setting: " +message.setting + ", args: " + message.args +
                    ", value: "+ message.value + "}, raw: '" + msg +"'.",4000);
            }
        });
    });
}

function Error(text,timeout){
    $("#error").show();
    $("#errorText").html(" "+text);

    setTimeout(function(){
        $("#error").hide();
    }, timeout);
}

function Success(text,timeout){
    $("#success").show();
    $("#successText").text(" "+text);
    setTimeout(function(){
        $("#success").hide();
    }, timeout);
}

function Info(text,timeout){
    $("#info").show();
    $("#infoText").text(" "+text);
    setTimeout(function(){
        $("#info").hide();
    }, timeout);
}

function Reset(){
    $.removeCookie("data");

    $( "#token" ).val("token here");
    $( "#deviceId" ).val("device id here");
    $( "#mode" ).val(0);
    $( "#args" ).val(0);
    $( "#setting" ).val(0);
    $( "#value" ).val(0);
    loggedIn = false;
}