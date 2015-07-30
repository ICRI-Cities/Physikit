/**
 * Created by sarahg on 30/07/15.
 */

//TABS
//assign location names (families) to tabs based on who has logged in
function assignTabs(identifier){

    var locations = window.common.locations();
    var locIndex = window.common.getLocationIndex(identifier);

    //do this statically to ensure consistency
    switch(locIndex){
        case 0: $("#tab-one").val(locations[0].name);  //set location name in tab hidden input
            $("#tab-two").val(locations[1].name);
            $("#tab-three").val(locations[2].name);
            $("#tab-four").val(locations[3].name);
            $("#tab-five").val(locations[4].name);
            $("#tab1-label").html(locations[0].label); //set labels on tabs
            $("#tab2-label").html(locations[1].label);
            $("#tab3-label").html(locations[2].label);
            $("#tab4-label").html(locations[3].label);
            $("#tab5-label").html(locations[4].label);
            var url = locations[0].background;
            $("#tab-background").css("background-image", "url("+url+")");
            break;
        case 1: $("#tab-one").val(locations[1].name);
            $("#tab-two").val(locations[0].name);
            $("#tab-three").val(locations[2].name);
            $("#tab-four").val(locations[3].name);
            $("#tab-five").val(locations[4].name);
            $("#tab1-label").html(locations[1].label);
            $("#tab2-label").html(locations[0].label);
            $("#tab3-label").html(locations[2].label);
            $("#tab4-label").html(locations[3].label);
            $("#tab5-label").html(locations[4].label);
            var url = locations[1].background;
            $("#tab-background").css("background-image", "url("+url+")");
            break;
        case 2: $("#tab-one").val(locations[2].name);
            $("#tab-two").val(locations[0].name);
            $("#tab-three").val(locations[1].name);
            $("#tab-four").val(locations[3].name);
            $("#tab-five").val(locations[4].name);
            $("#tab1-label").html(locations[2].label);
            $("#tab2-label").html(locations[0].label);
            $("#tab3-label").html(locations[1].label);
            $("#tab4-label").html(locations[3].label);
            $("#tab5-label").html(locations[4].label);
            var url = locations[2].background;
            $("#tab-background").css("background-image", "url("+url+")");
            break;
        case 3: $("#tab-one").val(locations[3].name);
            $("#tab-two").val(locations[0].name);
            $("#tab-three").val(locations[1].name);
            $("#tab-four").val(locations[2].name);
            $("#tab-five").val(locations[4].name);
            $("#tab1-label").html(locations[3].label);
            $("#tab2-label").html(locations[0].label);
            $("#tab3-label").html(locations[1].label);
            $("#tab4-label").html(locations[2].label);
            $("#tab5-label").html(locations[4].label);
            var url = locations[3].background;
            $("#tab-background").css("background-image", "url("+url+")");
            break;
        case 4: $("#tab-one").val(locations[4].name);
            $("#tab-two").val(locations[0].name);
            $("#tab-three").val(locations[1].name);
            $("#tab-four").val(locations[2].name);
            $("#tab-five").val(locations[3].name);
            $("#tab1-label").html(locations[4].label);
            $("#tab2-label").html(locations[0].label);
            $("#tab3-label").html(locations[1].label);
            $("#tab4-label").html(locations[2].label);
            $("#tab5-label").html(locations[3].label);
            var url = locations[4].background;
            $("#tab-background").css("background-image", "url("+url+")");
            break;
        default: console.log("tabs not assigned!");
            return;
    }
    //set active tab
    $( "#location_tabs" ).tabs().tabs({ active: 0 });
}


//get the currently active tab and return the location
//associated with this tab
function getActiveLocation(){
    var tabIndex = $("#location_tabs").tabs('option', 'active');
    switch(tabIndex){
        case 0: return $("#tab-one").val();
        case 1: return $("#tab-two").val();
        case 2: return $("#tab-three").val();
        case 3: return $("#tab-four").val();
        case 4: return $("#tab-five").val();
        default: console.log("no active tab found");
            return;
    }
}

//update tabs and jsplumb connections
//when tab change occurs
function handleTabChange(activeRef){
    var locationName = "";

    if(activeRef == "#tabOne"){
        locationName = $("#tab-one").val();  //e.g. "family1"
    }else if(activeRef == "#tabTwo"){
        locationName = $("#tab-two").val();
    }else if(activeRef == "#tabThree"){
        locationName = $("#tab-three").val();
    }else if(activeRef == "#tabFour"){
        locationName = $("#tab-four").val();
    }else if(activeRef == "#tabFive"){
        locationName = $("#tab-five").val();
    }

    //set tab background
    var url = window.common.getLocationByName(locationName).background;
    $("#tab-background").css("background-image", "url("+url+")");

    //update jsPlumb connections
    refreshConnectionView(locationName);
}