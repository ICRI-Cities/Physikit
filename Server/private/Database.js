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
    self =  this;
};

//Insert function
var insertDocument = function(db,collection, entity, callback) {
    db.collection(collection).insertOne( entity, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted " + entity +" into " + collection);
        self.emit("inserted",collection, entity);
        callback(result);
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
var findDocumentsWithId = function(db,collection,id,callback){
    var cursor = db.collection(collection).find( { "id": id });
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
var findAllbyId = function(collection,id,callback) {
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        assert.equal(null, err);
        findDocumentsWithId(db,collection,id,function(list) {
            db.close();
            callback(list);
        });
    });
};

//Find all in collection
var findAll = function(collection,callback) {
    mongoClient.connect(url, function(err, db) {
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
