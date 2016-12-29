var SpeakingTestLayer = TestLayer.extend({
    _currentObjectShowUp: null,
    _itemArray: [],
    _soundName: null,
    _remainingTime: 2,
    _touchCounting:0,
    currentObjectShowUpId: 0,
    currentObjectName: null,
    resultText: null,
    _userId:null,
    checkCorrectAction:0,
    _objectName: "",
    _nextSceneName: null,
    _oldSceneName: null,
    _wrongAnswerTime: 0,
    _timesUp: false,
    _eventTimeUp: null,

    ctor: function(data, duration) {
        this._super();
        this.font = "hud-font.fnt";
        this._oldSceneName = SceneFlowController.getInstance().getPreviousSceneName();
        // if(this.getCardGameData())
        //     data = this.getCardGameData();
        this._fetchObjectData(data);
        this._duration = duration;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);
        this._addHudLayer(duration);
        SpeechRecognitionListener.getInstance().setSpeakingLayer(this);
        NativeHelper.callNative("changeAudioRoute");
        // NativeHelper.callNative("changeSpeechLanguageArray", [JSON.stringify(this._itemArray)]);
    },
    _addHudLayer: function(){
        this._super(this._duration)
    },

    onEnter: function() {
        this._super();
        this._addAdiDog();
        this._userId = KVDatabase.getInstance().getString(STRING_USER_ID);
        KVDatabase.getInstance().set("startSceneTime", Date.now()/1000);
        // if (SpeakingTestLayer.shouldSkipTest != null)
        //     this.playBeginSound();
        // else

        if (NativeHelper.callNative("hasGrantPermission", ["RECORD_AUDIO"]))
            this.testBackgroundNoise();
        else {
            NativeHelper.setListener("RequestPermission", this);
            NativeHelper.callNative("requestPermission", ["RECORD_AUDIO"]);
        }

        var self = this;
        this._eventTimeUp = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "event_logout",
            callback: function(event){
                self._timesUp = true;
                // cc.log("_timesUp evnet: " + self._timesUp);
            }
        });
        cc.eventManager.addListener(self._eventTimeUp, 1);
    },

    onRequestPermission: function(succeed) {
        if (succeed)
            this.testBackgroundNoise();
        else {
            NativeHelper.callNative("showMessage", ["Permission Required", "Please enable Microphone permission in Device Setting for TSOG"]);
            this._moveToNextScene();
        }
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        // this.playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
        this._hudLayer.setTotalGoals(this._names.length);
    },

    updateProgressBar: function() {
        var percent = this._touchCounting / this._names.length;

        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._touchCounting);
        this._super();
    },
    
    testBackgroundNoise: function() {
        var self = this;
        var adiBBox = this._adiDog.getBoundingBox();
        var checkingText = new cc.LabelBMFont(localize("Checking noise..."), this.font);
        checkingText.scale = Utils.screenRatioTo43();
        checkingText.x = cc.winSize.width* 0.7;
        checkingText.y = cc.winSize.height/2;
        this.addChild(checkingText, 999);

        var forcePlayBtn = new ccui.Button("timer.png", "", "");
        forcePlayBtn.x = cc.winSize.width - 60;
        forcePlayBtn.y = 120 + forcePlayBtn.height/2;
        forcePlayBtn.addClickEventListener(function() {
            checkingText.removeFromParent();
            NativeHelper.callNative("cancelNoiseDetecting");
            self.stopAllActions();
            self.playBeginSound();
            forcePlayBtn.removeFromParent();
        });
        this.addChild(forcePlayBtn);

        var noiseDetectingTime = GAME_CONFIG.speakingTestNoiseDetectingTime || UPDATED_CONFIG.speakingTestNoiseDetectingTime;  

        NativeHelper.callNative("noiseDetectingLoop", [noiseDetectingTime]);

        this.runAction(cc.sequence(
            cc.delayTime(noiseDetectingTime + 0.5),
            cc.callFunc(function() {
                self._adiDog.adiIdling();
                if (SpeakingTestLayer.shouldSkipTest)
                    checkingText.setString(localize("Too noisy, skip speaking"));
                else
                    checkingText.setString(localize("Let's play speaking"));
            }),
            cc.delayTime(AFTER_CHECKING_NOISE_TIME),
            cc.callFunc(function() {
                if (SpeakingTestLayer.shouldSkipTest)
                    self._moveToNextScene();
                else {
                    self.playBeginSound();
                    forcePlayBtn.removeFromParent();
                };
                SpeakingTestLayer.shouldSkipTest = null;
                checkingText.removeFromParent();
            })
        ))
    },

    playBeginSound: function(){
        cc.log("SpeakingTestLayer playBeginSound");
        self = this;
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 0));
        this.addChild(mask, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);

        var didInstructionSoundPlay = KVDatabase.getInstance().getInt("beginSound_SpeakingTestScene", 0);
        if (didInstructionSoundPlay == 0) {
            // var nation = Utils.getLanguage();
            cc.log("if");
            this._adiDog.adiTalk();
            
            var audioId = jsb.AudioEngine.play2d("res/sounds/sentences/" + localize("begin-speaking") + ".mp3", false);

            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                if (mask)
                    mask.removeFromParent();

                // self._addLabel();
                self._showNextObject();
            });
            // KVDatabase.getInstance().set("beginSound_SpeakingTestScene", 1);
        } else {
            if (mask)
                mask.removeFromParent();
            cc.log("else");
            // self._addLabel();
            this._showNextObject();
        }
    },

    addResultText: function() {
        this._resultTextLb = new cc.LabelBMFont(this.resultText, this.font);
        this._resultTextLb.x = this._adiDog.x - this._resultTextLb.width/2 - 100;
        this._resultTextLb.y = this._adiDog.y + 400;
        this.addChild(this._resultTextLb);
    },  

    incorrectAction: function() {
        var self = this;

        if (!this._adiDog)
            return;

        jsb.AudioEngine.play2d(res.Failed_sfx);
        cc.log("_wrongAnswerTime -> " + this._wrongAnswerTime);

        ConfigStore.getInstance().setBringBackObj(
            this._oldSceneName == "room" ? BEDROOM_ID : FOREST_ID, 
            this.currentObjectName, 
            (this._oldSceneName == "room" ? Global.NumberRoomPlayed : Global.NumberForestPlayed)-1);

        this._timeUp();
        this.runAction(
            cc.sequence(
                cc.delayTime(2),
                cc.callFunc(function() {
                    if (self._wrongAnswerTime < 3)
                        self._wrongAnswerTime++;
                    else
                        self.checkCorrectAction = 0;

                    self._showNextObject();
                })        
            )
        ); 
          
        // }
        var now = Date.now()/1000;
        var deltaTime = now - KVDatabase.getInstance().getInt("startSceneTime", 0);
        SegmentHelper.track(SEGMENT.SPEAK_TEST, { 
            player_id: this._userId, 
            Correct: "incorrectAction",
            objectName: this._objectName,
            timestamp: deltaTime,
            actual_spoken_word:this.resultText
        });
        return false;
    },

    correctAction: function() {
        this.popGold(this._currentObjectShowUp.getPosition());

        this._touchCounting++;
        this.updateProgressBar();
        var self = this;
        cc.log("correctAction");
        jsb.AudioEngine.play2d(res.Succeed_sfx);
        this.runAction(cc.sequence(
            cc.callFunc(function() {
                self._adiDog.adiJump();
            }),
            cc.delayTime(1),
            cc.callFunc(function() {
                self._adiDog.adiHifi();
            }),
            cc.delayTime(2),
            cc.callFunc(function() {
                self.checkCorrectAction = 1;
                self.currentObjectShowUpId++;
                self._wrongAnswerTime = 0;
                self._showNextObject();
            })
        ));
        var now = Date.now()/1000;
        var deltaTime = now - KVDatabase.getInstance().getInt("startSceneTime", 0);
        SegmentHelper.track(SEGMENT.SPEAK_TEST, { 
            player_id: this._userId, 
            Correct: "correctAction",
            objectName: this._objectName,
            timestamp: deltaTime,
            actual_spoken_word:this.resultText

        });
        return false;
    },

    _showNextObject: function() {
        cc.log("speakingtest _showNextObject");
        if (!this._checkCompleted()) {
            if (this._resultTextLb)
                this._resultTextLb.setString("");
            this._showObject();
            // this._remainingTime = 2;
            // this._label.setString(this._remainingTime);
            // this._label.visible = true;
            // this.schedule(this._setLabelString, 1, 1);
            // this._startSpeechRecognizing();    
        }
    },

    _addAdiDog: function() {
        this._adiDog = new AdiDogNode();
        this._adiDog.scale = Utils.screenRatioTo43() *0.8;
        this._adiDog.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));
        this._adiDog.onStartedListening();
        this.addChild(this._adiDog);
    },

    _playObjectSound: function(callback) {
        cc.log("this._soundName: " + this._soundName);
        if (!jsb.fileUtils.isFileExist(this._soundName)) {
            // callback();
            cc.log("no matching file -> currentObjectShowUpId ++");
            this.currentObjectShowUpId++;
            cc.log("_playObjectSound: " + this._currentObjectShowUp);
            
            this._showNextObject();
            return;
        }
        // jsb.AudioEngine.stopAll();
        var audioId = jsb.AudioEngine.play2d(this._soundName);
        jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
            callback && callback(audioId);
        });
        this._adiDog.adiTalk();
    },

    _checkCompleted: function() {
        // cc.log("currentObjectShowUpId: " + this.currentObjectShowUpId);
        // cc.log("this._names.length: " + this._names.length);
        if (this.currentObjectShowUpId >= this._names.length){
            NativeHelper.callNative("stopSpeechRecognition");
            // cc.log("SpeakingTestLayer _checkCompleted");
            this.doCompletedScene();

            return true;
        }
        return false;
    },

    _checkTimeUp: function() {
        var startTime = KVDatabase.getInstance().getInt("timeUp", 0);
        var now = Date.now()/1000;
        return (now - startTime) >= 2;
    },

    _timeUp: function() {
        var self = this;
        this._adiDog.onStoppedListening();
        this._adiDog.adiShakeHead();
        this.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function() { 
                if (self._wrongAnswerTime >= 3)
                    self._playObjectSound();
                else
                    self._adiDog.adiIdling();
            })
        ))
    },

    // _startSpeechRecognizing: function() {
    //     var self = this;
    //     this.runAction(
    //         cc.sequence(
    //             cc.delayTime(3),
    //             cc.callFunc(function() {
    //                 NativeHelper.callNative("startSpeechRecognition", [5000]);
    //                 KVDatabase.getInstance().set("timeUp", Date.now()/1000);
    //                 self._adiDog.onStartedListening();
    //             })
    //         )
    //     )
    // },

    _addLabel: function(text) {
        text = text || "";
        this._label = null;
        this._label = new cc.LabelBMFont(text, this.font);
        
        this._label.x = cc.winSize.width / 2;
        this._label.y = cc.winSize.height - 100;
        this.addChild(this._label, 10000);    

        var self = this;
        this._label.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function() {
                self._label.removeFromParent();
            })
        ))
    },

    _showObject: function() {
        if (this._currentObjectShowUp) {
            // cc.log("removeFromParent");
            this._currentObjectShowUp.removeFromParent();
            this._currentObjectShowUp = null;
        };


        var isNumber = false;
        var isWord = false;
        var spritePath = "";
        var objectName = this._names[this.currentObjectShowUpId].toLowerCase();

        var d = this.getStoryTimeForSpeakingData();
        if (d) {
            this.storytimeCurrentDataIndex++;
            // cc.log("d SpeakingTestLayer :  " + JSON.stringify(d));
            objectName = d[this.storytimeCurrentDataIndex];
        }
        this._soundName = "";
        var soundNamePrefix = "res/SD/";
        if (jsb.fileUtils.isFileExist(soundNamePrefix + "objects/" + objectName + ".png")) {
            // object case
            this._soundName = "res/sounds/words/" + localize(objectName) + ".mp3";
            this._objectName = "objects/" + objectName;
        } else {
            // animal case
            if (jsb.fileUtils.isFileExist(soundNamePrefix + "animals/" + objectName + ".png")) {
                this._soundName = "res/sounds/words/" + localize(objectName) + ".mp3";
                this._objectName = "animals/" + objectName;
            } else {
                // word case
                this._soundName = "res/sounds/alphabets/" + localize(objectName) + ".mp3";

                // number case
                var number = parseInt(this._names[this.currentObjectShowUpId]);
                this._objectName = number;
                if (!isNaN(number)) {
                    spritePath = this._names[this.currentObjectShowUpId];
                    isNumber = true;
                }
                else {
                    isWord = true;
                    spritePath = this._names[this.currentObjectShowUpId];
                };
                // cc.log("spritePath: " + spritePath);
                
                if (!jsb.fileUtils.isFileExist(this._soundName))
                    this._soundName = "res/sounds/numbers/" + localize(number) + ".mp3";

                // color case
                var name = this._names[this.currentObjectShowUpId].toLowerCase();
                if (name.indexOf("color") > -1) {
                    var namePrefix = name.substr(name.indexOf("_") + 1, name.length-1)
                    objectName = "#btn_" + namePrefix;
                    this._soundName = "res/sounds/colors/" + localize(namePrefix) + ".mp3";
                }

                if (name.indexOf("shape") > -1) { // TODO SPEAKING TEST FOR SHAPES
                    // var namePrefix = name.substr(name.indexOf("_") + 1, name.length-1)
                    this._soundName = "res/sounds/shapes/" + localize(objectName) + ".mp3";
                }
            }
        };
        var objectTempName = this._names[this.currentObjectShowUpId];
        // cc.log("objectName: " + objectName);
        // cc.log("_soundName: " + this._soundName);
        if (objectTempName.indexOf("color") > -1) {
            objectTempName = objectTempName.substr(objectTempName.indexOf("_") + 1, objectTempName.length-1);
        };
        this.currentObjectName = objectTempName;
        var self = this;
        if (isNumber || isWord)
            this._currentObjectShowUp = new cc.LabelBMFont(objectTempName, res.CustomFont_fnt);
        else    
            this._currentObjectShowUp = new cc.Sprite(this._objectName + ".png");
        this._currentObjectShowUp.x = cc.winSize.width/3*2 + 100;
        this._currentObjectShowUp.y = cc.winSize.height/2;
        this._currentObjectShowUp.scale = 250 / this._currentObjectShowUp.width;
        this.addChild(this._currentObjectShowUp);
        this._playObjectSound(function(audioId) {
            // cc.log("self._timesUp:" + self._timesUp);
            if(self._timesUp) 
                return;
            // cc.log("speakingtest startSpeechRecognition");
            self._addLabel("GO");
            NativeHelper.callNative("startSpeechRecognition", [5000]);
            KVDatabase.getInstance().set("timeUp", Date.now()/1000);
            self._adiDog.onStartedListening();
        });
        
        // cc.log("currentObjectName: " + objectName);
        // cc.log("_currentObjectShowUp: " + this._currentObjectShowUp);

        AnimatedEffect.create(this._currentObjectShowUp, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);

        if (this._wrongAnswerTime > 2) {
            this.currentObjectShowUpId +=1;
            this._wrongAnswerTime = 0;
        }
    },

    _fetchObjectData: function(data) {
        var dataForWriting = data;
        
        this._data = data;
        if(typeof(data) != "object")
            data = JSON.parse(data);
        // cc.log("_fetchObjectData data: " + data);
        if (data)
            this._names = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0].value;
                else
                    return id;
            });
        else
            this._data = []; 
        if(!dataForWriting[0].dataSpeaking)
        dataForWriting  = this._data;   
        this.setData(dataForWriting);
        // cc.log("data after map: " + JSON.stringify(this._names));
    },


    onExit: function () {
        cc.eventManager.removeListener(this._eventTimeUp);
        this.removeStoryTimeForSpeakingData();
        NativeHelper.removeListener("RequestPermission");

        NativeHelper.callNative("changeAudioRoute");

        this._super();
    },
});

SpeakingTestLayer.shouldSkipTest = null;

var SpeakingTestScene = cc.Scene.extend({
    ctor: function(data, duration){
        this._super();

        var layer = new SpeakingTestLayer(data, duration);
        this.addChild(layer);
    }
});
