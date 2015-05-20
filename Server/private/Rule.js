/**
 * Created by Steven on 18-5-2015.
 */

function Rule(type,id,smartId,smartSensor,cube,condition,outputMessage){
    this.type = type;
    this.id = id;
    this.smartSensor =  smartSensor;
    this.smartId = smartId;
    this.cube = cube;
    this.condition = condition;
    this.outputMessage = outputMessage;
}

module.exports = Rule;