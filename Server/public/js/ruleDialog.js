/**
 * Created by sarahg on 28/05/15.
 */

var sensor = "";  //smartcitizen sensor connecting from
var box = "";  //physikit box connecting to

//TMP for testing only
var newRule = {
    sensorLoc: "",
    boxIndex: 0,
    modeIndex: 0,
    settingIndex: 0,
    argIndex: 0,
    sliderVal: -1
};

function createRule(sensorData, sensorLoc, boxData){
    sensor = sensorData;
    box = boxData;

    //load data model with the sensor name
    loadDataModel(sensorData.label, boxData.label);

    //reset rule
    newRule.sensorLoc = sensorLoc;
    newRule.boxIndex = 0;
    newRule.modeIndex = 0;
    newRule.settingIndex = 0;
    newRule.argIndex = 0;
    newRule.sliderVal = -1;

    //show mode dialog
    getMode();
}

//Pop-up dialogues for rule creation
function getMode(){

    //create html for this box
    var html = "";
    for(var i=0; i<dataModel.length; i++){
        var next_box = dataModel[i];
        if(next_box.boxLabel == box.label){
            var current_data = next_box.boxData;
            newRule.boxIndex = i;

            //check if there is only 1 mode
            if(current_data.length == 1){
                newRule.modeIndex = 0;
                html = html
                    + "<h5>The "+box.label+" box will: </h5>"
                    + current_data[0].modeText;

                $("#modeQuestion").html('');
                $("#modeOptions").html('');
                $("#modeMessage").html(html);

            }else {
                //show mode options for box
                html = html
                    + "<div id='mode-form-group' class='form-group has-success'>";
                for (var j = 0; j < current_data.length; j++) {
                    var next_data = current_data[j];
                    html = html
                        + "<div class='radio'>"
                        + "<label><input type='radio' name='modeRadio' value=" + j + ">"
                        + "<img src='"
                        + next_data.imageURL
                        + "' width='50' height='50'style='margin-right: 10px'/>"
                        + next_data.modeText
                        + "</label></div>";
                }
                html = html + "</div>";

                //initialise modal
                $("#modeQuestion").html(
                    "What would you like the <strong>"+box.label+"</strong> box to do?"
                );
                $("#modeOptions").html(html);
                $("#modeMessage").html('');
            }
            break;
        }
    }

    //show modal dialog
    $("#modeModal").modal({"backdrop": "static"});
}

function getSetting(){

    if(validatedMode()) {

        //create html for settings for this box and mode
        var html = "";
        var current_data_mode = getModeData(newRule.boxIndex, newRule.modeIndex).modeType;
        var current_settings = getModeData(newRule.boxIndex, newRule.modeIndex).modeSettings;

        //check if there is only 1 setting for current mode
        if (current_settings.length == 1) {
            newRule.settingIndex = 0;
            html = html
                + "<h5>The " + box.label + " box will: </h5>"
                + current_settings[0].settingText;

            //if mode is of type 'alert' - add slider
            if (current_data_mode.modeType == "alert") {

                //add slider
                html = html
                    + "<br><br>"
                    + "<h5>At what " + sensor.label + " level would you like the " + box.label + " box to alert?</h5>"
                    + "<b>Low</b><input id='alertSlider' data-slider-id='alertLevelSlider' type='text' "
                    + "data-slider-min='0' data-slider-max='10' data-slider-step='1' "
                    + "data-slider-value='5' data-slider-tooltip='hide'/>"
                    + "<b>High</b>";

            }
            $("#settingQuestion").html('');
            $("#settingOptions").html('');
            $("#settingMessage").html(html);

        } else {
            //create html for options
            html = html
                + "<div id='setting-form-group' class='form-group has-success'>";
            for (var i = 0; i < current_settings.length; i++) {
                var next_setting = current_settings[i];
                html = html
                    + "<div class='radio'>"
                    + "<label><input type='radio' name='settingRadio' value=" + i + ">"
                    + "<img src='"
                    + next_setting.imageURL
                    + "' width='50' height='50'style='margin-right: 10px'/>"
                    + next_setting.settingText
                    + "</label></div>";
            }
            html = html+"</div>";

            //if mode is of type 'alert' - add slider
            if (current_data_mode.modeType == "alert") {

                //add slider
                html = html
                    + "<br><br>"
                    + "<h5>At what " + sensor.label + " level would you like the " + box.label + " box to alert?</h5>"
                    + "<b>Low</b><input id='alertSlider' data-slider-id='alertLevelSlider' type='text' "
                    + "data-slider-min='0' data-slider-max='10' data-slider-step='1'"
                    + "data-slider-value='5' data-slider-tooltip='hide'/>"
                    + "<b>High</b>";

            }

            //initialise and display the setting modal
            $("#settingQuestion").html(
                "How would you like the " + box + " box to do this?"
            );
            $("#settingOptions").html(html);
            $("#settingMessage").html('');
        }

        //show setting modal dialog
        $("#settingModal").modal({"backdrop": "static"});
    }
}

function getArgs(){

    //validate setting modal
    if(validatedSetting()){
        //read settingIndex from setting modal if it exists
        var tmpIndex = $("input[name='settingRadio']:checked").val();
        if(tmpIndex != undefined){
            newRule.settingIndex = tmpIndex;
        }

        //read alert slider value from setting modal if it exists
        var tmpSlider = $("input[name=sliderVal]").val();
        if(tmpSlider != ''){
            newRule.sliderVal = tmpSlider;
        }

        //create html for args (if any) for this box, mode and setting
        var html = "";
        var current_data_setting = getSettingData(newRule.boxIndex, newRule.modeIndex, newRule.settingIndex);
        var current_args = current_data_setting.settingArgs;

        //check if there are any args for this mode and setting
        if(current_args.length > 0){
            //create html for args
            html = html
                + "<div id='arg-form-group' class='form-group has-success'>";
            for(var i=0; i<current_args.length; i++) {
                var next_arg = current_args[i];
                html = html
                    + "<div class='radio'>"
                    + "<label><input type='radio' name='argRadio' value="+i+">"
                    + "<img src='"
                    + next_arg.imageURL
                    + "' width='50' height='50'style='margin-right: 10px'/>"
                    + next_arg.argText
                    + "</label></div>";
            }
            html = html+"</div>";

            //show args modal
            $("#argQuestion").html(current_data_setting.argQuestion);
            $("#argOptions").html(html);
            $("#argModal").modal({"backdrop": "static"});
        }else{
            //no args to show - display finalise rule modal
            storeNewRule();
        }
    }
}

function finaliseRule(){

    //validate args modal
    if(validatedArgs()){
        //read argsIndex from args modal
        newRule.argIndex = $("input[name='argRadio']:checked").val();

        storeNewRule();
    }
}

function storeNewRule(){

    //push rule to server
    Send(
        box.name,
        sensor.name,
        newRule.sensorLoc,
        newRule.modeIndex,
        newRule.settingIndex,
        newRule.argIndex,
        0  //TODO: check if value is needed
    );

    console.log("New rule sent to database: " +box.name+", "+sensor.name+", "+newRule.sensorLoc+" -> "
        +newRule.modeIndex+"-"+newRule.settingIndex+"-"+newRule.argIndex);
    //if(newRule.sliderVal > -1){
      //  console.log("sliderVal = "+newRule.sliderVal);
    //}

    //update popover with content for new connection
    updatePopContent(box.name, sensor.name, newRule.sensorLoc, newRule.modeIndex, newRule.settingIndex, newRule.argIndex);

    //close all modals
    closeAllModals();
}

function closeAllModals(){
    $("#confirmModal").modal("hide");
    $("#argModal").modal("hide");
    $("#settingModal").modal("hide");
    $("#modeModal").modal("hide");
}

function validatedMode(){
    if (!isEmpty($('#modeOptions'))) {
        var tmpIndex = $("input[name='modeRadio']:checked").val();
        if(tmpIndex != undefined) {
            newRule.modeIndex = tmpIndex;

            //remove all errors highlight
            $("#mode-form-group").removeClass('has-error').addClass('has-success');

        }else{
            //add errors highlight
            $("#mode-form-group").removeClass('has-success').addClass('has-error');

            return false;
        }
    }
    return true;
}

function validatedSetting(){
    //validate setting modal
    if (!isEmpty($('#settingOptions'))) {
        var tmpIndex = $("input[name='settingRadio']:checked").val();
        if(tmpIndex != undefined){
            newRule.settingIndex = tmpIndex;

            //remove all errors highlight
            $("#setting-form-group").removeClass('has-error').addClass('has-success');

        }else{
            //add errors highlight
            $("#setting-form-group").removeClass('has-success').addClass('has-error');

            return false;
        }
    }
    return true;
}

function validatedArgs(){
    //validate args modal
    var tmpIndex = $("input[name='argRadio']:checked").val();
    if(tmpIndex != undefined){
        newRule.argIndex = tmpIndex;

        //remove all errors highlight
        $("#arg-form-group").removeClass('has-error').addClass('has-success');

    }else{
        //add errors highlight
        $("#arg-form-group").removeClass('has-success').addClass('has-error');

        return false;
    }
    return true;
}

function isEmpty( el ){
    return !$.trim(el.html())
}