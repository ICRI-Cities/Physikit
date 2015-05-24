/**
 * Created by Steven on 18-5-2015.
 */

function Rule(type,id,smartId,smartSensor,cube,condition,mode,setting,args,value){
    this.type = type;
    this.id = id;
    this.smartSensor =  smartSensor;
    this.smartId = smartId;
    this.cube = cube;
    this.condition = condition;
    this.mode = mode;
    this.setting = setting;
    this.args = args;
    this.value = value;

}

module.exports = Rule;