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
        deviceId: 2398,
        loc:"family1",
        id:1456
    };
    this.smartCitizenKit2 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2399,
        loc:"family2",
        id:2345
    };
    this.smartCitizenKit3 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2400,
        loc:"family3",
        id:3124
    };
    this.smartCitizenKit4 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2401,
        loc:"family4",
        id:4321
    };
    this.smartCitizenKit5 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2402,
        loc:"family5",
        id:5123
    };
    this.databaseUrl ='mongodb://physikit:physikit@ds031942.mongolab.com:31942/physikit';

    //this.databaseUrl = 'mongodb://physikit:physikit@ds043962.mongolab.com:43962/physikitbu';
    this.jwtKey = 'fdsldsoiewuroiewuriqwjdshfksh';
}

module.exports = Keys;