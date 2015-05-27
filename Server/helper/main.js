/**
 * Created by Steven on 26-5-2015.
 */

$(document).ready(function() {
    //$("#error").hide();
    //$("#success").hide();
    //$("#info").hide();

    var cookie =  $.cookie("data");

    if(cookie != undefined){

        var message = JSON.parse(cookie);
        LoadText("token",message.token);
        LoadText("deviceId",message.deviceId);
        LoadValue("mode",message.mode);
        LoadValue("args",message.args);
        LoadValue("setting",message.setting);
        LoadValue("value",message.value);
    }
    else{
        Reset();
    }

    $('#token').on('input', function() {
        loggedIn = false;
    });

    $('#token').on('input propertychange paste', function() {
        loggedIn = false;
    });
});

function LoadText(propertyName,text){
    $( "#" + propertyName).val(text);
}
function LoadValue(propertyName,value){
    $( "#" + propertyName ).val(value);
}

var loggedIn = false;

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
        SetError(" Value '" + message.value + " ' is not a valid argument. Please choose a value between 0 and 255.",4000);
        return;
    }

    //Save the cookie if needed
    if($("#saveCookie").is(':checked')){
        $.cookie("data",JSON.stringify(message));
        SetInfo("We saved your input data to a cookie",4000);
    }


    spark.on('login', function(err, body) {

        if(err){
            console.log("Spark login error: "+err);
            SetError("Please provide a valid API token. You can find this token in the settings tab of" +
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
                SetError("Please provide a valid API token. You can find this token in the settings tab of" +
                    " the online <a href='https://build.particle.io/build#settings' target='_blank'>build.particle.io</a>" +
                    " editor.",10000);
            }
            else SetError(" We could not find the device id, please check if the id is correct or check the" +
                " javascript console for detailed feedback.",4000);
            return;
        }

        console.log('Device name: ' + device.name);
        var msg = message.mode+"-"+message.setting+"-"+message.args+"-"+message.value;

        device.callFunction('run',msg, function(err, data) {
            if (err) {
                console.log('Spark error:', err);
                SetError(" We could not find the function 'run', please make sure the main function in the" +
                    "Physikit Cube is called 'run' and check if the cube is connected to the network.",10000);
            } else {
                console.log('Function "run" called succesfully:', data)
                console.log('Message sent: ', msg);

                SetSuccess("Function 'run' was called with message: " +
                    "{mode: "+message.mode + ", setting: " +message.setting + ", args: " + message.args +
                    ", value: "+ message.value + "}, raw: '" + msg +"'.",4000);
            }
        });
    });
}

function SetError(text,timeout){
    $("#error").show();
    $("#errorText").html(" "+text);

    setTimeout(function(){
        $("#error").hide();
    }, timeout);
}

function SetSuccess(text,timeout){
    $("#success").show();
    $("#successText").text(" "+text);
    setTimeout(function(){
        $("#success").hide();
    }, timeout);
}

function SetInfo(text,timeout){
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