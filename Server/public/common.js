/**
 * Created by sarahg on 30/05/15.
 */

(function(exports){

    var sensorList = [
        {id: "sc-temp", name: "temp", label: "Temperature", min:0, max:45,
            sliderVals:[8, 15, 23, 30, 38],
            sem1:"Cold day",  //at 18 deg C
            sem2:"Average UK summer",  //at 15 deg C
            sem3:"Room temperature",  //at 23 deg C
            sem4:"Average Spanish summer",  //at 30 deg C
            sem5:"Body temperature"}, //at 38 deg C

        {id: "sc-hum", name: "hum", label: "Humidity", min:0, max:100,
            sliderVals:[17,33,50,67,83],
            sem1:"Average level in the Sahara desert",  //at 16.7 hum
            sem2:"Average level in Las Vegas",  //at 33.3 hum
            sem3:"Average level in Spain",  //at 50 hum
            sem4:"Average level in India",  //at 66.7 hum
            sem5:"Average level in Ireland"}, //at 83.3 hum

        {id: "sc-co", name: "co", label: "CO", min:1, max:1000,
            sliderVals:[1,5,10,20,400],
            sem1:"Country air",  //at 1 ppm
            sem2:"Exhaled breath",  //at 5 ppm
            sem3:"City air",  //at 10 ppm
            sem4:"Inside a chimney",  //at 20 ppm
            sem5:"Smoker exhaling"}, //at 400 ppm

        {id: "sc-no2", name: "no2", label: "NO2", min:0.05, max:5,
            sliderVals:[0.06,0.08,0.12,0.25,1],
            sem1:"Commercial kitchen",  //at 0.05 ppm
            sem2:"Average roadside",  //at 0.08 ppm
            sem3:"London city centre road junction",  //at 0.12 ppm
            sem4:"Recommended less than 4 hours exposure",  //at 0.25 ppm
            sem5:"Recommended less than 1 hour exposure"}, //at 1 ppm

        {id: "sc-light", name: "light", label: "Light", min:0, max:40000,
            sliderVals:[5,300,500,5000,30000],
            sem1:"Street lighting",  //at 5 lux
            sem2:"Reading light",  //at 300 lux
            sem3:"Well lit office",  //at 500 lux
            sem4:"Cloudy sky",  //at 5000 lux
            sem5:"Sunny day"}, //at 30000 lux

        {id: "sc-noise", name: "noise", label: "Noise", min:0, max:120,
            sliderVals:[20,40,60,80,100],
            sem1:"Whisper",  //at 20 db
            sem2:"Library",  //at 40 db
            sem3:"Noise in restaurant",  //at 60 db
            sem4:"Noise in average factory",  //at 80 db
            sem5:"Lawn Mower"}  //at 100 db
    ];

    var cubeList = [
        {id: "pk-fan", name: "fan", label: "Fan"},
        {id: "pk-led", name: "light", label: "Light"},
        {id: "pk-motion", name: "move", label: "Movement"},
        {id: "pk-vibro", name: "buzz", label: "Vibration"}
    ];

    var locationList = [
        {name: "family1", label: "House A", background: "ui/sketches/house1.jpg"},
        {name: "family2", label: "House B", background: "ui/sketches/house2.jpg"},
        {name: "family3", label: "House C", background: "ui/sketches/house3.jpg"},
        {name: "family4", label: "House D", background: "ui/sketches/house4.jpg"},
        {name: "family5", label: "House E", background: "ui/sketches/house5.jpg"}
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