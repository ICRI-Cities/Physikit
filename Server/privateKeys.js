/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

/**
 * Private keys stored in the private part of the server
 * @constructor
 */
var Keys = function(){
    this.smartCitizenKit1 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2165,
        id:1
    };
    this.smartCitizenKit2 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2275,
        id:2
    };
    this.smartCitizenKit3 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2278,
        id:3
    };
    this.databaseUrl ='mongodb://physikit:physikit@ds031942.mongolab.com:31942/physikit';

    //this.databaseUrl = 'mongodb://physikit:physikit@ds043962.mongolab.com:43962/physikitbu';
    this.jwtKey = 'fdsldsoiewuroiewuriqwjdshfksh';
}

module.exports = Keys;