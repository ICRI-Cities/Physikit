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

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();


//The main object
var Physikit = function(id,physikitKeys){

    //The user ID
    this.id = id;

    //The Physikit device ids
    this.keys = physikitKeys;

    //This object
    var self =  this;

    //Set the fan
    this.fan = function SetFanDevice(mode,setting,args,value){
        SetDevice("fan",self.keys.fanDeviceToken,mode,setting,args,value);
        if(keys.debug) console.log("Kit " + self.id+" -> Set fan: "+ mode + '-' + setting+ '-'  +args + '-'+ value);
    };

    //Set the light
    this.light = function SetLightDevice(mode,setting,args,value){
        SetDevice("light",self.keys.lightDeviceToken,mode,setting,args,value);
        if(keys.debug) console.log("Kit " + self.id+" -> Set light: "+ mode + '-' + setting+ '-'  +args + '-'+ value);
    };

    //Set the move
    this.move =  function SetMoveDevice(mode,setting,args,value){
        SetDevice("move",self.keys.moveDeviceToken,mode,setting,args,value);
        if(keys.debug) console.log("Kit " + self.id+" -> Set move: "+ mode + '-' + setting+ '-'  +args + '-'+ value);
    };

    //Set the buzz
    this.buzz = function SetBuzzDevice(mode,setting,args,value){
        SetDevice("buzz",self.keys.buzzDeviceToken,mode,setting,args,value);
        if(keys.debug) console.log("Kit " + self.id+" -> Set buzz: "+ mode + '-' + setting+ '-'  +args + '-'+ value);
    };

    this.monitor = function Monitor(callback){
        function SetupEvents(callback){
            SetCallback(self.keys.lightDeviceToken,"light",callback);
            SetCallback(self.keys.fanDeviceToken,"fan",callback);
            SetCallback(self.keys.buzzDeviceToken,"buzz",callback);
            SetCallback(self.keys.moveDeviceToken,"move",callback);
        }
    };


    //Generic device function
    function SetDevice(name,token, mode, setting,args, value ) {
        spark.getDevice(token, function (err, device) {
                if(err){
                    console.log(err);
                    return;
                }

                //---------------------------------------
                //This should never happen, for some reason does happen.
                //Perhaps it's a bug in the Spark API
                if(device==null){
                    console.log(token);
                    console.log(device);
                    console.log(name);
                    return;
                }

                //spark function run("a-b-c") a:mode, b:setting, c:value
                device.callFunction('run', mode + '-' + setting+ '-'  +args + '-'+ value, function (err, data) {
                    if (err) {
                        if(keys.debug) console.log('Could not connect to '+name+ ':', err);
                    }
                });
            });
    }

    //Set callbacks for each cube. Cubenames: light, buzz, move or fan
    function SetCallback(deviceToken,cubeName,callback){
        //hook callbacks whenever someone is updating the spark
        var eventSource = new EventSource("https://api.spark.io/v1/devices/"+deviceToken+"/events/?access_token=" + self.keys.token);
        eventSource.addEventListener('hello', function(e) {
            var data =  JSON.parse(e.data)
            callback(data);
            if(keys.debug) console.log("Cube " +cubeName + " says " + data);
        },false);
    }

    spark.login({ accessToken: self.keys.token });
};

//Allow for events
util.inherits(Physikit, EventEmitter);

//Export module
module.exports = Physikit;







