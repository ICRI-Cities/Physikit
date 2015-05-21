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
        console.log("Inserted " + JSON.stringify(entity) +" into " + collection);
        self.emit("inserted",collection, entity);
        callback(result);
    });
};

var updateDocument  = function(db,collection,newEntity,fieldName,id, callback){

    var query = {};
    query[fieldName] = id;

    db.collection(collection).replaceOne(query,entity,
        function(err, results) {
            console.log("Replace and put " + JSON.stringify(entity) +" into " + collection);
            callback();
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
            callback(list);
        }
    });
}

//Find by id function
var findDocumentsWithId = function(db,collection,fieldName, id,callback){

    var query = {};
    query[fieldName] = id;

    var cursor = db.collection(collection).find(query);
    console.log(fieldName + " - "+ id);
    var list = [];
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            list.push(doc);
        } else {
            callback(list);
        }
    });
}

var replace = function(collection,entity,fieldName,id, callback){
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        updateDocument(db, collection,fieldName,id,entity, function(err,result) {
            db.close();
            callback(result);
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
            callback(list);
        });
    });
};

//Find all in collection
var findAll = function(collection,callback) {
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        findDocuments(db,collection,function(list) {
            db.close();
            callback(list);
        });
    });
};

//So we can send event
util.inherits(Database, EventEmitter);

//Export our database object
module.exports = Database;
