/**
 * Created by Steven on 18-5-2015.
 */
//last configuration of all physkit blocks
function Configuration(id,lightRule,fanRule,buzzRule,moveRule){
    this.id = id;
    this.light = lightRule;
    this.fan = fanRule;
    this.buzz = buzzRule;
    this.move = moveRule;
}

module.exports = Configuration;