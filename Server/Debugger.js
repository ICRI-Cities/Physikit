/**
 * Created by Steven Houben (s.houben@ucl.ac.uk)
 */

//Debug purposes
var moment = require('moment');
var fs = require('fs');

exports.output = function(){
    return true;
}

exports.details = function(){
    return false;
}

exports.disablePhysikitCalls = function(){
    return true;
}

exports.log = function(text){
    var msg = moment().format("D MMM HH:mm:ss") + " - "+text
    console.log(msg);

    fs.appendFile('./Logs/data.log', msg + "\n", function (err) {
        if(err) console.log("Error writing to file");
    });
}