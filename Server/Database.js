/**
 * Created by Steven on 14-5-2015.
 */

//Imports for mongo db
var mongoClient = require('mongodb').MongoClient;

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

//So we can send events
var EventEmitter =  require('events').EventEmitter;

//Debug imports
var assert = require('assert');
var util = require('util');

var debug = require('./Debugger');

//Self reference
var self;

//Database object
var Database = function(){
    this.Add = add;
    this.FindAll = findAll;
    this.FindById = findAllbyId;
    this.Replace= replace;
    self =  this;
};

//Insert function
var insertDocument = function(db,collection, entity, callback) {
    db.collection(collection).insertOne( entity, function(err, result) {
        assert.equal(err, null);
        if(debug.output)  debug.log("Inserted " + JSON.stringify(entity) +" into " + collection);
        self.emit("inserted",collection, entity);
        if(callback != undefined) callback(result);
    });
};

var updateDocument  = function(db,collection,newEntity,fieldName,id, callback){
    var query = {};
    query[fieldName] = id;

    db.collection(collection).replaceOne(query,newEntity,
        function(err, results) {
            if(err)
                if(debug.output)  debug.log(err);
            if(debug.output)  debug.log("Replace and put " + JSON.stringify(newEntity) +" into " + collection);
            if(callback != undefined) callback();
        });
};

//Find function
var findDocuments = function(db,collection,callback){
    var cursor = db.collection(collection).find();
    var list = [];
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            list.push(doc);
        } else {
            if(callback != undefined) callback(list);
        }
    });
}

//Find by id function
var findDocumentsWithId = function(db,collection,fieldName, id,callback){

    var query = {};
    query[fieldName] = id;

    var cursor = db.collection(collection).find(query);
    var list = [];
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            list.push(doc);
        } else {
            if(callback != undefined) callback(list);
        }
    });
}

var replace = function(collection,entity,fieldName,id){
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        updateDocument(db, collection,entity,fieldName,id, function() {
            db.close();
        });
    });
}
//Add object to collection
var add = function(collection,entity){
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, collection,entity, function() {
            db.close();
        });
    });
}

//Find all in collection with id
var findAllbyId = function(collection,fieldName, id, callback) {
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        findDocumentsWithId(db,collection,fieldName,id,function(list) {
            db.close();
            if(callback != undefined) callback(list);
        });
    });
};

//Find all in collection
var findAll = function(collection,callback) {
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        findDocuments(db,collection,function(list) {
            db.close();
            if(callback != undefined) callback(list);
        });
    });
};

//So we can send event
util.inherits(Database, EventEmitter);

//Export our database object
module.exports = Database;
