/**
 * Created by Steven Houben on 14-5-2015.
 */

//Include spark API
var spark = require('spark');

//So we can send events
var EventSource = require('eventsource');

//Send events
var EventEmitter =  require('events').EventEmitter;
var util = require('util');

//Self reference
var self;

//The main object
var Physikit = function(physikitKeys){
    this.fan = fanDevice;
    this.light = lightDevice;
    this.keys = physikitKeys;

    self =  this;

    spark.login({ accessToken: self.keys.token });
};

//Generic device function
function SetDevice(token, mode, setting, value ) {
    spark.getDevice(
        token,
        function (err, device) {
            //spark function run("a-b-c") a:mode, b:setting, c:value
            device.callFunction('run', mode + '-' + setting+ '-' + value, function (err, data) {
                if (err) {
                    console.log('An error occurred:', err);
                }
            });
        });
}

//Control fan
var fanDevice = function SetFanDevice(mode,setting,value){
    SetDevice(self.keys.fanDeviceToken,mode,setting,value);
}

//Control light
var lightDevice = function SetLightDevice(mode,setting,value){
    SetDevice(self.keys.lightDeviceToken,mode,setting,value);
}

//Set callbacks for each cube. Cubenames: light, buzz, move or fan
function SetCallback(deviceToken,cubeName){
    //hook callbacks whenever someone is updating the spark
    var eventSource = new EventSource("https://api.spark.io/v1/devices/"+deviceToken+"/events/?access_token=" + self.keys.token);
    eventSource.addEventListener('message', function(e) {
        var data =  JSON.parse(e.data)
        console.log("Cube " +cubeName + " updated: " + data.data);
        self.emit("SparkMessage",cubeName, data);
    },false);
}

//Setup callback events
var setupEvents = function SetupEvents(){

    SetCallback(self.keys.lightDeviceToken,"light");
    SetCallback(self.keys.fanDeviceToken,"fan");
}

//When logged into spark setup our callback events
spark.on('login', function() {
    setupEvents();
});

//Export module
module.exports = Physikit;

//Allow for events
util.inherits(Physikit, EventEmitter);





