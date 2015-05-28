//Webserver
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
var SmartCitizenKitCollection = require('./SmartCitizenKitCollection');

//Physikit classes
var User = require('./User');
var Rule = require('./Rule');

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

var debug = require('./Debugger');

//------------------------------------------------------------------------
//User app as web sever that serves public folder
//------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, './public')));
app.use("/helper", express.static(__dirname + "/helper"));
app.use(bodyParser.json());


//------------------------------------------------------------------------
//Check application cmd params
//------------------------------------------------------------------------
process.argv.forEach(function(val, index, array) {
    if(val == "-o") debug.output= true;
    if(val == "-od") debug.details = true;
    if(val == "-phys") debug.disablePhysikitCalls = false;

});

//------------------------------------------------------------------------
//Important rest call used for authentication.
//------------------------------------------------------------------------
app.post('/api',function(req,res){

    //Internal check if user is in database
    FindUser(req.body.id, function (result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }

        //important here, the client is given a unique
        //id for identification
        var token = jwt.sign(req.body.id, keys.jwtKey);

        //send the generated user specific token as json
        res.json({token: token});
    });
});

//------------------------------------------------------------------------
// All the smart Citizen kits
//------------------------------------------------------------------------

var kit = new SmartCitizenKitCollection([keys.smartCitizenKit1,keys.smartCitizenKit2, keys.smartCitizenKit3]);

//When new data is received
kit.on('DataReceived', function(id,data) {

    if(debug.output)  debug.log("Smart Citizen Kit "+ id + " received data on "+ data.device.last_insert_datetime);

    //Send the data to all clients
    io.emit('smartcitizen',id,data);

    //Since we have new data, we need to run all rules
    RunRules("Smartcitizen kit "+id+" reported new data.");
});



//------------------------------------------------------------------------
// Handle to Database connection
//------------------------------------------------------------------------
var db = new Database();

//------------------------------------------------------------------------
//This is called every time new data is received
//from the smart citizen kit or when a new rule
//is added by a user.
//------------------------------------------------------------------------
function RunRules(reason,id){

    //Add a "---" spacer in the console when printing all the details
    if(debug.details) debug.spacer();

    //Print reason for update
    if(debug.output) debug.log("Run rules -> "+reason);

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
                db.FindById("rules","id",id.toString(),function(list){

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

//------------------------------------------------------------------------
//Called when one of the clients add a new rule
//------------------------------------------------------------------------
function RunRule(rule){

    //Update the Physikit with the new rule
    if(!debug.disablePhysikitCalls)
        UpdatePhysikit(rule.id,rule.cube,rule.mode,rule.setting,rule.args,rule.value);

    //Send update event
    io.to(rule.id).emit('rule',rule);

    if(debug.details) debug.log("Run rule for " + rule.cube + " on Physikit "+ rule.id);
}


//------------------------------------------------------------------------
//Check if requesting entity exists in the DB
//------------------------------------------------------------------------
function Find(type,fieldName,id, callback){

    //If bad id, callback nothing
    if(id == undefined)
    {
        if(callback != undefined) callback("");
        return;
    }

        //Ask the db, make sure to stringify the input
        db.FindById(type,fieldName.toString(),id.toString(),function(list){

        //if list[0] == null, the array is empty and nothing was found
        //callback nothing or list
        if(list[0] != null && callback != undefined) callback(list[0]);
        else if(callback != undefined)  callback("");
    })
}

//helper functions for rules and users
function FindRule(id,cubeName,callback){

    //Find the user
    FindUser(id, function (result) {

        //No user
        if (result == "") {
            return;
        }

        //Grab all the rules from the user
        db.FindById("rules","id",result.id.toString(),function(list){
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
function FindUser(id,callback){
    Find("users","id",id,callback);
}

//------------------------------------------------------------------------
//Security for websockets
//------------------------------------------------------------------------
io.use(socketioJwt.authorize({
    secret: keys.jwtKey,
    handshake: true
}));

//------------------------------------------------------------------------
//When new client connectes to websockets
//------------------------------------------------------------------------
io.on('connection', function(socket){

    //On new websocket connect, we need to check if user exists in db
    FindUser(socket.client.request._query.id, function (result) {

        //No user
        if (result == "") {
            return;
        }

        //User found
        if(debug.output)  debug.log('Client connect with id: ' + socket.client.request._query.id);

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

    //A client disconnected
    socket.on('disconnect', function() {

        // We don't really need to do anything here
        if(debug.output)  debug.log('Client disconnect with id: ', socket.client.request._query.id);
    });

    //The client send a message for the Physikit
    //WARNING: debug.output method, do not use, will disrupt the rule system!!!
    socket.on('message', function(id,cube,mode,setting,args,value){

        //Update Physikit
        UpdatePhysikit(id,cube,mode,setting,args,value);
    });
});

//------------------------------------------------------------------------
//Update the physikit with a new message
//------------------------------------------------------------------------
function UpdatePhysikit(id,cube,mode,setting,args,value){

    //See if user existing in db
    FindUser(id,function(result){

        //No user found, stop function
        if (result == "") {
            if(debug.output) debug.log("405 access denied");
            return;
        }

        //Create new physikit instance based on id
        var pk = new Physikit(id,result.physikit);

        //Update the right cube
        pk[cube](mode,setting,args,value);
    });
}

//------------------------------------------------------------------------
//Add a new rule to the system
//------------------------------------------------------------------------
function AddRule(rule,callback){

    //Check if user exists
    FindUser(rule.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }

        //Check if rule exists for this cube
        FindRule(rule.id,rule.cube,function(ruleResult){

            //These are our defaults
            var cubes = ["light", "fan", "move","buzz"];
            var sensors = ["temp", "hum", "co","no2","light","noise","bat","panel","nets"];

            //Check if requested cube exist
            if(cubes.indexOf(rule.cube) > -1){

                //Check if request sensor exists
                if(sensors.indexOf(rule.smartSensor) >-1){

                    //Add new rule or replace if exist
                    ruleResult == undefined ? db.Add("rules",rule):db.Replace("rules",rule,"_id",ruleResult._id);

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

//------------------------------------------------------------------------
//The server runs on default Heroku port or 3000 for debug.output
//------------------------------------------------------------------------
httpApp.listen(process.env.PORT || 3000, function(){
    if(debug.output) debug.log('server running on *:3000');

    RunRules("Server started");
});


//-------------------------------------------------------------------------------------------------------------------
//debug rest calls that need to be remove when deployed, these
//are NOT secure and violate REST, but can be used to test
//functions from the browser!!
//------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------
// http://localhost/api/1/kit/light/0/0/0/255
//------------------------------------------------------------------------
app.get('/api/:id/kit/:cube/:mode/:setting/:args/:value', function(req, res){
    UpdatePhysikit(req.params.id,req.params.cube,
        req.params.mode,req.params.setting,req.params.args,req.params.value);
    res.send("200, OK")
});

//------------------------------------------------------------------------
// http://localhost/api/3/rules
//------------------------------------------------------------------------
app.get('/api/:id/rules',function(req,res){
    FindUser(req.params.id, function(result){
        if(result =="")
        {
            res.send("405 access denied")
            return;
        }

        db.FindById("rules","id",result.id,function(list)
        {
            res.send(list);
        });
    });
});


//------------------------------------------------------------------------
// http://localhost/api/3/rules/co2/1/light/>10/0-0-0-255
//------------------------------------------------------------------------
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

//------------------------------------------------------------------------
// http://localhost/api/users/666/newUser
//------------------------------------------------------------------------
app.get('/api/users/:newId/:name',function(req, res){

    var usr = new User("user", req.params.newId);
    usr.name = req.params.name;
    db.Add("users", usr);
    res.send(usr);
});

//------------------------------------------------------------------------
// http://localhost/api/1/rules
//------------------------------------------------------------------------
app.get('/api/:id/rules/',function(req, res){
    FindUser(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        db.FindById("rules","id", result.id, function (list) {
            res.send(list);
        });
    });
});

//------------------------------------------------------------------------
// http://localhost/api/1/users
//------------------------------------------------------------------------
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
