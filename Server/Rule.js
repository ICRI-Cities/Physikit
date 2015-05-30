/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

/**
 * Rule object used to connect Smart Citizen data to the Physikit
 * @param type - class type = "Rule"
 * @param id - id of the user
 * @param smartId - id of the smart citizen kit
 * @param smartSensor - type of sensor of smart citizen kit
 * @param cube - the name of the Physikit cube
 * @param condition - the condition of the rule
 * @param mode - the mode of Physikit cube
 * @param setting - the setting of Physikit cube
 * @param args - the args of Physikit cube
 * @param value - the value of Physikit cube
 * @constructor
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