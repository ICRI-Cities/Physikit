/**
 * Created by Steven on 18-5-2015.
 */

function User(type,id,lightToken,fanToken,moveToken,buzzToken,sckToken) {
    this.type = type;
    this.name = "defaultName";
    this.id = id;
    this.smartCitizenKit = {
        token:"a84d28b66e96ebdae9115007d4af2199b226c1fa",
        deviceId: 2165,
        id:1
    };
    this.physikit = {
        token: 'ed0573cb19f066c7d741e83ee5fd40dca10a6e72',
        lightDeviceToken:'54ff73066678574922541067',
        fanDeviceToken : '53ff6c066667574806422567',
        buzzDeviceToken:'',
        moveDeviceToken:'',
        id: 1
    };
}

module.exports = User;






