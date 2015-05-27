int N = 3;
int vibeR[3]= {0,1,2};
int vibeL[3]= {3,4,5};
int vibeXL = 6;

int value = 0;
int arg = 0;
int setting = 0;
int mode = 0;
int reference = 0;

boolean on = false;

void setup() {
    Spark.function("run", controlHandler);
    Spark.variable("value",&value,INT);
    Spark.variable("arg",&arg,INT);
    Spark.variable("setting",&setting,INT);
    Spark.variable("mode",&mode,INT);
    for (int i = 0; i<N; i++)
    {
        pinMode(vibeR[i], OUTPUT);
        pinMode(vibeL[i], OUTPUT);
    }
    pinMode(vibeXL, OUTPUT);
}
//code in this function is run continuously
void loop() {
    if(mode == 0&& setting == 1&&value>0)
    {
        int timing = 64000/value;
        //int timing = (258-value)*25;
        if(millis()>reference+timing && on == false)
        {
            if (arg == 0)
            {
                digitalWrite(vibeXL,HIGH);
            }
            if(arg>0)
            {
                for (int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], HIGH);
                    digitalWrite(vibeL[i], HIGH);
                }
            }
            reference = millis();
            on = true;
        }
        if(millis()>reference+300 && on == true)
        {
            if(arg == 0)
            {
                digitalWrite(vibeXL,LOW);
            }
            if(arg>0)
            {
                for (int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], LOW);
                    digitalWrite(vibeL[i], LOW);
                }
            }
            reference = millis();
            on = false;
        }

    }

}

//code in this function is run once after the core
//receives an update
void RunCode(){
    for (int i = 0; i<N; i++)
    {
        digitalWrite(vibeR[i], LOW);
        digitalWrite(vibeL[i], LOW);
    }
    digitalWrite(vibeXL, LOW);
    switch (mode)
    {
        case 0:
        if(setting == 0)
        {
            for(int i = 0; i<N; i++)
            {
                if(value>(i*64))
                {
                    digitalWrite(vibeR[i], HIGH);
                    digitalWrite(vibeL[i], HIGH);
                }
            }
            if(value>192)
            {
                digitalWrite(vibeXL,HIGH);
            }
        }
        if(setting == 1)
        {
            reference = millis();
            on = false;

        }
        break;
        case 1:
        if(setting == 0)
        {
            for(int j = 0; j<value; j++)
            {
                digitalWrite(vibeXL,HIGH);
                for (int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], HIGH);
                    digitalWrite(vibeL[i], HIGH);
                }
                delay(300);
                digitalWrite(vibeXL,LOW);
                for (int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], LOW);
                    digitalWrite(vibeL[i], LOW);
                }
                delay(300);
            }
        }
        if(setting == 1)
        {
            for(int j = 0; j<2; j++)
            {
                for(int i = 0; i<N; i++)
                {
                    if(value>(i*64))
                    {
                        digitalWrite(vibeR[i], HIGH);
                        digitalWrite(vibeL[i], HIGH);
                    }
                }
                if(value>192)
                {
                    digitalWrite(vibeXL,HIGH);
                }
                delay(300);
                for(int i = 0; i<N; i++)
                {
                    if(value>(i*64))
                    {
                        digitalWrite(vibeR[i], LOW);
                        digitalWrite(vibeL[i], LOW);
                    }
                }
                if(value>192)
                {
                    digitalWrite(vibeXL,LOW);
                }
                delay(300);
            }

        }
        break;
        case 2:
        if(setting == 0)
        {
            if(value == 2)
            {
                for(int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], HIGH);
                    digitalWrite(vibeL[i], HIGH);
                    delay(300);
                    digitalWrite(vibeR[i], LOW);
                    digitalWrite(vibeL[i], LOW);
                    delay(300);
                    digitalWrite(vibeR[i], HIGH);
                    digitalWrite(vibeL[i], HIGH);
                    delay(300);
                    digitalWrite(vibeR[i], LOW);
                    digitalWrite(vibeL[i], LOW);
                    delay(300);
                }
            }
            else if(value == 0)
            {
                for(int i = 1; i<(N+1); i++)
                {
                    digitalWrite(vibeR[N-i], HIGH);
                    digitalWrite(vibeL[N-i], HIGH);
                    delay(300);
                    digitalWrite(vibeR[N-i], LOW);
                    digitalWrite(vibeL[N-i], LOW);
                    delay(300);
                    digitalWrite(vibeR[N-i], HIGH);
                    digitalWrite(vibeL[N-i], HIGH);
                    delay(300);
                    digitalWrite(vibeR[N-i], LOW);
                    digitalWrite(vibeL[N-i], LOW);
                    delay(300);
                }
            }
        }
        else if(setting == 1)
        {
            digitalWrite(vibeR[value], HIGH);
            digitalWrite(vibeL[value], HIGH);
        }
        else if(setting == 2)
        {
            if(value == 0)
            {
                for(int i = 0; i<N; i++)
                {
                    digitalWrite(vibeL[i], HIGH);
                }
            }
            else if(value == 2)
            {
                for(int i = 0; i<N; i++)
                {
                    digitalWrite(vibeR[i], HIGH);
                }
            }
            else if(value == 1)
            {
                digitalWrite(vibeXL, HIGH);
            }
        }
        break;
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
    arg = (command.charAt(4) - '0');
    if(arg < 0 || arg > 9){
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