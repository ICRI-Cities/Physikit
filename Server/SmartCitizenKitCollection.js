/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Import of modules
var http = require('http');
var events = require('events');
var EventEmitter =  require('events').EventEmitter;
var util = require('util');

var SmartCitizenKit = require('./SmartCitizenKit');

/**
 * Smart Citizen Kit Collection Object that encapsulates
 * many kits and tunnels events to the main class
 * @param arrayOfKitKeys -  the array of kits
 * @constructor
 */
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