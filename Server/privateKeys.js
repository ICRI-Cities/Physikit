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
    this.debug = false,
    this.databaseUrl ='mongodb://physikit:physikit@ds031942.mongolab.com:31942/physikit';
    this.jwtKey = 'fdsldsoiewuroiewuriqwjdshfksh'
}

module.exports = Keys;