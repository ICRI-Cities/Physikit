/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Import of modules
var http = require('http');
var events = require('events');
var EventEmitter =  require('events').EventEmitter;
var util = require('util');

/**
 * Smart Citizen kit object
 * @param id - the id of the users
 * @param token - the API token of the smart citizen kit
 * @param deviceId - the device id of the smart citizen kit
 * @constructor
 */
var SmartCitizenKit =  function(id, token, deviceId){
    this.lastpost = undefined;
    this.id = id;
    this.interval = 2000;
    this.token = token;
    this.deviceId = deviceId;
    this.oldpost = undefined;

    var self =  this;

    /**
     * Polls the Smart citizen kit every "interval" time
     */
    setInterval(function PollSmartCitizenKit () {

        var url = 'http://api.smartcitizen.me/v0.0.1/'+token +'/'+deviceId +'/posts.json';

        //On interval tick, ask Smart Citizen API for data
        var request = http.request(url, function(response) {
            var content = "";

            // Handle data chunks
            response.on('data', function(chunk) {
                content += chunk;
            });

            // Once we're done streaming the response, parse it as json.
            response.on('end', function() {

                //Parse json data
                var data = JSON.parse(content);

                //check if we have cached data, if not:
                if(self.lastpost == undefined)
                {
                    //send an event to report new data
                    //self.emit("DataReceived", self.id, data);

                    //cache data
                    self.lastpost = data;
                }
                //if cached data, only update when new data is received
                if(self.lastpost.device.last_insert_datetime != data.device.last_insert_datetime){

                    //send an event to report new data
                    self.emit("DataReceived", self.id, data);

                    self.oldpost = self.lastpost;
                    //cache data
                    self.lastpost = data;
                }
            });
        });

        // Report errors
        request.on('error', function(error) {
            self.emit('error: ' + error );
        });

        request.end();

    }, this.interval);

}

//Make sure object inherits from EventEmitter
util.inherits(SmartCitizenKit, EventEmitter);

//export object
module.exports = SmartCitizenKit;

