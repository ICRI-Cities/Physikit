/**
 * Created by Steven Houben (s.houben@ucl.ac.uk)
 */

var spark = require('spark')

var sparkToken = "ed0573cb19f066c7d741e83ee5fd40dca10a6e72";
var deviceToken = "54ff73066678574922541067";

//When connected
spark.on("login", function(err,body){
    if(err) console.log(err);

    console.log(body);

    spark.getDevice(deviceToken, function (err, device) {
        //if(err) console.log(err);

        //spark function run("a-b-c-d")

        DoCall(device,"0-0-0-255");
        DoCall(device,"0-0-0-255");
        DoCall(device,"0-0-0-255");
        DoCall(device,"0-0-0-255");
        DoCall(device,"0-0-0-255");
    });
})

function DoCall(device,message){
    device.callFunction('run',message, function (err, data) {
        if (err) console.log(err);

        console.log(data);
    });
}


//Log in
spark.login({ accessToken:sparkToken });