/**
 * Created by sarahg on 30/05/15.
 */

(function(exports){

    var sensorList = [
        {id: "sc-temp", name: "temp", label: "Temperature", min:0, max:40},
        {id: "sc-hum", name: "hum", label: "Humidity", min:0, max:100},
        {id: "sc-co", name: "co", label: "CO",min:0, max:1000},
        {id: "sc-no2", name: "no2", label: "NO2",min:0, max:1000},
        {id: "sc-light", name: "light", label: "Light",min:0, max:1000},
        {id: "sc-noise", name: "noise", label: "Noise",min:0, max:100}
    ];

    var cubeList = [
        {id: "pk-fan", name: "fan", label: "Fan", tab: -1},
        {id: "pk-led", name: "light", label: "Light", tab: -1},
        {id: "pk-motion", name: "move", label: "Movement", tab: -1},
        {id: "pk-vibro", name: "buzz", label: "Vibration", tab: -1}
    ];

    var locationList = [
        {name: "family1", label: "House A", background: "ui/images/backgroundA.png"},
        {name: "family2", label: "House B", background: "ui/images/backgroundB.jpg"},
        {name: "family3", label: "House C", background: "ui/images/backgroundC.jpg"},
        {name: "family4", label: "House D", background: "ui/images/backgroundD.jpg"},
        {name: "family5", label: "House E", background: "ui/images/backgroundE.jpg"}
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
    exports.getCubeByName = function (cubeName) {
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

    exports.getCubeIndexByName = function (cubeName){
        for(var i=0; i<cubeList.length; i++){
            if(cubeList[i].name == cubeName){
                return i;
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

    exports.getSensorIndexByName = function(sensorName){
        for(var i=0; i<sensorList.length; i++){
            if(sensorList[i].name == sensorName){
                return i;
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

    exports.getLocationByName = function(locationName){
        for(var i=0; i<locationList.length; i++){
            if(locationList[i].name == locationName){
                return locationList[i];
            }
        }
    };

    exports.getLocationIndex = function(locationName){
        for(var i=0; i<locationList.length; i++){
            if(locationList[i].name == locationName){
                return i;
            }
        }
    };

})((typeof process === 'undefined' || !process.versions)
    ? window.common = window.common || {}
    : exports);