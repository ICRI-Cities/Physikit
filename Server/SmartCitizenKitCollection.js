/**
 * Created by Steven on 20-5-2015.
 */

//Import needed to query the smartcitizen api
var http = require('http');

//So we can send events
var events = require('events');
var EventEmitter =  require('events').EventEmitter;

var util = require('util');


var SmartCitizenKit = require('./SmartCitizenKit');

var SmartCitizenKitCollection = function(arrayOfKitKeys)
{
    this.kits = [];
    var self =  this;

    arrayOfKitKeys.forEach(function(kitKey) {

        var kit = new SmartCitizenKit(kitKey.id,kitKey.token,kitKey.deviceId);
        self.kits.push(kit);

        kit.on('DataReceived', function( id, data) {
            self.emit('DataReceived', id, data);
        });
    });
}

//Make sure object inherits from EventEmitter
util.inherits(SmartCitizenKitCollection, EventEmitter);

//export object
module.exports = SmartCitizenKitCollection;