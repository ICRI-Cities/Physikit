//Webserver
var express= require('express');
var path= require('path');
var app = express();
var httpApp = require('http').Server(app);

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


//------------------------------------------------------------------------
//User app as web sever that serves public folder
//------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, './public')));

//------------------------------------------------------------------------
//Important rest call used for authentication.
//------------------------------------------------------------------------
app.get('/api/:id', function(req, res) {

    //Insignificant internal check if id is in database
    FindUser(req.params.id, function (result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }

        //important here, the client is given a unique
        //id for identification
        var token = jwt.sign(req.params.id, keys.jwtKey);

        //send the generated user specific token as json
        res.json({token: token});
    });
});
//------------------------------------------------------------------------
//Check if requesting user exists in the DB
//------------------------------------------------------------------------
function Find(type,fieldName,id, callback){
    if(id == undefined)
    {
        callback("");
        return;
    }

    db.FindById(type,fieldName.toString(),id.toString(),function(list){
        if(list[0] != null)
            callback(list[0]);
        else callback("");
    })
}


function FindRule(id,callback){
    Find("rules","cube",id,callback);
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

    //Todo stuff on connected
    FindUser(socket.client.request._query.id, function (result) {
        if (result == "") {
            return;
        }

        console.log('Client connect with id: ', socket.client.request._query.id);
        socket.join(socket.client.request._query.id);

        kit.kits.forEach(function(kit){
            socket.emit('smartcitizen',kit.id,kit.lastpost);
        });

    });


    socket.on('message', function(id,sensor,mode,setting,args,value){

        FindUser(id,function(result){
            if (result == "") {
                console.log("405 access denied");
                return;
            }
            var pk = new Physikit(id,result.physikit);
            pk[sensor](mode,setting,args,value);

            console.log(id);

            io.to(id).emit('physikit',sensor, mode + "-" + setting + "-" +args+ "-" +value);

        });
        //io.emit('message:', msg);
    });

    socket.on('id',function(id){
        FindUser(id,function(result){
            if (result == "") {
                console.log("405 access denied");
                return;
            }
            socket.join(id);
        });
    });
});

//------------------------------------------------------------------------
//The server runs on default Heroku port or 3000 for debug
//------------------------------------------------------------------------
httpApp.listen(process.env.PORT || 3000, function(){
    console.log('server running on *:3000');
});

//------------------------------------------------------------------------
// All the smart Citizen kits
//------------------------------------------------------------------------
var kit = new SmartCitizenKitCollection([keys.smartCitizenKit1]);

kit.on('DataReceived', function(id,data) {
    io.emit('smartcitizen',id,data);
    console.log("Kit "+id + " -> "+ data.device.last_insert_datetime);
});

//------------------------------------------------------------------------
// Database connection
//------------------------------------------------------------------------
var db = new Database();
db.on('inserted',function(collection,entity){
    if(collection == "rules")
    {
        //do stuff with rules
    }
});

//------------------------------------------------------------------------
//This is called every time new data is received
//from the smart citizen kit or when a new rule
//is added by a user.
//------------------------------------------------------------------------
function RunRules(){
    console.log("running rules");
    //grab all the rules
    db.FindAll("rules", function (list) {
        list.forEach(function(rule) {
            console.log(
                "Map the " + rule.smartSensor +
                " from SmartCitizenKit nr." +  rule.smartId +
                " to the " + rule.cube +
                    " cube when " + rule.condition +
                    " and run message: " +rule.outputMessage);
        });
    });

}

//------------------------------------------------------------------------
//Debug rest calls that need to be remove when deployed, these
//are NOT secure and violate REST, but can be used to test
//functions from the browser!!
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// http://localhost/api/1/kit/light/0/0/0/255
//------------------------------------------------------------------------
app.get('/api/:id/kit/:sensor/:mode/:setting/:args/:value', function(req, res){

    FindUser(req.params.id, function(result){
        if(result =="")
        {
            res.send("405 access denied")
            return;
        }

        var pk = new Physikit(result.physikit);
        pk[req.params.sensor](req.params.mode,req.params.setting,req.params.args,req.params.value);
        io.to(req.params.id).emit('physikit',req.params.sensor, req.params.mode + "-" + req.params.setting +
            "-" +req.params.args + "-" + req.params.value);

        res.send("200, OK")
    });
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
app.get('/api/:id/rules/:smartSensor/:smartId/:sensor/:condition/:output',function(req,res){

    FindUser(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }

        FindRule(req.params.sensor,function(result){

            var rule = new Rule(
                "rule",
                result.id,
                req.params.smartId,
                req.params.smartSensor,
                req.params.sensor,
                req.params.condition,
                req.params.output);

                db.Add("rules",rule);

            io.to(result.id).emit('rules',rule);
            res.send(rule);
        });

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
