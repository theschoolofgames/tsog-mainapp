var ListeningTestLayer = TestLayer.extend({
    _nameNode: null,
    _objectNodes: [],
    _nameIdx: 0,
    _curSoundName: "",

    _nextSceneName: null,
    _oldSceneName: null,

    _objCenter: null,
    _objSoundPath: null,

    _objSoundIsPlaying: false,

    _tutorial: null,
    _data: null,
    _blockTouch: false,
    _addedObject: [],
    _keyObject: [],
    _currentKeyIndex: 0,

    ctor: function(data, duration) {
        this._super();
        // cc.log("ctor ListeningTestLayer: ");
        this._oldSceneName = SceneFlowController.getInstance().getPreviousSceneName();
        this._fetchObjectData(data);
        this._duration = duration;
        this._addedObject = [];

        this._objCenter = cc.p(cc.winSize.width * 0.65, cc.winSize.height/2);

        this._addAdiDog();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        }, this);
    },
    _addHudLayer: function(){
        this._super(this._duration);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this._playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    _playBeginSound: function() {
        var self = this;

        var didInstructionSoundPlay = KVDatabase.getInstance().getInt("beginSound_ListeningTestScene", 0);
        if (didInstructionSoundPlay == 0) {
            var nation = Utils.getLanguage();

            this._blockTouch = true;
            this._adiDog.adiTalk();

            var audioId = jsb.AudioEngine.play2d("res/sounds/sentences/listeningTest_" + nation + ".mp3", false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                self._blockTouch = false;
                if (self._adiDog) {
                    self._adiDog.adiIdling();
                    self._addCountDownClock();
                    self._displayCurrentName();
                    self._showObjects();
                }
            });
            // KVDatabase.getInstance().set("beginSound_ListeningTestScene", 1);
        } else {
            this._blockTouch = false;
            if (this._adiDog) {
                this._adiDog.adiIdling();
                this._addCountDownClock();
                this._displayCurrentName();
                this._showObjects();
            }
        }
    },

    onTouchBegan: function(touch, event) {
        if (this._blockTouch)
            return false;

        var self = this;
        var touchedPos = touch.getLocation();

        if (cc.rectContainsPoint(this._adiDog.getBoundingBox(), touchedPos) || 
            cc.rectContainsPoint(this._nameNode.getBoundingBox(), touchedPos)) {
            this._playObjSound();
            return true;
        }

        this._objectNodes.forEach(function(obj) {
            cc.log("obj size: %f, %f", obj.width, obj.height);
            if (cc.rectContainsPoint(obj.getBoundingBox(), touchedPos)) {
                var currentKeyNames;
                if (self._keyObject.length>0)
                    currentKeyNames = self._keyObject[self._currentKeyIndex];
                else
                    currentKeyNames = self._names[self._nameIdx];
                if (obj.name == currentKeyNames) {
                    self._celebrateCorrectObj(obj);
                    self._touchCounting ++;
                    self.updateProgressBar();
                    self._currentKeyIndex++;
                } else {
                    self._incorrectAction(obj);
                }
            }
        });

        return true;
    },

    updateProgressBar: function() {
        cc.log("ListeningTestLayer - updateProgressBar");
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

    _addAdiDog: function() {
        this._adiDog = new AdiDogNode();
        this._adiDog.scale = Utils.screenRatioTo43() * 0.6;
        this._adiDog.setPosition(cc.p(cc.winSize.width * 0.15, cc.winSize.height/3));
        this.addChild(this._adiDog);
    },

    _addCountDownClock: function() {
        var self = this;
        var clockInitTime = GAME_CONFIG.listeningTestTime || UPDATED_CONFIG.listeningTestTime;
        var clock = new Clock(clockInitTime, function(){
            self._moveToNextScene();
        });
        clock.setIsClockInTalkingAdi(true);
        clock.visible = true;
        clock.x = cc.winSize.width - 60;
        clock.y = 100;
        this.addChild(clock, 99);

        this._clock = clock;
    },

    _showObjects: function() {
        if(this._tutorial)
            this._tutorial.removeFromParent();
        this._objectNodes.forEach(function(obj) { obj.removeFromParent(); });
        this._objectNodes = [];

        var self = this;
        var shownObjNames = [];

        var remainingObj = this._names.slice(0);
        cc.log("remainingObj: " + remainingObj);
        var currentKeyNames;
        if (this._keyObject.length > 0) {
            currentKeyNames = this._keyObject[this._currentKeyIndex]
        } else
            currentKeyNames = this._names[this._nameIdx];

        shownObjNames.push(currentKeyNames);
            
        remainingObj.splice(this._nameIdx, 1);
        remainingObj = shuffle(remainingObj);
        
        cc.log("remainingObj: " + remainingObj);
        var self = this;
        if (this._keyObject.length > 0) {
            for (var i = 1; i < remainingObj.length; i++) {
                if (shownObjNames.length >= 3) {
                    break;
                }
                var name = remainingObj[i];
                
                for (var j = 0; j < this._keyObject.length; j++) {
                    var key = this._keyObject[j];
                    if (name !== currentKeyNames && name !== key) {
                        cc.log("break;");
                        shownObjNames.push(name);
                        break;
                    }
                }
            }
        } else {
            shownObjNames.push(remainingObj[0]);
            shownObjNames.push(remainingObj[1]);
        }
        // shownObjNames.push(remainingObj[1]);

        cc.log("shownObjNames: " + shownObjNames);

        if (shownObjNames[2] == null || shownObjNames[2] == undefined) {
            if (!this._addedObject.length) {
                var self = this;
                data = this._data;
                if(typeof(this._data) != "object")
                    data = JSON.parse(this._data);
                var currentMainObjectId = data.map(function(obj) {
                    // cc.log("shownObjNames null case value: " + obj.value);
                    if (obj && obj.value == self._names[self._nameIdx])
                        return obj.id;
                });
                var rdmObjectName = GameObject.getInstance().getRandomAnObjectDiffWithId(currentMainObjectId[0]);
                shownObjNames[2] = rdmObjectName;
                this._addedObject.push(rdmObjectName);
            } else
                shownObjNames[2] = this._addedObject[0];
        }

        shownObjNames = shuffle(shownObjNames);
        var d = this.getStoryTimeForListeningData();
        if (d)
            shownObjNames = shuffle(d.data[this.storytimeCurrentDataIndex]);

        // cc.log("shownObjNames: " + shownObjNames);
        // cc.log("d: " + d);
        var secondNumberImageName;
        for (var i = 0; i < 3; i++) {
            cc.log("i -> " + i);
            var isNumber = false;
            var spritePath = "objects/" + shownObjNames[i].toLowerCase() + ".png";
            if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) {
                spritePath = "animals/" + shownObjNames[i].toLowerCase() + ".png";
                if (!jsb.fileUtils.isFileExist("res/SD/" + spritePath)) {
                    // handle case number has two digit
                    // number case
                    var number = parseInt(shownObjNames[i]);
                    // cc.log("number: " + number);
                    if (isNaN(number)) {
                        if (shownObjNames[i].charAt(0) == shownObjNames[i].toLowerCase())
                            spritePath = "#" + shownObjNames[i].toUpperCase() + "_lowercase" + ".png";
                        else
                            spritePath = "#" + shownObjNames[i].toUpperCase() + ".png";
                    } else
                        isNumber = true;
                }
                if (shownObjNames[i].indexOf("color") > -1) {
                    // color case
                    var color = shownObjNames[i].toLowerCase().substr(6);
                    spritePath = "#btn_" + color + ".png";   
                }
            }

            cc.log("sprite path: " + spritePath);
            var mostTopY = this._nameNode.y - this._nameNode.height/2 - 20;

            var sprite;
            if (isNumber)
                sprite = new cc.LabelBMFont(shownObjNames[i], res.CustomFont_fnt);
            else
                sprite = new cc.Sprite(spritePath);

            sprite.name = shownObjNames[i];
            sprite.scale = Math.min(200 / sprite.width, 350 / sprite.height) * Utils.screenRatioTo43();
            sprite.x = this._objCenter.x + (i-1) * 200 * Utils.screenRatioTo43();
            sprite.y = this._objCenter.y;

            if (cc.rectGetMaxY(sprite.getBoundingBox()) > mostTopY) {
                sprite.scale = (mostTopY - this._objCenter.y) / sprite.height * 2;
            }

            this._objectNodes.push(sprite);
            this.addChild(sprite);

            this._animateObject(sprite, i);
            this._animateObjectIn(sprite, i);

            if (sprite.name == this._names[this._nameIdx]) {
                sprite.runAction(cc.sequence(
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowHand || UPDATED_CONFIG.listeningTestWaitToShowHand),
                    cc.callFunc(function(sender) {
                        cc.log("set finger tutorial");
                        if(self._tutorial)
                            self._tutorial.removeFromParent();
                        self._tutorial = new TutorialLayer([sender]);
                        self.addChild(self._tutorial, 999);
                    }),
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowNextObj || UPDATED_CONFIG.listeningTestWaitToShowNextObj),
                    cc.callFunc(function(sender) {
                        if (self._tutorial) {
                            self._tutorial.removeFromParent();
                            self._tutorial = null;
                        }

                        self._nameIdx++;
                        if (self._nameIdx >= self._names.length) {
                            self._moveToNextScene();
                        } else {
                            self._displayCurrentName();
                            self._showObjects();
                        }
                    })
                ));
            }
        }
    },

    _displayCurrentName: function() {
        var self = this;

        if (this._nameNode)
            this._nameNode.removeFromParent();

        var text = this._names[this._nameIdx];
        if (this._keyObject.length > 0)
            text = this._keyObject[this._currentKeyIndex];
        if (text.indexOf("color") > -1) {
            text = text.substr(text.indexOf("_") + 1, text.length-1);
        }

        this._nameNode = new cc.LabelBMFont(text, "hud-font.fnt");
        this._nameNode.x = this._objCenter.x
        this._nameNode.y = cc.winSize.height - 150;
        this._nameNode.scale = 1.5;
        this.addChild(this._nameNode);

        // cc.log("this._names: " + this._names);
        // cc.log("this._names: " + this._names[this._nameIdx]);
        var objName = text.toLowerCase();
        var d = this.getStoryTimeForListeningData();
        var bannerString;
        if (d) {
            this.storytimeCurrentDataIndex++;
            objName = d.voice[this.storytimeCurrentDataIndex];

            this._nameNode.setString(STORYTIME_VOICE_FOR_LISTENING[objName]);
        }

        this._objSoundPath = "res/sounds/objects/" + objName + ".mp3";
        if (!jsb.fileUtils.isFileExist(this._objSoundPath))
            this._objSoundPath = "res/sounds/animals/" + objName + ".mp3";
        if (!jsb.fileUtils.isFileExist(this._objSoundPath)) {
            this._objSoundPath = "res/sounds/numbers/" + objName + ".mp3";
        }
        if (!jsb.fileUtils.isFileExist(this._objSoundPath)) {
            this._objSoundPath = "res/sounds/alphabets/" + objName + ".mp3";
        }
        if (!jsb.fileUtils.isFileExist(this._objSoundPath)) {
            this._objSoundPath = "res/sounds/colors/" + objName + ".mp3";
        }

        this.runAction(cc.sequence(
            cc.delayTime(ANIMATE_DELAY_TIME * 3 + 0.5),
            cc.callFunc(function() {
                self._playObjSound();
            }))); 
    },

    _playObjSound: function() {
        var self = this;

        if (self._objSoundIsPlaying)
            return;

        // if (!jsb.fileUtils.isFileExist(this._objSoundPath)) {
        //     // callback();
        //     cc.log("no matching file -> currentObjectShowUpId ++");
        //     this.currentObjectShowUpId++;
        //     this._showNextObject();
        //     return;
        // }
        cc.log("self._objSoundPath: " + self._objSoundPath);
        self._objSoundIsPlaying = true;
        self._adiDog.adiTalk();
        if (self._objSoundPath) {
            var audioId = jsb.AudioEngine.play2d(self._objSoundPath);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                if (!self._adiDog)
                    return;

                self._adiDog.adiIdling();
                self._objSoundIsPlaying = false;
            });
        }
        
    },

    _animateObjectIn: function(object, delay) {
        cc.log("_animateObjectIn: ");
        var oldScale = object.scale;
        object.scale = 0;
        var self = this;
        object.runAction(
            cc.sequence(
                cc.delayTime(delay * ANIMATE_DELAY_TIME),
                cc.callFunc(function() {
                    jsb.AudioEngine.play2d("sounds/smoke.mp3"),
                    AnimatedEffect.create(object, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
                }),
                cc.scaleTo(0.7, 1 * oldScale).easing(cc.easeElasticOut(0.9))
            )
        );
    },

    _animateObject: function(obj, delay) {
        cc.log("_animateObject");
        var oldScale = obj.scale;
        obj.runAction(cc.sequence(
            cc.delayTime(3 + delay * ANIMATE_DELAY_TIME * 1.5),
            cc.callFunc(function() {
                obj.runAction(cc.repeatForever(cc.sequence(
                    cc.scaleTo(0.1, 0.7 * oldScale),
                    cc.scaleTo(0.3, 1.05 * oldScale),
                    cc.scaleTo(0.1, 1 * oldScale),
                    cc.delayTime(5)
                )))
            })
        ));     
    },

    _celebrateCorrectObj: function(correctedObj) {
        var self = this;
        self._blockTouch = true;
        this._nameIdx++;

        if (this._tutorial) {
            this._tutorial.removeFromParent();
            this._tutorial = null;
        }
        // cc.log("listeningTest_ _celebrateCorrectObj correctedObj.name: " + correctedObj.name);
        SegmentHelper.track(SEGMENT.TOUCH_TEST,
            {
                obj_name: correctedObj.name,
                correct: "true"
            });


        var effect = AnimatedEffect.create(correctedObj, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
        effect.scale = 3;

        this._correctAction();
        this._objectNodes.forEach(function(obj) {
            if (obj == correctedObj) {

                var targetPosY = Math.min(self._objCenter.y, self._nameNode.y - self._nameNode.height/2 - obj.height/2 * obj.scale * 1.5 - 20);
                cc.log("targetPosY: " + targetPosY);
                cc.log("self._objCenter.y: " + self._objCenter.y);
                obj.stopAllActions();
                obj.setLocalZOrder(10);
                obj.runAction(cc.sequence(
                    cc.spawn(
                        cc.moveTo(0.5, cc.p(self._objCenter.x, targetPosY)),
                        cc.scaleTo(0.5, obj.scale * 1.5)
                    ),
                    // cc.delayTime(0.5),
                    cc.delayTime(2.0),
                    cc.callFunc(function() {
                        self._blockTouch = false;
                        if (self._nameIdx >= self._names.length) {
                            self._moveToNextScene();
                        } else if (self._keyObject.length > 0 && self._currentKeyIndex >= self._keyObject.length) {
                            self._moveToNextScene();
                        } else {
                            self._displayCurrentName();
                            self._showObjects();
                        }
                    })
                ));
            } else {
                cc.log("fadeOut incorrectedObj");
                obj.runAction(cc.fadeOut(0.5));
            }
        });
    },

    _correctAction: function() {
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
                self._adiDog.adiIdling();
            })
        ));
    },

    _incorrectAction: function(obj) {
        var self = this;
        jsb.AudioEngine.play2d(res.Failed_sfx);
        this._adiDog.adiShakeHead();
        // cc.log("listeningTest_ _celebrateCorrectObj incorrectedObj.name: " + obj.name);
        SegmentHelper.track(SEGMENT.TOUCH_TEST,
            {
                obj_name: obj.name,
                correct: "false"
            });

        this.runAction(
            cc.sequence(
                cc.delayTime(4),
                cc.callFunc(function() {
                    self._adiDog.adiIdling();
                })        
            )
        );

        ConfigStore.getInstance().setBringBackObj(
            this._oldSceneName == "RoomScene" ? BEDROOM_ID : FOREST_ID, 
            this._names[this._nameIdx], 
            (this._oldSceneName == "RoomScene" ? Global.NumberRoomPlayed : Global.NumberForestPlayed)-1);
    },

    _fetchObjectData: function(data) {
        cc.log("data listening: " + (typeof(data)!= "object"));
        this._data = data;
        this._keyObject = [];
        if(typeof(data) != "object")
            data = JSON.parse(data);

        if (data && data.option) {
            this._keyObject = data.key;
            data = data.data;
            this._data = data;
        }

        cc.log("_fetchObjectData data: " + data);
        if (data) {
            this._names = data.map(function(id) {
                // cc.log("value: %s", id.value)
                if (id)
                    return id.value || id;
            });
        }
        else
            this._data = [];

        cc.log("listening names after map: " + JSON.stringify(this._names));
        if (this._keyObject.length > 0)
            this.setData(JSON.stringify(this._keyObject));
        else
            this.setData(this._data);
    },

    onExit: function () {
        this._super();

        this.removeStoryTimeForListeningData();
    },
    
});

var ListeningTestScene = cc.Scene.extend({
    ctor: function(data, duration) {
        this._super();
        cc.log("listening: " + duration);
        var layer = new ListeningTestLayer(data, duration);
        this.addChild(layer);
    }
});