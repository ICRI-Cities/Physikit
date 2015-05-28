/**
 * Created by Steven on 20-5-2015.
 */

//Our private keys are stored in a private part of the webserver
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
    this.jwtKey = 'fdsldsoiewuroiewuriqwjdshfksh';
}

module.exports = Keys;