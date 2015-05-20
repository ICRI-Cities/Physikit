/**
 * Created by Steven on 18-5-2015.
 */

function User(type,id,lightToken,fanToken,moveToken,buzzToken,sckToken) {
    this.type = type;
    this.name = "defaultName";
    this.id = id;
    this.lightToken = lightToken;
    this.fanToken =fanToken;
    this.moveToken = moveToken;
    this.buzzToken = buzzToken;
    this.sckToken = sckToken;
}

module.exports = User;






