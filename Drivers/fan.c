int value = 0;
int mode = 0;
int setting = 0;
int args=0;

int localValueCount = 0;
long previousMillis = 0; 
long interval; 
bool on=false;
bool toggle =false;
bool hasRun = false;

int fana = D0;
int fanb = D1;

void setup() {   
    Spark.function("run", controlHandler);
    Spark.variable("value",&value,INT);
    Spark.variable("mode",&mode,INT);
    Spark.variable("args",&args,INT);
    Spark.variable("setting",&setting,INT);
    
     pinMode(fana, OUTPUT);
     pinMode(fanb, OUTPUT);
} 


//code in this function is run continuously
void loop() { 
    if(mode ==1 || mode ==3)
    {
        if(value==0){
            if(hasRun)
            {
                return;
            }
            
            analogWrite(fana,value);
            analogWrite(fanb,value);
        }
        else{
            if(hasRun)
                return;
            
            if(localValueCount == value*2)
                return;
                
            unsigned long currentMillis = millis();
    
             if(currentMillis - previousMillis > interval) 
             {
                previousMillis = currentMillis;   
                
                if(mode == 1){
                    ControlFans(args,on ? value:0);
                }
                else if(mode == 3){
                    ControlFans(toggle ? 0:1 , on ? value:0);
                }
          
                
                on = !on;
                
                if (localValueCount % 2)
                    toggle =!toggle;
                    
                localValueCount++;
             }
        }

    }
}

void ControlFans(int fans, int level){
    if(fans == 0){
        analogWrite(fana,level);
        analogWrite(fanb,0);
    }
    else if(fans == 1){
        analogWrite(fanb,level);
        analogWrite(fana,0);
    } 
    else 
    {
        analogWrite(fana,level);
        analogWrite(fanb,level);
    }
}


//code in this function is run once after the core
//receives an update
void RunCode(){
    
    //Reset interval
    hasRun = false;
    
    //Reset times we've run the interval
    localValueCount = 0;
    
    //If no setting is given, set it to 1
    if(setting ==0)
    {
        setting =1;   
    }
    
    //Interval is calculated from setting
    interval = setting*1000;
    
    //If mode is 0, simply set the fans    
    if(mode == 0)
    {
        ControlFans(args,value);
    }
    //If mode is 2, we use relative values
    else if(mode ==2)
    {
        //Value of zero turns left fan on
        if(value == 0)
        {
          ControlFans(0,255);
        } 
        //Value of 2 turns right fan on
        else if(value == 2)
        {
            ControlFans(1,255);
        }
    }

}

//handler for incoming messages
int controlHandler(String command){
	//input format should be "a-b-c-d" where 
     //a is a value between 0 and 9
     //b is a value between 0 and 9
     //c is a value between 0 and 9
     //d is a value between 0 and 255

     boolean validCommand = true;

    //Grab the mode
    mode = (command.charAt(0) - '0');
    if(mode < 0 || mode > 9){
        validCommand = false;
    }

    //Grab the setting
    setting = (command.charAt(2) - '0');
    if(setting < 0 || setting > 9){
        validCommand = false;
    }

    //Grab the arg
    args = (command.charAt(4) - '0');
    if(args < 0 || args > 9){
        validCommand = false;
    }

	//Grab the value 
    char * params = new char[5];
    strcpy(params, command.substring(6,9).c_str());

    value = atoi(params);
    if(value < 0 || value > 255){
        validCommand = false;
    }

    if(validCommand){
        //Publish the updated values to any clients listening
        Spark.publish("message",command);
    
	   //Run code once
	   RunCode();
    }

    //http 'OK' return
    return 200;
}
