var SpeakingTestLayer = cc.LayerColor.extend({
    _talkingAdi: null,
    _objectsArray: [],
    _callback: null,
    _currentObjectShowUp: null,
    _itemArray: [],
    _soundName: null,
    _remainingTime: 3,

    currentObjectShowUpId: 0,
    currentObjectName: null,
    resultText: null,
    listener: null, 
    _userId:null,
    checkCorrectAction:0,
    _objectName: "",

    ctor: function(objectsArray, callback) {
        this._super(cc.color(255, 255, 255, 255));
        this.font = "hud-font.fnt";
        // this._itemArray = ["ant", "bear", "bee", "bird", "camel", "cat", "cheetah", "chicken", "cow", "crocodile", 
        // "deer", "dolphin", "duck", "eagle", "elephant", "fish", "fly", "fox", "frog", "giraffe", "goat", "goldfish", 
        // "hamster", "horse", "insect", "kangaroo", "kitten", "lion", "lobster", "monkey", "nest", "octopus", "owl", "panda", 
        // "pig", "puppy", "rabbit", "rat", "scorpion", "seal", "shark", "sheep", "snail", "snake", "squirrel", "tiger", "turtle", "wolf", "zebra"]
        //     .concat(["abacus","apple","banana","book","chair","computer","desk","duster","egg","eraser","feather","flag","gift","grape","hat",
        //         "insect","jar","joker","juice","key","kite","lamp","lemon","map","medicine","nail","nest","onion","orange","pen","pencils","potato",
        //         "queen","raspberry","sock","strawberry","table","tomato","towel","toytrain","umbrella","uniform","vegetable","vehicle","watch","watermelon","xylophone"]);

        // this._itemArray = objectsArray.map(function(obj) {
        //     if (obj.name == "toytrain")
        //         return "toy train";
        //     return obj.name;
        // });

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) {return true;}
        }, this);

        
        this._callback = callback;
        this._objectsArray = objectsArray || [];
        cc.log("this._objectsArray" + JSON.stringify(this._objectsArray));
        SpeechRecognitionListener.getInstance().setSpeakingLayer(this);

        // NativeHelper.callNative("changeSpeechLanguageArray", [JSON.stringify(this._itemArray)]);
    },

    onEnter: function() {
        this._super();

        cc.log("this.listener: " + this.listener);
        
        this._addAdiDog();
        
        this._userId = KVDatabase.getInstance().getString(STRING_USER_ID);
        KVDatabase.getInstance().set("startSceneTime", Date.now()/1000);
        this.playBeginSound();

        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(4),
                cc.callFunc(function() {
                    self._addLabel();
                    self._showNextObject();
                })
            )
        )
    },

    playBeginSound: function(){
        self = this;
        var nation = KVDatabase.getInstance().getString("language", "");
        cc.audioEngine.playMusic("res/sounds/speak-after_" + nation + ".mp3", false);
        this._talkingAdi.adiTalk();
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 0));
        this.addChild(mask, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);
        mask.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function(){
                mask.removeFromParent();
                // self._talkingAdi.adiIdling();
            })
        ))
    },

    addResultText: function() {
        this._resultTextLb = new cc.LabelBMFont(this.resultText, this.font);
        this._resultTextLb.x = this._talkingAdi.x - this._resultTextLb.width/2 - 100;
        this._resultTextLb.y = this._talkingAdi.y + 400;
        this.addChild(this._resultTextLb);
    },  

    incorrectAction: function() {
        var self = this;
        cc.audioEngine.playEffect(res.Failed_sfx);

        // if (this._checkTimeUp()) {    
            this._timeUp();
            this.runAction(
                cc.sequence(
                    cc.delayTime(4),
                    cc.callFunc(function() {
                        self._showNextObject();
                        this.checkCorrectAction = 0;
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
        var self = this;
        cc.audioEngine.playEffect(res.Succeed_sfx);
        this.runAction(cc.sequence(
            cc.callFunc(function() {
                self._talkingAdi.adiJump();
            }),
            cc.delayTime(1),
            cc.callFunc(function() {
                self._talkingAdi.adiHifi();
            }),
            cc.delayTime(2),
            cc.callFunc(function() {
                this.checkCorrectAction = 1;
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
            this._remainingTime = 3;
            this._label.setString(this._remainingTime);
            this._label.visible = true;
            this.schedule(this._setLabelString, 1, 2);
            this._startSpeechRecognizing();    
        }
    },

    _addAdiDog: function() {
        this._talkingAdi = new AdiDogNode();
        this._talkingAdi.scale = 1.5;
        this._talkingAdi.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));
        this.addChild(this._talkingAdi);
    },

    _playObjectSound: function() {
        cc.audioEngine.playEffect(this._soundName);
        this._talkingAdi.adiTalk();
    },

    _checkCompleted: function() {
        if (this.currentObjectShowUpId >= this._objectsArray.length){
            cc.log("on callback");
            this._callback();
            return true;
        }

        
    },

    _checkTimeUp: function() {
        var startTime = KVDatabase.getInstance().getInt("timeUp", 0);
        var now = Date.now()/1000;
        return (now - startTime) >= 2;
    },

    _timeUp: function() {
        var self = this;
        this._talkingAdi.onStoppedListening();
        this._talkingAdi.adiShakeHead();
        this.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function() {    
                self._playObjectSound();
            })
        )) 
    },

    _startSpeechRecognizing: function() {
        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function() {
                    NativeHelper.callNative("startSpeechRecognition", [5000]);
                    KVDatabase.getInstance().set("timeUp", Date.now()/1000);
                    self._talkingAdi.onStartedListening();
                })
            )
        )
    },

    _addLabel: function() {
        this._label = "";
        this._label = new cc.LabelBMFont(this._remainingTime, this.font);
    
        this._label.x = cc.winSize.width / 2;
        this._label.y = cc.winSize.height - 100;
        this.addChild(this._label, 10000);    
    },

    _showObject: function() {
        if (this._currentObjectShowUp) {
            this._currentObjectShowUp.removeFromParent();
            this._currentObjectShowUp = null;
        }
        var objectName = "";
        this._soundName = "";
        if (cc.director.getRunningScene().name == "room") {
            objectName = "things/" + this._objectsArray[this.currentObjectShowUpId].name;
            this._soundName = "res/sounds/" + objectName + "-2.mp3";
            this._objectName = objectName;
        }
        else if (cc.director.getRunningScene().name == "forest") {
            objectName = "animals/" + this._objectsArray[this.currentObjectShowUpId].name;
            this._soundName = "res/sounds/" + objectName + ".mp3";
            this._objectName = objectName;

        }
        
        this.currentObjectName = this._objectsArray[this.currentObjectShowUpId].name;
       
        this._playObjectSound();

        this._currentObjectShowUp = new cc.Sprite(objectName + ".png");
        this._currentObjectShowUp.x = cc.winSize.width/3*2 + 100;
        this._currentObjectShowUp.y = cc.winSize.height/2;
        this._currentObjectShowUp.scale = 1.8;
        this.addChild(this._currentObjectShowUp);

        AnimatedEffect.create(this._currentObjectShowUp, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
        this.currentObjectShowUpId +=1;
    },

    _setLabelString: function() {
        if (!this._label)
            return;
        this._remainingTime -= 1;
        var self = this;    
        if (this._remainingTime == 0) {
            this._label.setString("GO!");
            this._label.runAction(
                cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(function() {
                        self._label.visible = false;
                        return;
                    })
                )
            )
        }

        if (this._remainingTime > 0) {
            this._label.setString(this._remainingTime);
        }

    }
});