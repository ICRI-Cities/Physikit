/**
 * Created by sarahg on 30/05/15.
 */

(function(exports){

    var sensorList = [
        {id: "sc-temp", name: "temp", label: "Temperature"},
        {id: "sc-hum", name: "hum", label: "Humidity"},
        {id: "sc-co", name: "co", label: "CO"},
        {id: "sc-no2", name: "no2", label: "NO2"},
        {id: "sc-light", name: "light", label: "Light"},
        {id: "sc-noise", name: "noise", label: "Noise"}
    ];

    var cubeList = [
        {id: "pk-fan", name: "fan", label: "Fan", tab: -1},
        {id: "pk-led", name: "light", label: "Light", tab: -1},
        {id: "pk-motion", name: "move", label: "Movement", tab: -1},
        {id: "pk-vibro", name: "buzz", label: "Vibration", tab: -1}
    ];

    var locationList = [
        {locName: "family1"},
        {locName: "family2"},
        {locName: "family3"},
        {locName: "family4"},
        {locName: "family5"}
    ];

    exports.sensors = function(){
        return sensorList;
    };

    exports.cubes = function(){
        return cubeList;
    };

    exports.locations = function(){
        return locationList;
    }

    //helper methods
    exports.getCubeByName = function getCubeByName (cubeName) {
        for (var i = 0; i < cubeList.length; i++) {
            if (cubeList[i].name == cubeName) {
                return cubeList[i];
            }
        }
    };

    exports.getCubeById = function(cubeId){
        for(var i=0; i<cubeList.length; i++){
            if(cubeList[i].id == cubeId){
                return cubeList[i];
            }
        }
    };

    exports.getSensorByName = function(sensorName){
        for(var i=0; i<sensorList.length; i++){
            if(sensorList[i].name == sensorName){
                return sensorList[i];
            }
        }
    };

    exports.getSensorById = function(sensorId){
        for(var i=0; i<sensorList.length; i++){
            if(sensorList[i].id == sensorId){
                return sensorList[i];
            }
        }
    };

    exports.setCubeTab = function(cubeName, cubeTab){
        for(var i=0; i<cubeList.length; i++){
            if(cubeList[i].name == cubeName){
                cubeList[i].tab = cubeTab;
                break;
            }
        }
    };

    exports.getLocationIndex = function(locationName){
        for(var i=0; i<locationList.length; i++){
            if(locationList[i].locName == locationName){
                return i;
            }
        }
    };

})((typeof process === 'undefined' || !process.versions)
    ? window.common = window.common || {}
    : exports);