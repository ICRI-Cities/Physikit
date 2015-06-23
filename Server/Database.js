/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

//Imports of modules
var mongoClient = require('mongodb').MongoClient;

//Grab the private keys
var Keys = require('./privateKeys');
var keys = new Keys();

//Grab the debugger
var debug = require('./Debugger');


/**
 * Check if a field is null, empty or undefined
 * @param field - the field that needs to be checked
 * @returns {boolean} - whether the field exists
 * @constructor
 */
function IsNull(field){
    return field == null || field == undefined || field == "";
}

/**
 * Validates a database call
 * @param db - the database
 * @param collection - the collection
 * @param entity -  the entity
 * @returns {boolean} - whether the call was validated
 * @constructor
 */
function ValidateDatabaseCall(db,collection,entity){
    if(IsNull(db)){
        if(debug.output)
            debug.log("Database connection lost","Database","Error");
        return false;
    }

    else if(IsNull(collection)){
        if(debug.output)
            debug.log("No Collection was defined","Database","Error");
        return false;
    }

    else if(IsNull(entity)){
        if(debug.output)
            debug.log("No entity was defined","Database","Error");
        return false;
    }

    return true;
}


/**
 * Inserts a new document into the database
 * @param db - name of the database
 * @param collection - name of the collection
 * @param entity - the entity we want to insert into the database
 * @param callback - the callback function to handle results
 */
var insertDocument = function (db,collection, entity, callback) {

    if(!ValidateDatabaseCall(db,collection,entity))
        return;

    db.collection(collection).insertOne( entity, function(err, result) {

        if(err)
            if(debug.output)
                debug.log("Failed to insert "+ JSON.stringify(entity) +" into " + collection,"Database","Error");

        if(debug.output)
            debug.log("Inserted " + JSON.stringify(entity) +" into " + collection,"Database","Success");

        if(callback != undefined)
            callback(result);
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

    if(!ValidateDatabaseCall(db,collection,entity))
        return;

    db.collection(collection).remove( entity, function(err, result) {

        if(err)
            if(debug.output)
                debug.log("Failed to remove "+ JSON.stringify(entity) +" from "+ collection,"Database","Error");

        if(debug.output)
            debug.log("Removed " +JSON.stringify(entity) +" from "+ collection,"Database","Success");

        if(callback != undefined)
            callback(result);
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

    if(!ValidateDatabaseCall(db,collection,newEntity))
        return;

    var query = {};
    query[fieldName] = oldEntity;

    db.collection(collection).replaceOne(query,newEntity,function(err, results) {

        if(err)
            if(debug.output)
                debug.log("Failed to replace and put "+ JSON.stringify(entity) +" into " + collection,"Database","Error");

            if(debug.output)
                debug.log("Replace and put " + JSON.stringify(newEntity) +" into " + collection,"Database","Success");

            if(callback != undefined)
                callback();
        });
};

/**
 * Searches for all documents for a collection
 * @param db - name of the database
 * @param collection - name of the collection
 * @param callback - the callback function to handle results
 */
var findDocuments = function(db,collection,callback){

    if(!ValidateDatabaseCall(db,collection,"noEntity"))
        return;

    db.collection(collection).find(function(err, cursor){

        if(err)
            if(debug.output)
                debug.log("Collection not found: " +err,"Database","Error");

        var list = [];

        cursor.each(function(err, doc) {

            if(err)
                if(debug.output) debug.log("Error trying to find documents: " +err,"Database","Error");

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

    if(!ValidateDatabaseCall(db,collection,entity))
        return;

    var query = {};
    query[fieldName] = entity;


    db.collection(collection).find(query,function(err,cursor){

        if(err)
            if(debug.output)
                debug.log("Collection not found: " +err,"Database","Error");

        var list = [];

        cursor.each(function(err, doc) {

            if(err)
                if(debug.output)
                    debug.log("Error trying to find documents: " +err,"Database","Error");

            if (doc != null)
                list.push(doc);
            else if(callback != undefined)
                callback(list);
        });
    });

};


/**
 * Database handle
 * @constructor
 */
var Database = function(){};



Database.prototype.Ping = function(){
    mongoClient.connect(keys.databaseUrl, function(err, db) {
        if(err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");
        });
}

/**
 * Opens database connection and  replaces an entity in the database
 * @param collection -  the name of the collection
 * @param newEntity -  the entity
 * @param fieldName - the name of field
 * @param oldEntity -  the entity we will replace
 */
Database.prototype.Replace = function(collection,newEntity,fieldName,oldEntity){

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");

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
Database.prototype.Add = function(collection,entity){

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");

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
Database.prototype.Remove = function(collection,entity){
    mongoClient.connect(keys.databaseUrl, function(err, db){
        if (err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");

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
Database.prototype.FindByField = function(collection,fieldName, entity, callback) {

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");

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
Database.prototype.FindAll = function(collection,callback) {

    mongoClient.connect(keys.databaseUrl, function(err, db) {

        if(err)
            if(debug.output)
                debug.log("Failed to connect to DB: " +err,"Database","Error");

        findDocuments(db,collection,function(list) {
            db.close();

            if(callback != undefined)
                callback(list);
        });
    });
};


//Export our database object
module.exports = Database;
