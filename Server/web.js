/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Webserver import
var express= require('express');
var path= require('path');
var app = express();
var httpApp = require('http').Server(app);
var bodyParser= require('body-parser');

var http = require('http');
var io = require('socket.io')(httpApp);

//Security
var socketioJwt = require('socketio-jwt');
var jwt = require('jsonwebtoken');

//Physikit objects
var Physikit = require('./Physikit')
var Database = require('./Database');
/**
 * Database handle
 */
var db = new Database();
db.Ping();

var SmartCitizenKitCollection = require('./SmartCitizenKitCollection');

//Physikit classes
var User = require('./User');
var Rule = require('./Rule');
var common = require('./public/common');

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

var debug = require('./Debugger');


/**
 *  User app as web sever that serves public folder
 */
app.use(express.static(path.join(__dirname, './public')));
app.use("/helper", express.static(__dirname + "/helper"));
app.use(bodyParser.json());


/**
 *  Check application cmd params
 */
process.argv.forEach(function(val, index, array) {
    if(val == "-o") debug.output= true;
    if(val == "-od") debug.details = true;
    if(val == "-np") debug.disablePhysikitCalls = true;

});

/**
 * Important rest call used for authentication.
 */
app.post('/api',function(req,res){

    //Internal check if user is in database
    FindUser(req.body.id, function (result) {
        if (result == "") {
            res.send("405 access denied");
            return;
        }

        //important here, the client is given a unique
        //id for identification
        var token = jwt.sign(req.body.id, keys.jwtKey);

        //send the generated user specific token as json
        res.json({token: token});
    });
});

app.post('/api/getConnections', function(req,res){
    //check if user exists in database
    FindUser(req.body.id, function(result) {
        if(result == ""){
           res.send("405 access denied");
           return;
        }

        Find("rules", "id", result[0].id, function(list){
            res.send(list);
        });
    });
});

app.post('/api/getLoginLocation', function(req,res){
    //check if user exists in database
    FindUser(req.body.id, function(result) {
        if(result == ""){
            res.send("405 access denied");
            return;
        }
        res.send(result[0].name);
    })
});


/**
 * All the smart citizen kits
 */
var kit = new SmartCitizenKitCollection([keys.smartCitizenKit1,keys.smartCitizenKit2, keys.smartCitizenKit3]);

//When new data is received
kit.on('DataReceived', function(id,data) {

    if(debug.output)
        debug.log("Smart Citizen Kit "+ id + " received data on "+ data.device.last_insert_datetime,"Smart Citizen Controller","Danger");

    //Send the data to all clients
    io.emit('smartcitizen',id,data);

    //Since we have new data, we need to run all rules
    RunRules("Smart Citizen kit "+id+" reported new data.");
});



var sparks = [];




/**
 * Runs and executes all rules
 * @param reason - why the rules are being executed
 * @param id - optional filter so we don't execute all rules
 */
function RunRules(reason,id){

    //Add a "---" spacer in the console when printing all the details
    if(debug.details) debug.spacer();

    //Print reason for update
    if(debug.output)
        debug.log("Run rules -> "+reason,"Physikit Server");

    //if value is undefined
    if(id == undefined) {

        //Grab all the rules from the DB
        db.FindAll("rules", function (list) {

            //Add spacer
            if(debug.details) debug.spacer();


            list.forEach(function (rule) {
                //Run rule
                RunRule(rule);
            })

            if(debug.details) debug.spacer();
        });
    }
    else{
        //Find the user
        FindUser(id, function (result) {

            //If user is not null
            if (result != "") {

                //Find the rules for this user
                db.FindByField("rules","id",id.toString(),function(list){

                    if(debug.details) debug.spacer();

                    list.forEach(function (rule) {

                        //Run rule
                        RunRule(rule);
                    });

                    if(debug.details) debug.spacer();
                })
            }
        });
    }
}

/**
 * Execution of one specific rules
 * @param rule - the rule that is being executed
 */
function RunRule(rule){

    //Check if requested cube exist
    if(PhysikitCubeExist(rule.cube)) {

        //Check if request sensor exists
        if (SmartCitizenSensorExist(rule.smartSensor)) {

            if(debug.details)
                debug.log("Run rule for " + rule.cube + " on Physikit "+ rule.id,"Physikit Server");

            switch(rule.mode) {
                case "0":
                    //Find the sensor from the right SCK
                    var sckId = rule.smartId;

                    //Get the correct sensor value from the kit
                    GetValueFromSensorOfSck(rule.smartSensor, sckId,function(valueOfSensor){

                        if(valueOfSensor !=undefined){
                            //Get the range of the sensor
                            var sensorRange = {};
                            sensorRange.min = common.getSensorByName(rule.smartSensor).min;
                            sensorRange.max  = common.getSensorByName(rule.smartSensor).max;

                            //Map the value to Physikit Space
                            var mappedValue = valueOfSensor.map(sensorRange.min,sensorRange.max,0,255);

                            //Execute Physikit command
                            if(!debug.disablePhysikitCalls)
                                UpdatePhysikit(rule.id,rule.cube,rule.mode,rule.setting,rule.args,mappedValue);
                        }
                    });
                    break;
                case "2":
                    //Find the sensor from the right SCK
                    var sckId = rule.smartId;

                    //Calculate the relative distance: 0: decrease, 1: same, 2: increase
                    GetRelativeDistanceFromSensorOfSck(rule.smartSensor,sckId,function(relativeMove){
                        //if(relativeMove == 0 || relativeMove ==2)
                        //{
                            //Todo: only increase or decrease, or also send "same"??????
                            if(!debug.disablePhysikitCalls)
                                UpdatePhysikit(rule.id,rule.cube,rule.mode,rule.setting,rule.args,relativeMove);
                        //}
                    });
                    break;
                case "1":
                    //Find the sensor from the right SCK
                    var sckId = rule.smartId;

                    //Grab th
                    var operator =  rule.condition.substring(0,1);

                    var value = rule.condition.substring(1,rule.condition.length);

                    CheckIfAlertIsValidFromSensorOfSck(rule.smartSensor,sckId,operator,value,function(result){
                        if(result == true){
                            if(!debug.disablePhysikitCalls)
                                UpdatePhysikit(rule.id,rule.cube,rule.mode,rule.setting,rule.args,rule.value);
                        }

                    });
                    break;
                default:
                    if(debug.details)
                        debug.log("Found incompatible rule "+ rule.condition,"Physikit Server","Error");
                    break;
            }

            //Send update event
            io.to(rule.id).emit('rule',rule);

        }
    }
}

/**
 * Check if alert rule is valid
 * @param sensor - the name of the sensor
 * @param sckId - the id of smart citizen kit
 * @param operator - operator: >.< or =
 * @param setValue - the value in the condition
 * @param callback - to handle results
 * @constructor
 */
function CheckIfAlertIsValidFromSensorOfSck(sensor,sckId,operator,setValue,callback){
    //Find the kit with the right ID
    var found = false;
    kit.kits.forEach(function(sck) {
        if(sckId == sck.id  ){
            found = true;
            var post = sck.lastpost;
            if(post!=undefined){

                var sensors = post.device.posts[0];

                if(sensors != undefined)
                {
                    var value = sensors[sensor];
                    setValue = Number(setValue);

                    value = Number(value);

                    switch(operator){
                        case "<":
                            if(value < setValue)
                                callback(true);
                            else
                                callback(false);
                            break;

                        case ">":
                            if(value > setValue)
                                callback(true);
                            else
                                callback(false);
                            break;

                        case "=":
                            if(setValue == value)
                                callback(true);
                            else
                                callback(false);
                            break;
                    }

                    return;
                }
                else
                {
                    callback(undefined);
                }
            }
        }
    });

    if(!found){
        callback(undefined);
    }
}

/**
 * Gets the sensor value from a specific Smart Citizen kit
 * @param sensor - the name of the sensor
 * @param sckId - the id of the kit
 * @param callback - callback to handle results
 * @constructor
 */
function GetValueFromSensorOfSck(sensor,sckId,callback){

    //Find the kit with the right ID
    var found = false;
    kit.kits.forEach(function(sck) {
        if(sckId == sck.id  ){
            found = true;
            var post = sck.lastpost;
            if(post!=undefined){

                var sensors = post.device.posts[0];

                if(sensors != undefined)
                {
                    callback(sensors[sensor]);
                    return;
                }
                else
                {
                    callback(undefined);
                }
            }
        }
    });

    if(!found){
        callback(undefined);
    }
}

/**
 * Get the relative distance between sensor kits
 * @param sensor
 * @param sckId
 * @param callback
 * @constructor
 */
function GetRelativeDistanceFromSensorOfSck(sensor,sckId,callback){

    //Find the kit with the right ID
    var found = false;

    //Search the kits with id
    kit.kits.forEach(function(sck) {

        //Kit found
        if(sckId == sck.id  ){

            //Grab old and new post
            var post = sck.lastpost;
            var oldPost= sck.oldpost;

            //SCK message exists
            if(post!=undefined){

                var sensors = post.device.posts[0];

                //sensor data exists
                if(sensors != undefined)
                {
                    var value = sensors[sensor];

                    //old package exist
                    if (oldPost != undefined) {

                        var oldSensors = oldPost.device.posts[0];

                        //old sensor data exists
                        if (oldSensors != undefined) {
                            found = true;
                            var oldValue = oldSensors[sensor];

                            if(debug.details)
                                debug.log("sensor: "+sensor + " old: "+oldValue + " new: "+value,"Physikit Server");

                            //Calculate relative distance
                            if (oldValue == value)
                                callback(1);
                            else if (value > oldValue)
                                callback(2);
                            else
                                callback(0);
                        }
                    }
                }
                else
                {
                    callback(undefined);
                }
            }
        }
    });

    if(!found){
        callback(1);
    }
}

/**
 * Maps one value range to another
 * @param in_min - min of input range
 * @param in_max - max of input range
 * @param out_min - min of output range
 * @param out_max - max of output range
 * @returns {*} - mapped value
 */
Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
    return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

/**
 * Helper function to search the database
 * @param collection - the name the collection (e.g. "users", "rules",...)
 * @param fieldName - the name of the field we are searching for (e.g. "id")
 * @param entity - the entity we are searching for
 * @param callback - the callback function to handle results
 */
function Find(collection,fieldName,entity, callback){

    //If bad entity, callback nothing
    if(entity == undefined)
    {
        if(callback != undefined) callback("");
        return;
    }

        //Ask the db, make sure to stringify the input
        db.FindByField(collection,fieldName.toString(),entity.toString(),function(list){

        //if list[0] == null, the array is empty and nothing was found
        //callback nothing or list
        if(list[0] != null && callback != undefined)
            callback(list);
        else if(callback != undefined)
            callback("");
    })
}

//helper functions for rules and users

/**
 * Helper function to find rules
 * @param id - the id of the user
 * @param cubeName - the name of the cube
 * @param callback - the callback function to handle results
 * @constructor
 */
function FindRule(id,cubeName,callback){

    //Find the user
    FindUser(id, function (result) {

        //No user
        if (result == "") {
            return;
        }

        //Grab all the rules from the user
        db.FindByField("rules","id",result[0].id.toString(),function(list){
            var found = false;
            //Iterate through the list of rules of this users
            list.forEach(function (rule) {

                //If there is a rule for the cube, send it back
                if(rule.cube == cubeName ){
                    callback(rule);
                    found= true;
                    return;
                }
            });

            //If we did not found the rule, callback undefined
            if(!found)
                callback(undefined);
        })

    });
}

/**
 * Helper function to search for users
 * @param id - id of the user
 * @param callback - the call function to handle results
 */
function FindUser(id,callback){
    Find("users","id",id,callback);
}


/**
 * Security for web sockets
 */
io.use(socketioJwt.authorize({
    secret: keys.jwtKey,
    handshake: true
}));

/**
 * Handler for new connected clients
 */
io.on('connection', function(socket){

    //On new websocket connect, we need to check if user exists in db
    FindUser(socket.client.request._query.id, function (result) {

        //No user
        if (result == "") {
            return;
        }

        //User found
        if(debug.output)
            debug.log('Client connect with id: ' + socket.client.request._query.id,"Physikit Server");

        //Put socket into a separate channel for that id, so we don't do cross-talk across
        //several groups of clients
        socket.join(socket.client.request._query.id);

        //Grab all the smart citizen kits
        kit.kits.forEach(function(kit){

            //Send smart citizen data to all clients, independent on their id

            if(kit.lastpost !=null || kit.lastpost != undefined)
                socket.emit('smartcitizen',kit.id,kit.lastpost);
        });

        //Since we have a new connection, let's run the rules
        //to make sure we're updated
        RunRules("Client connected",result.id);

    });

    //New rule message received from client
    socket.on('rule',function(data){

        //Add a new rule that we received
        AddRule(data,function(result){});
    });

    //Rule removed in client
    socket.on('remove', function(data){

        //Remove rule from database
        RemoveRule(data,function(result){});
    });

    //A client disconnected
    socket.on('disconnect', function() {

        // We don't really need to do anything here
        if(debug.output)
            debug.log('Client disconnect with id: ', socket.client.request._query.id,"Physikit Server");
    });

    //The client send a message for the Physikit
    //WARNING: debug.output method, do not use, will disrupt the rule system!!!
    socket.on('message', function(id,cube,mode,setting,args,value){

        //Update Physikit
        UpdatePhysikit(id,cube,mode,setting,args,value);
    });
});

/**
 * Updates the Physikit with a new message
 * @param id - id of user
 * @param cube - name of the cube
 * @param mode - mode value between 0 and 9
 * @param setting - setting value between 0 and 9
 * @param args - args value between 0 and 9
 * @param value - value between 0 and 255
 */
function UpdatePhysikit(id,cube,mode,setting,args,value){

    //See if user existing in db
    FindUser(id,function(result){

        //No user found, stop function
        if (result == "") {
            if(debug.output)
                debug.log("405 access denied","Physikit Server");
            return;
        }

        //Create new physikit instance based on id
        //var pk = new Physikit(id,result[0].physikit);

        var pk = new Physikit();

        var dId = undefined;

        var userKeys = result[0].physikit;

        switch(cube){
            case "light":
                dId = userKeys.lightDeviceToken;
                break;
            case "buzz":
                dId =  userKeys.buzzDeviceToken;
                break;
            case "move":
                dId =  userKeys.moveDeviceToken;
                break;
            case "fan":
                dId =  userKeys.fanDeviceToken;
                break;
        }

        if(debug.details)
            debug.log("Kit " + id+" -> Set" + cube+": "+ mode + '-' + setting+ '-'  +args + '-'+ value,"Physikit Controller","Success");

        pk.Message(userKeys.token,dId,mode,setting,args,value);

    });
}


/**
 * Checks if a cube type exists
 * @param cubeName - the name of the cube
 * @returns {boolean} - if the cube type exists
 */
function PhysikitCubeExist(cubeName){
    var cube = common.getCubeByName(cubeName);
    return cube!=undefined;
}

/**
 * Checks if a smart citizen sensor exists
 * @param sensorName - the name of the sensor
 * @returns {boolean} - if the sensor exists
 */
function SmartCitizenSensorExist(sensorName){
    var sensor = common.getSensorByName(sensorName);
    return sensor!=undefined;
}

/**
 * Adds a new rule to the database
 * @param rule - the new rule
 * @param callback - callback function to handle results
 * @constructor
 */
function AddRule(rule,callback){

    //Check if user exists
    FindUser(rule.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }

        //Check if rule exists for this cube
        FindRule(rule.id,rule.cube,function(ruleResult){

            //Check if requested cube exist
            if(PhysikitCubeExist(rule.cube)){

                //Check if request sensor exists
                if(SmartCitizenSensorExist(rule.smartSensor)){

                    //Add new rule or replace if exist
                    ruleResult == undefined ? db.Add("rules",rule):db.Replace("rules",rule,"_id",ruleResult._id);

                    //send update event of new rule
                    io.to(rule.id).emit('newRule',rule);

                    //Run the new rule
                    RunRule(rule);

                    //Callback
                    var data = {};
                    data.code = 200;
                    data.result = 'rule added';
                    data.rule = rule;
                    if(callback != undefined) callback(data);
                }
                //Error -> sensor type does not exist
                else{
                    var data = {};
                    data.code = 400;
                    data.error = 'requested sensor type ' + rule.smartSensor + ' not found';
                    data.rule = rule;
                    if(callback != undefined) callback(data);
                }

            }
            //Error -> cube type does not exist
            else{
                var data = {};
                data.code = 400;
                data.error = 'requested cube type ' + rule.cube + ' not found';
                data.rule = rule;
                if(callback != undefined) callback(data);
            }
        });
    });
}

/**
 * Removes a rule from the database
 * @param rule - the rule to be removed
 * @param callback - callback function to handle results
 * @constructor
 */
function RemoveRule(rule,callback){
    //Check if user exists
    FindUser(rule.id, function(result) {
        if (result == "") {
            res.send("405 access denied");
            return;
        }

        //check if requested rule exists for this cube
        FindRule(rule.id, rule.cube, function (ruleResult) {

            //Check if requested cube exist
            if(PhysikitCubeExist(rule.cube)){

                //Check if request sensor exists
                if(SmartCitizenSensorExist(rule.smartSensor)){

                    //Remove rule if exists
                    if (ruleResult != undefined) {
                        db.Remove("rules", rule);

                        io.to(rule.id).emit('remove',rule);
                    }

                    //Error -> rule did not exist
                    else {
                        var data = {};
                        data.code = 400;
                        data.error = 'requested rule between sensor type ' + rule.smartSensor
                            + ' and cube type: ' + rule.cube + ' not found';
                        data.rule = rule;
                        if (callback != undefined) callback(data);
                    }
                }

                //Error -> sensor type does not exist
                else {
                    var data = {};
                    data.code = 400;
                    data.error = 'requested sensor type ' + rule.smartSensor + ' not found';
                    data.rule = rule;
                    if (callback != undefined) callback(data);
                }
            }

            //Error -> cube type does not exist
            else{
                var data = {};
                data.code = 400;
                data.error = 'requested cube type ' + rule.cube + ' not found';
                data.rule = rule;
                if(callback != undefined) callback(data);
            }
        });
    });
}

/**
 * Webserver listener
 */
httpApp.listen(process.env.PORT || 3000, function(){
    if(debug.output)
        debug.log('server running on *:3000',"Physikit Server","Success");

    RunRules("Server started");
});

/**----------------------------------------------------------------------------------------------------------------
 * debug rest calls that need to be remove when deployed, these
 * are NOT secure and violate REST, but can be used to test
 * functions from the browser!!
 *----------------------------------------------------------------------------------------------------------------*/

// http://localhost/api/1/kit/light/0/0/0/255
app.get('/api/:id/kit/:cube/:mode/:setting/:args/:value', function(req, res){
    UpdatePhysikit(req.params.id,req.params.cube,
        req.params.mode,req.params.setting,req.params.args,req.params.value);
    res.send("200, OK")
});

// http://localhost/api/3/rules
app.get('/api/:id/rules',function(req,res){
    FindUser(req.params.id, function(result){
        if(result =="")
        {
            res.send("405 access denied")
            return;
        }

        db.FindByField("rules","id",result[0].id,function(list)
        {
            res.send(list);
        });
    });
});

// http://localhost/api/3/rules/co2/1/light/>10/0-0-0-255
app.get('/api/:id/rules/:smartSensor/:smartId/:cube/:condition/:mode/:setting/:args/:value',function(req,res){

    var rule = new Rule(
        "rule",
        req.params.id,
        req.params.smartId,
        req.params.smartSensor,
        req.params.cube,
        req.params.condition,
        req.params.mode,
        req.params.setting,
        req.params.args,
        req.params.value);

        AddRule(rule, function(result){
            res.json(result)
        });
});

// http://localhost/api/users/666/newUser
app.get('/api/users/:newId/:name',function(req, res){

    var usr = new User("user", req.params.newId);
    usr.name = req.params.name;
    db.Add("users", usr);
    res.send(usr);
});

// http://localhost/api/1/rules
app.get('/api/:id/rules/',function(req, res){
    FindUser(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        db.FindByField("rules","id", result[0].id, function (list) {
            res.send(list);
        });
    });
});

// http://localhost/api/1/users
app.get('/api/:id/users/',function(req, res){
    FindUser(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        db.FindAll("users", function (list) {
            res.send(list);
        });
    });
});


app.get('/api/:method/:value1/:value2',function(req,res){

    switch(req.params.method){
        case "relative":

            break;
        case "mapping":

            break;
        case "alert":

            break;
        default: res.send("No valid method");
     }
});