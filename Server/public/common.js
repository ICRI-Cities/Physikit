/**
 * Created by sarahg on 30/05/15.
 */

(function(exports){

    var sensorList = [
        {id: "sc-temp", name: "temp", label: "Temperature", min:5, max:45,
            sliderVals:[12, 19, 26, 33, 40],
            sem1:"Average UK day",  //at 12 deg C
            sem2:"Room temperature",  //at 19 deg C
            sem3:"Average Spanish summer",  //at 26 deg C
            sem4:"Sahara desert",  //at 33 deg C
            sem5:"Steam room"}, //at 40 deg C

        {id: "sc-hum", name: "hum", label: "Humidity", min:0, max:100,
            sliderVals:[17,33,50,67,83],
            sem1:"Average level in the Sahara desert",  //at 16.7 hum
            sem2:"Average level in Las Vegas",  //at 33.3 hum
            sem3:"Average level in Spain",  //at 50 hum
            sem4:"Average level in India",  //at 66.7 hum
            sem5:"Average level in Ireland"}, //at 83.3 hum

        //worked out using formula: kOhm = ppm/75 (75 = default Rs for CO sensor)
        {id: "sc-co", name: "co", label: "CO", min:0, max:75000,
            sliderVals:[75,375,750,1500,30000],
            sem1:"Country air",  //at 1 ppm
            sem2:"Exhaled breath",  //at 5 ppm
            sem3:"City air",  //at 10 ppm
            sem4:"Inside a chimney",  //at 20 ppm
            sem5:"Smoker exhaling"}, //at 400 ppm

        //worked out using formula: kOhm = ppm/2200 (2200 = default Rs for NO2 sensor)
        {id: "sc-no2", name: "no2", label: "NO2", min:110, max:110000,
            sliderVals:[132,176,264,550,2200],
            sem1:"Commercial kitchen",  //at 0.06 ppm
            sem2:"Average roadside",  //at 0.08 ppm
            sem3:"London city centre road junction",  //at 0.12 ppm
            sem4:"No more than 4 hours exposure",  //at 0.25 ppm
            sem5:"No more than 1 hour exposure"}, //at 1 ppm

        {id: "sc-light", name: "light", label: "Light", min:0, max:1000,
            sliderVals:[20,100,300,500,800],
            sem1:"Street lights",  //at 20 lux
            sem2:"Living room lights",  //at 100 lux
            sem3:"Office lights",  //at 300 lux
            sem4:"Overcast day",  //at 500 lux
            sem5:"Daylight"}, //at 800 lux

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

    var idList = [
        {name:"family1",id:"1456"},
        {name:"family2",id:"2345"},
        {name:"family3",id:"3124"},
        {name:"family4",id:"4321"},
        {name:"family5",id:"5123"}
    ]

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
    exports.ids = function(){
        return idList;
    }

    exports.getIdByLoc = function(loc){
        for(var i=0; i<idList.length; i++){
            if(idList[i].name == loc){
                return idList[i].id;
            }
        }
    };

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