/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Grab the debugger
var debug = require('./Debugger');

var spark = require('sparknode');

var request = require('request');



var Physikit = function(){}

Physikit.prototype.Message = function(at,coreId,mode,setting,args,value){

    var msg = mode+"-"+setting+"-"+args+"-"+value;

    request({
        uri: 'https://api.particle.io/v1/devices/' + coreId + '/run', method: 'POST',
        form: {
            args: msg,
            access_token: at.toString()
        },
        json: true
    }, function(err,data){
        if(err){
            debug.log(err,"Physikit Controller","Error");
            return;
        }
    });

}


//Export module
module.exports = Physikit;







