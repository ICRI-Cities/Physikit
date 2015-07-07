/**
 * Created by sarahg on 30/05/15.
 */

var dataModel = [];

//data model for all modes, settings and args of each box
function loadDataModel(sensorLabel, boxLabel) {
    var sensor = sensorLabel;
    var box = boxLabel;

    dataModel =
        [
            {
                boxLabel: "Fan",
                boxData: [
                    {
                        modeType: "continuous",
                        modeText: getFan0Text(sensor),
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getFan00Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Which fans should be used?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Using fan A only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using fan B only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using both fans</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: getFan1Text(sensor),
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Pulse the fans 5 times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Which fans should be used?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Using fan A only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using fan B only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using both fans</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: getFan2Text(sensor),
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getFan20Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Please choose the fan pattern",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Using fan A when LOWER and fan B when HIGHER</small></em>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using fan B when LOWER and fan A when HIGHER</small></em>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                boxLabel: "Light",
                boxData: [
                    {
                        modeType: "continuous",
                        modeText: getLight0Text(sensor),
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getLight00Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: getLight01Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: getLight02Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: getLight020Text(box),
                                settingArgs: [
                                    {
                                        argText: "<small><em>Morphing from red to green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Morphing from red to blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Morphing from green to red</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Morphing from green to blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Morphing from blue to red</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Morphing from blue to green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: getLight1Text(sensor),
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Flash the lights 5 times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Show a rainbow pattern</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: getLight2Text(sensor),
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Show UP, DOWN or EQUALS signs</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Change between 3 colours for higher, lower and equal</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Please choose a colour pattern",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Using Red (lower), Green (equal), Blue (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using Red (lower), Blue (equal), Green (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using Green (lower), Red (equal), Blue (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using Green (lower), Blue (equal), Red (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using Blue (lower), Red (equal), Green (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using Blue (lower), Green (equal), Red (higher)</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                boxLabel: "Movement",
                boxData: [
                    {
                        modeType: "continuous",
                        modeText: getMove0Text(sensor),
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getMove00Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Please choose the spin direction",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Clockwise</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Counterclockwise</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: getMove1Text(sensor),
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Shake the rotating plate 5 times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Do one full clockwise rotation</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: getMove2Text(sensor),
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Rotate counterclockwise (lower), not at all (equal) and clockwise (higher)</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    }
                ]
            },
            {
                boxLabel: "Vibration",
                boxData: [
                    {
                        modeType: "continuous",
                        modeText: getBuzz0Text(sensor),
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getBuzz00Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: getBuzz01Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "What vibrators should be active?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Using only the large vibrator</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Using all vibrators</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: getBuzz1Text(sensor),
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>By vibrating a certain number of times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>By vibrating in a pattern</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: getBuzz2Text(sensor),
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: getBuzz20Text(sensor),
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    }
                ]
            }
        ];
}


//getter convenience methods
function getBoxData(boxIndex){
    return dataModel[boxIndex];
}

function getModeData(boxIndex, modeIndex){
    return dataModel[boxIndex].boxData[modeIndex];
}

function getSettingData(boxIndex, modeIndex, settingIndex){
    return dataModel[boxIndex].boxData[modeIndex].modeSettings[settingIndex];
}

function getArgData(boxIndex, modeIndex, settingIndex, argIndex){
    return dataModel[boxIndex].boxData[modeIndex].modeSettings[settingIndex].settingArgs[argIndex];
}

//getter methods for TEXT
//Fan
function getFan0Text(sensor){
     return"<small><em>Show how the <strong>"
        + sensor + "</strong> level is changing constantly</em></small>";
}

function getFan00Text(sensor){
    return "<small><em>Change the speed of the fans to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getFan1Text(sensor){
    return "<small><em>Alert when the <strong>"
        + sensor + "</strong> goes above or below some level</em></small>";
}

function getFan2Text(sensor){
    return "<small><em>Show whether the <strong>"
        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>";
}

function getFan20Text(sensor){
    return "<small><em>Turn on 1 fan to show higher <strong>"
    + sensor + "</strong> levels, turn on the other fan to show lower levels"
    + " and turn both fans off when there is no change</em></small>";
}




//Light
function getLight0Text(sensor){
    return "<small><em>Show how the <strong>"
        + sensor + "</strong> level is changing constantly</em></small>";
}

function getLight00Text(sensor){
    return "<small><em>Turn on different numbers of lights to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getLight01Text(sensor){
    return "<small><em>Change the brightness of lights to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getLight02Text(sensor){
    return "<small><em>Morph between 2 colours to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getLight020Text(box){
    return "What 2 colours should the <strong>" + box + "</strong> box morph between?";
}

function getLight1Text(sensor){
    return "<small><em>Alert when the <strong>"
    + sensor + "</strong> goes above or below some level</em></small>";
}

function getLight2Text(sensor){
    return "<small><em>Show whether the <strong>"
        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>";
}




//Move
function getMove0Text(sensor){
    return "<small><em>Show how the <strong>"
        + sensor + "</strong> level is changing constantly</em></small>";
}

function getMove00Text(sensor){
    return "<small><em>Spin at different speeds to show the current <strong>"
        + sensor + "</strong> level</em></small>"
}

function getMove1Text(sensor){
    return "<small><em>Alert when the <strong>"
        + sensor + "</strong> goes above or below some level</em></small>";
}

function getMove2Text(sensor){
    return "<small><em>Show whether the <strong>"
        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>";
}




//Buzz
function getBuzz0Text(sensor){
    return "<small><em>Show how the <strong>"
        + sensor + "</strong> level is changing constantly</em></small>";
}

function getBuzz00Text(sensor){
    return "<small><em>Turn on different numbers of vibrators to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getBuzz01Text(sensor){
    return "<small><em>Change the vibration speed to show the current <strong>"
        + sensor + "</strong> level</em></small>";
}

function getBuzz1Text(sensor){
    return "<small><em>Alert when the <strong>"
        + sensor + "</strong> goes above or below some level</em></small>";
}

function getBuzz2Text(sensor){
    return "<small><em>Show whether the <strong>"
        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>";
}

function getBuzz20Text(sensor){
    return "<small><em>Vibrate faster when higher, slower when lower and not at all when<strong>"
        + sensor + "</strong> levels stay the same</em></small>";
}