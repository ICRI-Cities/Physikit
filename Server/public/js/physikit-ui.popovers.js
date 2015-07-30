/**
 * Created by sarahg on 30/07/15.
 */
//POPOVERS

//Popover content handlers
//reset popover content on rule removal
function resetPopContent(cubeName){
    if (cubeName == "fan") {
        $("#pk-fan").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "light") {
        $("#pk-led").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "move") {
        $("#pk-motion").attr('data-content', "Not connected to any sensor");
    } else if (cubeName == "buzz") {
        $("#pk-vibro").attr('data-content', "Not connected to any sensor");
    }
}

//update popover content on new rule creation
function updatePopContent(cubeName, sensorName, locationName, mode, setting, arg){

    var cubeLabel = window.common.getCubeByName(cubeName).label;
    var sensorLabel = window.common.getSensorByName(sensorName).label;
    var locationLabel = window.common.getLocationByName(locationName).label;

    //set sensor and cube labels in dataModel
    loadDataModel(sensorLabel, cubeLabel);

    //get text for popover
    var cubeIndex = window.common.getCubeIndexByName(cubeName);
    var modeText = getModeData(cubeIndex, mode).modeText;
    var settingText = getSettingData(cubeIndex, mode, setting).settingText;
    //check if there is any arg text
    var argText = "";
    var settingArgs = getSettingData(cubeIndex, mode, setting).settingArgs;
    if (settingArgs.length > 0) {
        argText = getArgData(cubeIndex, mode, setting, arg).argText;
    }

    var popText = "<div>Connected to: <strong>" + sensorLabel + " sensor </strong><br>"
        + "From: <strong>" + locationLabel + "</strong><br><br>";
    if (modeText != undefined) {
        popText = popText + cubeLabel + " cube will: <br>" + modeText + ". It will: ";
    }
    if (settingText != undefined) {
        popText = popText + settingText +". ";
    }
    if (argText != "") {
        popText = popText + argText +".";
    }
    popText = popText+"</div>";

    //set text in popover
    if (cubeName == "fan") {
        $("#pk-fan").attr('data-content', popText);
    } else if (cubeName == "light") {
        $("#pk-led").attr('data-content', popText);
    } else if (cubeName == "move") {
        $("#pk-motion").attr('data-content', popText);
    } else if (cubeName == "buzz") {
        $("#pk-vibro").attr('data-content', popText);
    }
}