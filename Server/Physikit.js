/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Include modules
var spark = require('spark');
var EventSource = require('eventsource');
var EventEmitter =  require('events').EventEmitter;
var util = require('util');

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

//Grab the debugger
var debug = require('./Debugger');


/**
 * Physikit is the class that abstracts the Spark Cores that are
 * part of the same cube group.
 * @param id - the id of the Physikit
 * @param physikitKeys - the device id's and token of the Spark Core account
 * @constructor
 */
var Physikit = function(id,physikitKeys){

    this.id = id;
    this.keys = physikitKeys;

    var self =  this;

    /**
     * These functions abstract the physikit interactions and expose them
     * through the object
     * @param mode - value between 0 and 9
     * @param setting - value between 0 and 9
     * @param args - value between 0 and 9
     * @param value - value between 0 and 255
     * @constructor 
     */
    this.fan = function SetFanDevice(mode,setting,args,value){
        SetDevice("fan",self.keys.fanDeviceToken,mode,setting,args,value);
        if(debug.details)
            debug.log("Kit " + self.id+" -> Set fan: "+ mode + '-' + setting+ '-'  +args + '-'+ value,"Physikit Controller","Success");
    };

    this.light = function SetLightDevice(mode,setting,args,value){
        SetDevice("light",self.keys.lightDeviceToken,mode,setting,args,value);
        if(debug.details)
            debug.log("Kit " + self.id+" -> Set light: "+ mode + '-' + setting+ '-'  +args + '-'+ value,"Physikit Controller","Success");
    };

    this.move =  function SetMoveDevice(mode,setting,args,value){
        SetDevice("move",self.keys.moveDeviceToken,mode,setting,args,value);
        if(debug.details)
            debug.log("Kit " + self.id+" -> Set move: "+ mode + '-' + setting+ '-'  +args + '-'+ value,"Physikit Controller","Success");
    };

    this.buzz = function SetBuzzDevice(mode,setting,args,value){
        SetDevice("buzz",self.keys.buzzDeviceToken,mode,setting,args,value);
        if(debug.details)
            debug.log("Kit " + self.id+" -> Set buzz: "+ mode + '-' + setting+ '-'  +args + '-'+ value,"Physikit Controller","Success");
    };

    this.monitor = function Monitor(callback){
        function SetupEvents(callback){
            SetCallback(self.keys.lightDeviceToken,"light",callback);
            SetCallback(self.keys.fanDeviceToken,"fan",callback);
            SetCallback(self.keys.buzzDeviceToken,"buzz",callback);
            SetCallback(self.keys.moveDeviceToken,"move",callback);
        }
    };

    /**
     * Sends the actual message to the Spark Core
     * @param name - the name of the cube ("light", "fan",...)
     * @param token - the access token of the Spark API
     * @param mode - value between 0 and 9
     * @param setting - value between 0 and 9
     * @param args - value between 0 and 9
     * @param value - value between 0 and 255
     */
    function SetDevice(name,token, mode, setting,args, value ) {
        spark.getDevice(token, function (err, device) {
                if(err){
                    debug.log(err,"Physikit Controller","Error");
                    return;
                }

                //---------------------------------------
                //This should never happen, but for some reason does happen.
                //Perhaps it's a bug in the Spark API
                if(device==null){
                    debug.log(token,"Physikit Controller","Error");
                    debug.log(device,"Physikit Controller","Error");
                    debug.log(name,"Physikit Controller","Error");
                    return;
                }
                //---------------------------------------

                //spark function run("a-b-c") a:mode, b:setting, c:value
                device.callFunction('run', mode + '-' + setting+ '-'  +args + '-'+ value, function (err, data) {
                    if (err) {
                        if(debug.details) debug.log('Could not connect to '+name+ ':', err,"Physikit Controller","Error");
                    }
                });
            });
    }

    /**
     * Sets a callback from the Spark API
     * @param deviceToken - device Id of the cibe
     * @param cubeName - name of the cube
     * @param callback - callback function
     */
    function SetCallback(deviceToken,cubeName,callback){
        //hook callbacks whenever someone is updating the spark
        var eventSource = new EventSource("https://api.spark.io/v1/devices/"+deviceToken+"/events/?access_token=" + self.keys.token);
        eventSource.addEventListener('hello', function(e) {
            var data =  JSON.parse(e.data)
            callback(data);
            if(debug.details) debug.log("Cube " +cubeName + " says " + data);
        },false);
    }

    spark.login({ accessToken: self.keys.token });
};

//Allow for events
util.inherits(Physikit, EventEmitter);

//Export module
module.exports = Physikit;







