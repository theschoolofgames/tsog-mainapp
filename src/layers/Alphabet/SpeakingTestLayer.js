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

    ctor: function(objectsArray, oldSceneName) {
        this._super();
        this.font = "hud-font.fnt";
        this._oldSceneName = oldSceneName;
        // this._currentScene = currentScene;
        // cc.log("currentScene: %s", currentScene); 

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) {return true;}
        }, this);

        
        this._names = objectsArray.map(function(obj) {
            return obj.name.toUpperCase();
        });
        SpeechRecognitionListener.getInstance().setSpeakingLayer(this);

        // NativeHelper.callNative("changeSpeechLanguageArray", [JSON.stringify(this._itemArray)]);
    },

    onEnter: function() {
        this._super();
        
        this._addAdiDog();
        this._userId = KVDatabase.getInstance().getString(STRING_USER_ID);
        KVDatabase.getInstance().set("startSceneTime", Date.now()/1000);

        if (SpeakingTestLayer.shouldSkipTest != null)
            this.playBeginSound();
        else
            this.testBackgroundNoise();
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        // this.playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    updateProgressBar: function() {
        var percent = this._touchCounting / this._names.length;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);

        var starEarned = 0;
        var objectCorrected = this._touchCounting;
        var starGoals = this.countingStars();
        if (objectCorrected >= starGoals.starGoal1 && objectCorrected < starGoals.starGoal2)
            starEarned = 1;
        if (objectCorrected >= starGoals.starGoal2 && objectCorrected < starGoals.starGoal3)
            starEarned = 2;
        if (objectCorrected >= starGoals.starGoal3)
            starEarned = 3;

        this._hudLayer.setStarEarned(starEarned);

        if (starEarned > 0)
            this._hudLayer.addStar("light", starEarned);
    },
    countingStars: function() {
        var starGoal1 = Math.ceil(this._names.length/3);
        var starGoal2 = Math.ceil(this._names.length/3 * 2);
        var starGoal3 = this._names.length;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },
    testBackgroundNoise: function() {
        var self = this;
        var adiBBox = this._adiDog.getBoundingBox();
        var checkingText = new cc.LabelBMFont("Checking noise...", this.font);
        checkingText.scale = Utils.screenRatioTo43();
        checkingText.x = cc.winSize.width* 0.7;
        checkingText.y = cc.winSize.height/2;
        this.addChild(checkingText, 999);

        var forcePlayBtn = new ccui.Button("timer.png", "", "");
        forcePlayBtn.x = cc.winSize.width - 60;
        forcePlayBtn.y = 120 + forcePlayBtn.height/2;
        forcePlayBtn.addClickEventListener(function() {
            NativeHelper.callNative("cancelNoiseDetecting");
            self.stopAllActions();
            self.playBeginSound();
            forcePlayBtn.removeFromParent();
        });
        this.addChild(forcePlayBtn);      

        var noiseDetectingTime = GAME_CONFIG.speakingTestNoiseDetectingTime || UPDATED_CONFIG.speakingTestNoiseDetectingTime;  

        NativeHelper.callNative("noiseDetectingLoop", [noiseDetectingTime]);

        this.runAction(cc.sequence(
            cc.delayTime(noiseDetectingTime + 0.15),
            cc.callFunc(function() {
                self._adiDog.adiIdling();
                if (SpeakingTestLayer.shouldSkipTest)
                    checkingText.setString("Too noisy, skip speaking");
                else
                    checkingText.setString("Let's play speaking");
            }),
            cc.delayTime(AFTER_CHECKING_NOISE_TIME),
            cc.callFunc(function() {
                if (SpeakingTestLayer.shouldSkipTest)
                    self._moveToNextScene();
                else {
                    self.playBeginSound();
                    forcePlayBtn.removeFromParent();
                }
                checkingText.removeFromParent();
            })
        ))
    },

    playBeginSound: function(){
        self = this;
        var nation = Utils.getLanguage();
        
        this._adiDog.adiTalk();
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 0));
        this.addChild(mask, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);

        var audioId = jsb.AudioEngine.play2d("res/sounds/speak-after_" + nation + ".mp3", false);
        jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
            mask.removeFromParent();

            // self._addLabel();
            self._showNextObject();
        });
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
            this._oldSceneName == "RoomScene" ? BEDROOM_ID : FOREST_ID, 
            this.currentObjectName, 
            (this._oldSceneName == "RoomScene" ? Global.NumberRoomPlayed : Global.NumberForestPlayed)-1);

        this._timeUp();
        this.runAction(
            cc.sequence(
                cc.delayTime(4),
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
        this._touchCounting++;
        this.updateProgressBar();
        var self = this;
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
        var audioId = jsb.AudioEngine.play2d(this._soundName);
        jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
            callback && callback(audioId);
        });
        this._adiDog.adiTalk();
    },

    _checkCompleted: function() {
        if (this.currentObjectShowUpId >= this._names.length){
            NativeHelper.callNative("stopSpeechRecognition");
            
            this._moveToNextScene();

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
                self._playObjectSound();
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
        this._label = "";
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
            this._currentObjectShowUp.removeFromParent();
            this._currentObjectShowUp = null;
        }
        var objectName = "";
        this._soundName = "";
        if (this._oldSceneName == "RoomScene") {
            objectName = "things/" + this._names[this.currentObjectShowUpId].toLowerCase();
            this._soundName = "res/sounds/" + objectName + "-2.mp3";
            this._objectName = objectName;
        }
        else if (this._oldSceneName == "ForestScene") {
            objectName = "animals/" + this._names[this.currentObjectShowUpId].toLowerCase();
            this._soundName = "res/sounds/" + objectName + ".mp3";
            this._objectName = objectName;
        }
        
        this.currentObjectName = this._names[this.currentObjectShowUpId];
        var self = this;
        this._playObjectSound(function(audioId) {
            self._addLabel("GO");
            NativeHelper.callNative("startSpeechRecognition", [5000]);
            KVDatabase.getInstance().set("timeUp", Date.now()/1000);
            self._adiDog.onStartedListening();
        });

        this._currentObjectShowUp = new cc.Sprite(objectName + ".png");
        this._currentObjectShowUp.x = cc.winSize.width/3*2 + 100;
        this._currentObjectShowUp.y = cc.winSize.height/2;
        this._currentObjectShowUp.scale = 250 / this._currentObjectShowUp.width;
        this.addChild(this._currentObjectShowUp);

        AnimatedEffect.create(this._currentObjectShowUp, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);

        if (this._wrongAnswerTime > 2) {
            this.currentObjectShowUpId +=1;
            this._wrongAnswerTime = 0;
        }
    },

    // _setLabelString: function() {
    //     if (!this._label)
    //         return;
    //     this._remainingTime -= 1;
    //     var self = this;    
    //     if (this._remainingTime == 0) {
    //         this._label.setString("GO!");
    //         this._label.runAction(
    //             cc.sequence(
    //                 cc.delayTime(1),
    //                 cc.callFunc(function() {
    //                     self._label.visible = false;
    //                     return;
    //                 })
    //             )
    //         )
    //     }

    //     if (this._remainingTime > 0) {
    //         this._label.setString(this._remainingTime);
    //     }

    // }
});

SpeakingTestLayer.shouldSkipTest = null;

var SpeakingTestScene = cc.Scene.extend({
    ctor: function(objectsArray, oldSceneName){
        this._super();

        var layer = new SpeakingTestLayer(objectsArray, oldSceneName);
        this.addChild(layer);
    }
});
