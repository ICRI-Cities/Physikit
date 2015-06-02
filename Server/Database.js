/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Imports of modules
var mongoClient = require('mongodb').MongoClient;
var EventEmitter =  require('events').EventEmitter;
var util = require('util');


//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

//Grab the debugger
var debug = require('./Debugger');

//Self reference
var self;

/**
 * Database handle
 * @constructor
 */
var Database = function(){
    this.Add = add;
    this.Remove = remove;
    this.FindAll = findAll;
    this.FindByField = findAllbyField;
    this.Replace= replace;
    self =  this;
};

/**
 * Inserts a new document into the database
 * @param db - name of the database
 * @param collection - name of the collection
 * @param entity - the entity we want to insert into the database
 * @param callback - the callback function to handle results
 */
var insertDocument = function(db,collection, entity, callback) {

    if(db == null){
        if(debug.output)
            console.log("Database connection lost");
        return
    }

    db.collection(collection).insertOne( entity, function(err, result) {

        if(err)
            if(debug.output)
                console.log("Failed to insert "+ JSON.stringify(entity) +" into " + collection);

        if(debug.output)
            debug.log("Inserted " + JSON.stringify(entity) +" into " + collection);

        self.emit("inserted",collection, entity);

        if(callback != undefined) callback(result);
    });
};

/**
 * Removes document from the database
 * @param db - name of the database
 * @param collection - name of the collection
 * @param entity - the entity we want to insert into the database
 * @param callback - the callback function to handle results
 */
var removeDocument = function(db, collection, entity, callback) {

    if(db == null){
        if(debug.output)
            console.log("Database connection lost");
        return
    }

    db.collection(collection).remove( entity, function(err, result) {

        if(err)
            if(debug.output)
                console.log("Failed to remove "+ JSON.stringify(entity) +" from "+ collection);

        if(debug.output)
            debug.log("Removed " +JSON.stringify(entity) +" from "+ collection);

        if(callback != undefined) callback(result);
    });
};

/**
 * Updates a document in the database
 * @param db - name of the database
 * @param collection - the name of the collection
 * @param newEntity - the new entity
 * @param fieldName - the name of the field we want to search for
 * @param oldEntity - the old entity we want to replace
 * @param callback - the callback function to handle results
 */
var updateDocument  = function(db,collection,newEntity,fieldName,oldEntity, callback){

    var query = {};
    query[fieldName] = oldEntity;

    if(db == null){
        if(debug.output)
            console.log("Database connection lost");
        return
    }

    db.collection(collection).replaceOne(query,newEntity,function(err, results) {

        if(err)
            if(debug.output)
                console.log("Failed to replace and put "+ JSON.stringify(entity) +" into " + collection);

            if(debug.output)
                debug.log("Replace and put " + JSON.stringify(newEntity) +" into " + collection);

            if(callback != undefined) callback();
        });
};

/**
 * Searches for all documents for a collection
 * @param db - name of the database
 * @param collection - name of the collection
 * @param callback - the callback function to handle results
 */
var findDocuments = function(db,collection,callback){

    if(db == null){
        if(debug.output)
            console.log("Database connection lost");
        return
    }

    db.collection(collection).find(function(err, cursor){

        if(err)
            if(debug.output)
                console.log("Collection not found: " +err);

        var list = [];

        cursor.each(function(err, doc) {

            if(err)
                if(debug.output) console.log("Error trying to find documents: " +err);

            if (doc != null)
                list.push(doc);
            else if(callback != undefined)
                callback(list);
        });
    });
}

/**
 * Searches for all documents with specific field
 * @param db - name of the database
 * @param collection -  name of the collection
 * @param fieldName - the field we are filtering on
 * @param entity - the entity value are filtering on
 * @param callback - the callback function to handle results
 */
var findDocumentsWithId = function(db,collection,fieldName, entity,callback){

    var query = {};
    query[fieldName] = entity;

    if(db == null){
        if(debug.output)
            console.log("Database connection lost");
        return
    }

    db.collection(collection).find(query,function(err,cursor){

        if(err)
            if(debug.output)
                console.log("Collection not found: " +err);

        var list = [];

        cursor.each(function(err, doc) {

            if(err)
                if(debug.output)
                    console.log("Error trying to find documents: " +err);

            if (doc != null)
                list.push(doc);
            else if(callback != undefined)
                callback(list);
        });
    });

};


/**
 * Opens database connection and  replaces an entity in the database
 * @param collection -  the name of the collection
 * @param newEntity -  the entity
 * @param fieldName - the name of field
 * @param oldEntity -  the entity we will replace
 */
var replace = function(collection,newEntity,fieldName,oldEntity){

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                console.log("Failed to connect to DB: " +err);

        updateDocument(db, collection,newEntity,fieldName,oldEntity, function() {
            db.close();
        });
    });
};

/**
 * Opens database connection and adds an entity to the database
 * @param collection - the name of the collection
 * @param entity - the entity
 */
var add = function(collection,entity){

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                console.log("Failed to connect to DB: " +err);

        insertDocument(db, collection,entity, function() {
            db.close();
        });
    });
};

/**
 * Opens database connection and removes an entity from the database
 * @param collection - the name of the collection
 * @param entity - the entity
 */
var remove = function(collection,entity){
    mongoClient.connect(keys.databaseUrl, function(err, db){
        if (err)
            if(debug.output)
                console.log("Failed to connect to DB: " +err);

        removeDocument(db, collection, entity, function() {
            db.close();
        });
    });
};

/**
 * Opens a database connection and searches for entities with id
 * @param collection - the name of the collection
 * @param fieldName - the name of the field we filter on
 * @param entity - the entity we want to add
 * @param callback - the callback function to handle results
 */
var findAllbyField = function(collection,fieldName, entity, callback) {

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                console.log("Failed to connect to DB: " +err);

        findDocumentsWithId(db,collection,fieldName,entity,function(list) {
            db.close();

            if(callback != undefined)
                callback(list);
        });
    });
};

/**
 * Opens a database and searches for all entities within one collection
 * @param collection - the name of the collection
 * @param callback - the callback function to handle results
 */
var findAll = function(collection,callback) {

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                console.log("Failed to connect to DB: " +err);

        findDocuments(db,collection,function(list) {
            db.close();

            if(callback != undefined)
                callback(list);
        });
    });
};

//So we can send event
util.inherits(Database, EventEmitter);

//Export our database object
module.exports = Database;
