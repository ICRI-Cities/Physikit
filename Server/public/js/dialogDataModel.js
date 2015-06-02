/**
 * Created by sarahg on 30/05/15.
 */

//data model for all modes, settings and args of each box
var dataModel = [];

function loadDataModel(sensor) {
    dataModel =
        [
            {
                boxLabel: "Fan",
                boxData: [
                    {
                        modeType: "continuous",
                        modeText: "<small><em>Show how the <strong>"
                        + sensor + "</strong> level is changing constantly</em></small>",
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Change the speed of the fans to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Which fans should be used?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Fan A only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Fan B only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Both fans</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: "<small><em>Alert when the <strong>"
                        + sensor + "</strong> goes above or below some level</em></small>",
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Pulse the fans 5 times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Which fans should be used?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Fan A only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Fan B only</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Both fans</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: "<small><em>Show whether the <strong>"
                        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>",
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Turn on 1 fan to show higher <strong>"
                                + sensor + "</strong> levels, turn on the other fan to show lower levels"
                                + " and turn both fans off when there is no change</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Please choose the fan pattern",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Lower = Fan A, Higher = Fan B</small></em>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Fan B, Higher = Fan A</small></em>",
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
                        modeText: "<small><em>Show how the <strong>"
                        + sensor + "</strong> level is changing constantly</em></small>",
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Turn on different number of lights to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Change brightness of lights to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Morph between 2 colours to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "What 2 colours should the <strong>" + box + "</strong> box morph between?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Red to Green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Red to Blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Green to Red</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Green to Blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Blue to Red</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Blue to Green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: "<small><em>Alert when the <strong>"
                        + sensor + "</strong> goes above or below some level</em></small>",
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Flash lights a certain number of times </em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Show a rainbow pattern </em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: "<small><em>Show whether the <strong>"
                        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>",
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Show UP, DOWN or EQUALS signs</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Change between 3 colours representing higher, lower and equal</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "Please choose a colour pattern",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Lower = Red, Equal = Green, Higher = Blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Red, Equal = Blue, Higher = Green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Green, Equal = Red, Higher = Blue</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Green, Equal = Blue, Higher = Red</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Blue, Equal = Red, Higher = Green</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>Lower = Blue, Equal = Green, Higher = Red</em></small>",
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
                        modeText: "<small><em>Show how the <strong>"
                        + sensor + "</strong> level is changing constantly</em></small>",
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: "<small><em>Alert when the <strong>"
                        + sensor + "</strong> goes above or below some level</em></small>",
                        imageURL: "",
                        modeSettings: [
                            {
                                settingText: "",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: "<small><em>Show whether the <strong>"
                        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>",
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "",
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
                        modeText: "<small><em>Show how the <strong>"
                        + sensor + "</strong> level is changing constantly</em></small>",
                        imageURL: "ui/images/continuous-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Turn on different number of vibrators to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Change the vibration speed to show the current <strong>"
                                + sensor + "</strong> level</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "What vibrators should be active?",
                                settingArgs: [
                                    {
                                        argText: "<small><em>Only the large one</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    },
                                    {
                                        argText: "<small><em>All of them</em></small>",
                                        imageURL: "ui/images/alert-data-icon.png"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        modeType: "alert",
                        modeText: "<small><em>Alert when the <strong>"
                        + sensor + "</strong> goes above or below some level</em></small>",
                        imageURL: "ui/images/alert-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Vibrate a certain number of times</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Vibrate in a pattern</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    },
                    {
                        modeType: "relative",
                        modeText: "<small><em>Show whether the <strong>"
                        + sensor + "</strong> level is getting higher,lower or staying the same</em></small>",
                        imageURL: "ui/images/relative-data-icon.png",
                        modeSettings: [
                            {
                                settingText: "<small><em>Vibrate in an up or down pattern to show higher or lower <strong>"
                                + sensor + "</strong> levels</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Vibrate top, bottom and middle of the box to show higher, lower or equal <strong>"
                                + sensor + "</strong> levels</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            },
                            {
                                settingText: "<small><em>Vibrate left, inside and right of box to show higher, lower or equal <strong>"
                                + sensor + "</strong> levels</em></small>",
                                imageURL: "ui/images/alert-data-icon.png",
                                argQuestion: "",
                                settingArgs: []
                            }
                        ]
                    }
                ]
            }
        ]
}