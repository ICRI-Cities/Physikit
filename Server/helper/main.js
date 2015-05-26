/**
 * Created by Steven on 26-5-2015.
 */



$(document).ready(function() {
    LoadTextCookie("token");
    LoadTextCookie("deviceId");
    LoadValueCookie("mode");
    LoadValueCookie("setting");
    LoadValueCookie("args");
    LoadValueCookie("value");
});

function LoadTextCookie(propertyName){
    var prop = "#" + propertyName;
    $( prop ).val(
        $.cookie(propertyName)!=undefined ? $.cookie(propertyName): propertyName+ " here");
}
function LoadValueCookie(propertyName){
    var prop = "#" + propertyName;
    $( prop ).val(
        $.cookie(propertyName)!=undefined ? $.cookie(propertyName): 0);
}


function SendMessage(){

    var cookie = {};
    cookie.token =  $( "#token" ).val();
    cookie.deviceId = $( "#deviceId" ).val();

    cookie.mode = $( "#mode" ).val()
    cookie.args = $( "#args" ).val();
    cookie.value = $( "#value" ).val();
    cookie.setting = $( "#setting" ).val();


    if($("#saveCookie").is(':checked')){
        console.log(cookie.token);
        console.log("Cookie data: "+ JSON.stringify(cookie));

        $.cookie("token",cookie.token);
        $.cookie("deviceId",cookie.deviceId);
        $.cookie("mode",cookie.mode);
        $.cookie("args",cookie.args);
        $.cookie("setting",cookie.setting);
        $.cookie("value",cookie.value);
    }

    spark.on('login', function() {
        spark.getDevice(cookie.deviceId, function(err, device) {
            console.log('Device name: ' + device.name);
            var msg = cookie.mode+"-"+cookie.setting+"-"+cookie.args+"-"+cookie.value;
            device.callFunction('run',msg , function(err, data) {
                if (err) {
                    console.log('An error occurred:', err);
                } else {
                    console.log('Function run called succesfully:', data);
                }
            });
        });

    });

     spark.login({ accessToken: cookie.token });

}


function Reset(){
    $.removeCookie("token");
    $.removeCookie("deviceId");
    $.removeCookie("mode");
    $.removeCookie("args");
    $.removeCookie("setting");
    $.removeCookie("value");

    $( "#token" ).val("token here");
    $( "#deviceId" ).val("device id here");
    $( "#mode" ).val(0);
    $( "#args" ).val(0);
    $( "#setting" ).val(0);
    $( "#value" ).val(0);
}