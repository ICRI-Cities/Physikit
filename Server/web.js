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
var SmartCitizenKit = require('./SmartCitizenKit');

//Physikit classes
var User = require('./User');
var Rule = require('./Rule');

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

//User app as web sever that serves public folder
app.use(express.static(path.join(__dirname, './public')));

//Important rest call used for authentication.
app.get('/api/:id', function(req, res) {

    //Insignificant internal check if id is in database
    CheckId(req.params.id, function (result) {
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

function CheckId(id, callback){
    if(id == undefined)
    {
        callback("");
        return;
    }

    db.FindById("users",id.toString(),function(list){
        if(list[0] != null)
            callback(list[0]);
        else callback("");
    })
}

io.use(socketioJwt.authorize({
    secret: keys.jwtKey,
    handshake: true
}));


io.on('connection', function(socket){

    //Todo stuff on connected
    socket.emit('sck',kit.lastpost);

    socket.on('message', function(id,sensor,mode,setting,value){
        physikit[sensor](mode,setting,value);

        //io.emit('message:', msg);
    });

    socket.on('id',function(id){
        CheckId(id,function(result){
            if (result == "") {
                console.log("405 access denied");
                return;
            }
            socket.join(id);
        });
    });
});

httpApp.listen(process.env.PORT || 3000, function(){
    console.log('server running on *:3000');
});

var kit = new SmartCitizenKit(keys.smartCitizenKit1.token,keys.smartCitizenKit1.deviceId);
kit.on('Received', function(data) {
    io.emit('sck',data);
    //RunRules();
});

var physikit =  new Physikit(keys.physikit1);
physikit.on('SparkMessage', function(source,data){
    io.to('1').emit('spm',source,data);
})

var db = new Database();
db.on('inserted',function(collection,entity){
    if(collection == "rules")
    {
        //do stuff with rules
    }
});

//Todo
function RunRules(){
    db.FindAll("rules", function (list) {
        list.forEach(function(rule) {
            //console.log(
            //    "Map the " + rule.smartSensor +
            //    " from SmartCitizenKit nr." +  rule.smartId +
            //    " to the " + rule.cube +
            //        " cube when " + rule.condition +
            //        " and run message: " +rule.outputMessage);
        });
    });

}

//Debug rest calls that need to be remove when deployed, these
//are NOT secure and violate REST, but can be used to test
//functions from the browser!!
app.get('/api/:id/kit/:sensor/:mode/:setting/:value', function(req, res){
    spark[req.params.sensor](req.params.mode, req.params.setting, req.params.value);
    res.send(
        {
            reponse: "200 OK",
            sensor: req.params.sensor,
            mode: req.params.mode,
            setting: req.params.setting,
            value: req.params.value
        })

});

app.get('/api/:id/rules',function(req,res){
    CheckId(req.params.id, function(result){
        if(result =="")
        {
            res.send("405 access denied")
            return;
        }

        db.FindById("rules",result.id,function(list)
        {
            res.send(list);
        });
    });
});


app.get('/api/:id/rules/:smartSensor/:smartId/:sensor/:condition/:output',function(req,res){

    CheckId(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        var rule = new Rule(
            "rule",
            result.id,
            req.params.smartId,
            req.params.smartSensor,
            req.params.sensor,
            req.params.condition,
            req.params.output);

        db.Add("rules",rule);
        io.emit('rules',rule);
        res.send(rule);
    });
});

app.get('/api/users/:newId/:name',function(req, res){

    var usr = new User("user", req.params.newId);
    usr.name = req.params.name;
    db.Add("users", usr);
    res.send(usr);
});

app.get('/api/:id/rules/',function(req, res){
    CheckId(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        db.FindById("rules", result.id, function (list) {
            res.send(list);
        });
    });
});

app.get('/api/:id/users/',function(req, res){
    CheckId(req.params.id, function(result) {
        if (result == "") {
            res.send("405 access denied")
            return;
        }
        db.FindAll("users", function (list) {
            res.send(list);
        });
    });
});
