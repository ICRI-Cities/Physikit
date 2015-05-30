/**
 * Created by Steven Houben (s.houben@ucl.ac.uk)
 */


//Check if we logged in already
var loggedIn = false;
var cookieChecked =false;


//Document is fully loaded
$(document).ready(function() {

     //Set date of today
    $("#date").text(GetDate());

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

        $('#saveCookie').prop('checked', message.checked);

        cookieChecked = message.checked;

        CheckDeviceId(message.deviceId);
        CheckToken(message.token);
        CheckValue(message.value);

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

    $("#token").focusout(function(){
        CheckToken($( "#token" ).val());
    });

    $("#value").focusout(function(){
        CheckValue($( "#value" ).val());
    });

    $("#deviceId").focusout(function(){
        CheckDeviceId($( "#deviceId" ).val());
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


function CheckToken(inputtedToken){
    if(inputtedToken.length== 40){
        SetInputField("success","token");
        return false;
    } else {
        if(inputtedToken == "token here"){

            SetInputField("reset","token");
            return true;
        }
        else{
            SetInputField("error","token");
            SetError("Is your API key incorrect? It is typically 40 characters long.",4000);
            return true;
        }
    }
}

function CheckDeviceId(inputtedId){
    if(inputtedId.length== 24){
        SetInputField("success","deviceId");
        return false;
    } else {
        if(inputtedId == "device id here"){
            SetInputField("reset","deviceId");
            return true;
        }
        else{
            SetInputField("error","deviceId");
            SetError("Is your device id correct? It is typically 24 characters long.",4000);
            return true;
        }

    }

}

function CheckValue(inputtedValue){
    var vvalue = Number(inputtedValue);
    if(isNaN(vvalue) || vvalue<0 || vvalue >255){
        SetInputField("error","value");
        SetError(" Value '" + inputtedValue+ " ' is not a valid argument. Please choose a value between 0 and 255.",4000);
        return true;
    }
    else{
        SetInputField("success","value");
        return false;
    }
}

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
    message.checked = $("#saveCookie").is(':checked');

    var hasError = CheckToken(message.token);
    hasError = CheckDeviceId(message.deviceId);


    hasError = CheckValue(message.value);

    if(hasError)
        return;

    //Save the cookie if needed
    if($("#saveCookie").is(':checked')){
        $.cookie("data",JSON.stringify(message),{ path: '/', expires:7 });

        if(!cookieChecked){
            SetInfo("We saved your input data to a cookie",4000);
            cookieChecked=true;
        }

    }
    else{
        cookieChecked=false;
    }

    if(!loggedIn){
        //When spark is logged in
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

var htmlInfo = function (text){
    return "<div class='alert alert alert-info' role='alert' id='info'>" +
        "<span class='glyphicon glyphicon glyphicon-info-sign' aria-hidden='true'></span>" +
        "<span class='sr-only'>Info:</span>"+
        "<strong> Info: </strong>"+text+"</div>";
}

var htmlError = function (text){
    return "<div class='alert alert-danger' role='alert' id='error'>" +
        "<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>" +
        "<span class='sr-only'>Error:</span>"+
        "<strong> Error! </strong>"+text+"</div>";
}

var htmlSuccess = function (text){
    return "<div class='alert alert-success' role='alert' id='success'>" +
        "<span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span>" +
        "<span class='sr-only'>Succes:</span>"+
        "<strong> Success! </strong>"+text+"</div>";
}

var htmlWarning = function (text){
    return "<div class='alert alert-warning' role='alert' id='warning'>" +
        "<span class='glyphicon glyphicon-warning-sign' aria-hidden='true'></span>" +
        "<span class='sr-only'>Warning:</span>"+
        "<strong> Warning! </strong>"+text+"</div>";
}




function SetError(text,timeout){
    $(htmlError(text)).insertAfter('#messages').delay(timeout).fadeOut();
}

function SetSuccess(text,timeout){
    $(htmlSuccess(text)).insertAfter('#messages').delay(timeout).fadeOut();
}

function SetInfo(text,timeout){
    $(htmlInfo(text)).insertAfter('#messages').delay(timeout).fadeOut();
}

function SetWarning(text,timeout){
    $(htmlWarning(text)).insertAfter('#messages').delay(timeout).fadeOut();
}

function SetInputField(type,field){
    if(type == "success") {
        if ($("#" + field+"Group").hasClass("has-error")) {
            $("#" + field+"Group").removeClass("has-error");
        }
        $("#" + field+"Group").addClass("has-success");

        if ($("#" + field+"Feedback").hasClass("glyphicon glyphicon-remove form-control-feedback")) {
            $("#" + field+"Feedback").removeClass("glyphicon glyphicon-remove form-control-feedback");
        }
        $("#" + field+"Feedback").addClass("glyphicon glyphicon-ok form-control-feedback");

    }
    else if (type == "error"){
        if($("#"+field+"Group").hasClass("has-success")){
            $("#"+field+"Group").removeClass("has-success");
        }
        $("#"+field+"Group").addClass("has-error");

        if ($("#" + field+"Feedback").hasClass("glyphicon glyphicon-ok form-control-feedback")) {
            $("#" + field+"Feedback").removeClass("glyphicon glyphicon-ok form-control-feedback");
        }
        $("#" + field+"Feedback").addClass("glyphicon glyphicon-remove form-control-feedback");
    }
    else if(type == "reset"){
        if($("#"+field+"Group").hasClass("has-success")){
            $("#"+field+"Group").removeClass("has-success");
        }
        else if ($("#" + field+"Group").hasClass("has-error")) {
            $("#" + field+"Group").removeClass("has-error");
        }

        if ($("#" + field+"Feedback").hasClass("glyphicon glyphicon-ok form-control-feedback")) {
            $("#" + field+"Feedback").removeClass("glyphicon glyphicon-ok form-control-feedback");
        }
        else  if ($("#" + field+"Feedback").hasClass("glyphicon glyphicon-remove form-control-feedback")) {
            $("#" + field+"Feedback").removeClass("glyphicon glyphicon-remove form-control-feedback");
        }
    }
}

function MoveToResetMode(){
    if($("#btnReset").hasClass("btn btn-inverse")){
        $("#btnReset").text("Sure?");
        $("#btnReset").removeClass("btn btn-inverse").addClass("btn btn-danger");
        SetWarning("This will remove your spark data from the website cookie and the fields.",4000);
        setTimeout(MoveToPreResetMode, 4000);
    }
    else{
        Reset();
        MoveToPreResetMode();
        SetInputField("reset","token");
        SetInputField("reset","deviceId");
        SetInputField("reset","value");

        SetSuccess("Data and field cleared.",4000);
    }
}
function MoveToPreResetMode(){
    $("#btnReset").removeClass("btn btn-danger").addClass("btn btn-inverse");
    $("#btnReset").text("Reset Form")

}

function Reset(){
    console.log("reset");
    $.removeCookie("data");

    $( "#token" ).val("token here");
    $( "#deviceId" ).val("device id here");
    $( "#mode" ).val(0);
    $( "#args" ).val(0);
    $( "#setting" ).val(0);
    $( "#value" ).val(0);
    loggedIn = false;
}

function GetDate(){

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear()

    var time = today.getHours() + ":"+today.getMinutes()+":"+today.getSeconds();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    return mm+'/'+dd+'/'+yyyy + " "+time;
}
