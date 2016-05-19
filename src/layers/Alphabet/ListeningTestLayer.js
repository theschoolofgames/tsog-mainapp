var ListeningTestLayer = cc.LayerColor.extend({

    _adiDog: null,

    _names: null,
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
    _hudLayer:null,
    _objectsArray: null,
    _touchCounting:0,
    _blockTouch: false,

    ctor: function(objectsArray, oldSceneName) {
        this._super(cc.color(255, 255, 255, 255));

        this._oldSceneName = oldSceneName;

        this._objectsArray = objectsArray;
        // this._names = objectsArray;
        this._names = objectsArray.map(function(obj) {
            return obj.name.toUpperCase();
        });

        this._objCenter = cc.p(cc.winSize.width * 0.65, cc.winSize.height/2);

        this._addAdiDog();
        this._addHudLayer();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        }, this);

        Utils.showVersionLabel(this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this._playBeginSound();
    },

    onExit: function() {
        this._super();

        this._adiDog = null;
    },

    _playBeginSound: function() {
        var self = this;
        var nation = Utils.getLanguage();

        this._blockTouch = true;
        this._adiDog.adiTalk();

        var audioId = jsb.AudioEngine.play2d("res/sounds/listeningTest_" + nation + ".mp3", false);
        jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
            self._blockTouch = false;
            self._adiDog.adiIdling();
            
            self._addCountDownClock();
            self._displayCurrentName();
            self._showObjects();
        });
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
            if (cc.rectContainsPoint(obj.getBoundingBox(), touchedPos)) {
                if (obj.name == self._names[self._nameIdx]) {
                    self._celebrateCorrectObj(obj);
                    self._touchCounting ++;
                    self.updateProgressBar();
                } else {
                    self._incorrectAction();
                }
            }
        });

        return true;
    },

    _addHudLayer: function(){
        var hudLayer = new HudLayer(this);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
    },

    updateProgressBar: function() {
        var percent = this._touchCounting / this._names.length;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._touchCounting);

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
        this._adiDog.scale = Utils.screenRatioTo43() * 0.9;
        this._adiDog.setPosition(cc.p(cc.winSize.width * 0.15, cc.winSize.height/6));
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
        this._objectNodes.forEach(function(obj) { obj.removeFromParent(); });
        this._objectNodes = [];

        var self = this;
        var shownObjNames = [];

        var remainingObj = this._names.slice(0);
        remainingObj.splice(this._nameIdx, 1);
        remainingObj = shuffle(remainingObj);

        shownObjNames.push(this._names[this._nameIdx]);
        shownObjNames.push(remainingObj[0]);
        shownObjNames.push(remainingObj[1]);

        shownObjNames = shuffle(shownObjNames);

        for (var i = 0; i < 3; i++) {
            var spritePath
            if (this._oldSceneName == "RoomScene") {
                spritePath = "things/" + shownObjNames[i].toLowerCase() + ".png";
            } else {
                spritePath = "animals/" + shownObjNames[i].toLowerCase() + ".png";
            }

            var mostTopY = this._nameNode.y - this._nameNode.height/2 - 20;

            var sprite = new cc.Sprite(spritePath);
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
                        self._tutorial = new TutorialLayer([sender]);
                        self.addChild(self._tutorial);
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

        this._nameNode = new cc.LabelBMFont(this._names[this._nameIdx], "hud-font.fnt");
        this._nameNode.x = this._objCenter.x
        this._nameNode.y = cc.winSize.height - 150;
        this._nameNode.scale = 1.5;
        this.addChild(this._nameNode);

        var objName = this._names[this._nameIdx].toLowerCase();
        if (this._oldSceneName == "RoomScene")
            this._objSoundPath = "res/sounds/things/" + objName + "-2.mp3";
        else if (this._oldSceneName == "ForestScene")
            this._objSoundPath = "res/sounds/animals/" + objName + ".mp3";

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

        self._objSoundIsPlaying = true;
        self._adiDog.adiTalk();
        var audioId = jsb.AudioEngine.play2d(self._objSoundPath);
        jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
            if (!self._adiDog)
                return;

            self._adiDog.adiIdling();
            self._objSoundIsPlaying = false;
        });
    },

    _animateObjectIn: function(object, delay) {
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
        this._nameIdx++;

        if (this._tutorial) {
            this._tutorial.removeFromParent();
            this._tutorial = null;
        }

        var effect = AnimatedEffect.create(correctedObj, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
        effect.scale = 3;

        this._correctAction();
        this._objectNodes.forEach(function(obj) {
            if (obj == correctedObj) {

                var targetPosY = Math.min(self._objCenter.y, self._nameNode.y - self._nameNode.height/2 - obj.height/2 * obj.scale * 1.5 - 20);

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
                        if (self._nameIdx >= self._names.length) {
                            self._moveToNextScene();
                        } else {
                            self._displayCurrentName();
                            self._showObjects();
                        }
                    })
                ));
            } else {
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

    _incorrectAction: function() {
        var self = this;
        jsb.AudioEngine.play2d(res.Failed_sfx);
        this._adiDog.adiShakeHead();
        this.runAction(
            cc.sequence(
                cc.delayTime(4),
                cc.callFunc(function() {
                    self._adiDog.adiIdling();
                })        
            )
        );
    },

    _moveToNextScene: function() {
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        var scene;
        if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
            scene = new window[nextSceneName](this._objectsArray, this._oldSceneName);
        else
            scene = new window[nextSceneName]();
        cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    }
});

var ListeningTestScene = cc.Scene.extend({
    ctor: function(objectsArray, nextSceneName, oldSceneName) {
        this._super();
        var layer = new ListeningTestLayer(objectsArray, nextSceneName, oldSceneName);
        this.addChild(layer);
        Utils.startCountDownTimePlayed();
    }
});