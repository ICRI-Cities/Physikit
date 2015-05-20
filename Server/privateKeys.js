/**
 * Created by Steven on 20-5-2015.
 */

//Our private keys are stored in a private part of the webserver
var Keys = function(){
    this.smartCitizenKit1 = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2165
    };
    this.physikit1 = {
        token: 'ed0573cb19f066c7d741e83ee5fd40dca10a6e72',
        lightDeviceToken:'54ff73066678574922541067',
        fanDeviceToken : '53ff6c066667574806422567',
        buzzDeviceToken:'',
        moveDeviceToken:''
    };
    this.databaseUrl ='mongodb://physikit:physikit@ds031942.mongolab.com:31942/physikit';
    this.jwtKey = 'fdsldsoiewuroiewuriqwjdshfksh'
}

module.exports = Keys;