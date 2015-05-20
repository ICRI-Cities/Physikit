/**
 * Created by Steven on 14-5-2015.
 */

//Import needed to query the smartcitizen api
var http = require('http');

//So we can send events
var events = require('events');
var EventEmitter =  require('events').EventEmitter;

var util = require('util');

//Keep self reference
var self;

//The SmartCitizenKit object
var SmartCitizenKit =  function(token, deviceId){
    this.lastpost = undefined;
    this.interval = 2000;
    this.token = token;
    this.deviceId = deviceId;
    self =  this;

    //Uses interval to poll the API
    setInterval(function () {
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
                    self.emit("Received", data);

                    console.log("Smart Citizen Kit Updated " + data.device.last_insert_datetime );

                    //cache data
                    self.lastpost = data;
                }
                //if cached data, only update when new data is received
                if(self.lastpost.device.last_insert_datetime != data.device.last_insert_datetime){

                    //send an event to report new data
                    self.emit("Received", data);

                    console.log("Smart Citizen Kit Updated " + data.device.last_insert_datetime );

                    //cache data
                    self.lastpost = data;
                }
            });
        });

        // Report errors
        request.on('error', function(error) {
            console.log("Error while calling endpoint.", error);
        });

        request.end();

    }, this.interval);

}

//Make sure object inherits from EventEmitter
util.inherits(SmartCitizenKit, EventEmitter);

//export object
module.exports = SmartCitizenKit;

