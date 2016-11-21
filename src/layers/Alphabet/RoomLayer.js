var Z_OBJECT = 4;
var Z_SHADE = 3;
var Z_OBJECT_SELECTED = 10;
var Z_SHADE_SELECTED = 9;

var RoomLayer = cc.Layer.extend({
    _kvInstance: null,
    _hudLayer: null,
    _maskLayer: null,
    _objectTouching: null,
    _currentObjectShadeZOrder: null,
    _objects: [],
    _objectNames: [],
    _shadeObjects: [],
    _correctedObject: [],
    _objectDisableds: [],
    _effectLayers: [],
    _warningLabel: null,
    _countDownClock: null,
    _lastClickTime: 0,
    _effectLayerShade: null,
    _effectSmoke:null,
    _allScale: 1,

    _effectAudioID: null,

    _isLevelCompleted: false,
    _tutorial: null,
    _completedObj: null,
    _userId:null,

    _selectedShadeShader: null,
    _totalAngle: 0,

    _data: null,

    ctor: function(data, timeForScene) {
        this._super();
        cc.log("Data: " + timeForScene);
        this._fetchObjectData(data);
        this.tag = 1;
        this._kvInstance = KVDatabase.getInstance();
        this.resetAllArrays();
        this.setVolume();
        this.createBackground();
        this.addObjects();
        // this.addRefreshButton();
        // this.addBackButton();
        this.addHud(timeForScene);
        
        this.runHintObjectUp();
        this.runSoundCountDown();
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved,
                onTouchEnded: this.onTouchEnded
        }, this);

        SegmentHelper.track(SEGMENT.LEVEL_START, 
            { 
                room: "room", 
                object_num: this._data.length
            });
        // cc.audioEngine.playMusic(res.background_mp3, true);
        this.scheduleUpdate();

        Utils.showVersionLabel(this);

        // this.addChild(new WritingTestLayer([{"name":"123","tag":0},{"name":"jar","tag":1},{"name":"key","tag":2}], "RoomScene"));
        // this.addChild(new PayWallDialog(), 100);
        // this._moveToNextScene();
        // this.completedScene();
    },

    onEnterTransitionDidFinish: function() {
        cc.log("RoomLayer onEnterTransitionDidFinish");
        this._super();
        this.playBeginSound();
        this.runAction(
            cc.sequence(    
                cc.delayTime(0.1),
                cc.callFunc(
                    function() {
                        Utils.startCountDownTimePlayed("pause");
                        Utils.startCountDownTimePlayed("showPayWall");
                    }
                )
            )
        )
    },
    onEnter: function() {
        this._super();
        this.runTutorial(false);
    },
    onExit: function() {
        this._super();

        this._objectTouching = null;
    },

    update: function(pDt) {
        this._totalAngle += pDt;
        if(this._totalAngle >= 180)
            this._totalAngle -= 180;

        if (this._selectedShadeShader)
            this._selectedShadeShader.setUniformFloat("eTime", this._totalAngle);
    },

    setVolume:function() {
        cc.audioEngine.setMusicVolume(0.1);
        cc.audioEngine.setEffectsVolume(0.7);
    },

    playBeginSound: function(){
        var didInstructionSoundPlay = KVDatabase.getInstance().getInt("beginSound_RoomScene", 0);
        if (didInstructionSoundPlay == 0) {
            var nation = Utils.getLanguage();
            // cc.log("nation: %s", nation);

            var audioId = jsb.AudioEngine.play2d("res/sounds/sentences/" + localize("begin-room") + ".mp3", false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                // mask.removeFromParent();
                cc.audioEngine.playMusic(res.background_mp3, true);
            });
            // KVDatabase.getInstance().set("beginSound_RoomScene", 1);
        }else 
            cc.audioEngine.playMusic(res.background_mp3, true);
    },

    resetAllArrays: function() {
        this._objects = [];
        this._objectNames = [];
        this._shadeObjects = [];
        this._correctedObject = [];
        this._objectDisableds = [];
        this._effectLayers = [];
    },

    addHud: function(timeForScene) {
        var hudLayer = new HudLayer(this,false, timeForScene);
        // hudLayer.x = 0;
        // hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;

        this._hudLayer.setTotalGoals(this._data.length);
    },

    runTutorial: function(shouldShuffle) {
        this._tutorial = new TutorialLayer(this._objects, this._shadeObjects, shouldShuffle);
        if(Global.NumberGamePlayed < 2)
            this.addChild(this._tutorial, 100)
    },

    addRefreshButton: function() {
        NativeHelper.callNative("customLogging", ["Button", "res/refresh-button.png"]);
        var refreshButton = new ccui.Button("res/refresh-button.png", "", "");
        refreshButton.x = cc.winSize.width - refreshButton.width;
        refreshButton.y = refreshButton.height / 2;
        this.addChild(refreshButton);
        var self = this;
        refreshButton.addClickEventListener(function() {
            cc.director.replaceScene(new RoomScene());
        });
    },

    addBackButton: function() {
        NativeHelper.callNative("customLogging", ["Button", "back.png"]);
        var backButton = new ccui.Button( "back.png",  "back-pressed.png", "");
        backButton.x = cc.winSize.width - backButton.width*3;
        backButton.y = backButton.height / 2;

        this.addChild(backButton);

        var self = this;
        backButton.addClickEventListener(function() {
            cc.director.replaceScene(new ForestScene());
        });
    },

    createBackground: function() {
        
        NativeHelper.callNative("customLogging", ["Sprite", "Bedroom-screen.jpg"]);
        var background = new cc.Sprite( "Bedroom-screen.jpg");
        this._allScale = cc.winSize.width / background.width;

        background.setScale(this._allScale);
        background.x = cc.winSize.width / 2;
        background.y = 0;
        background.anchorY = 0;
        this.addChild(background);

        NativeHelper.callNative("customLogging", ["Sprite", "bedroom-roof.png"]);
        var roof = new cc.Sprite("bedroom-roof.png");
        roof.scale = this._allScale;
        roof.x = cc.winSize.width/2;
        roof.y = cc.winSize.height;
        roof.anchorY = 1;
        this.addChild(roof);

        NativeHelper.callNative("customLogging", ["Sprite", "bedroom-ribbon.png"]);
        var roomRibbon = new cc.Sprite("bedroom-ribbon.png");
        roomRibbon.x = 0
        roomRibbon.y = cc.winSize.height - 135;
        roomRibbon.anchorX = 0;
        roomRibbon.scale = this._allScale;
        this.addChild(roomRibbon);

        NativeHelper.callNative("customLogging", ["Sprite", "bedroom-clock.png"]);
        var roomClock = new cc.Sprite("bedroom-clock.png");
        roomClock.x = 350 * this._allScale;
        roomClock.y = cc.winSize.height - 195 / this._allScale;
        roomClock.scale = this._allScale;
        this.addChild(roomClock);

        NativeHelper.callNative("customLogging", ["Sprite", "bedroom-window.png"]);
        var roomWindow = new cc.Sprite("bedroom-window.png");
        roomWindow.x = 620 * this._allScale;
        roomWindow.y = cc.winSize.height - 230 / this._allScale;
        roomWindow.scale = this._allScale;
        this.addChild(roomWindow);
    },

    addObjects: function() {
        var dsInstance = ConfigStore.getInstance();
        // this._numberItems = this.getNumberOfObjects();

        // var bedroomObjects = dsInstance.getRandomObjects(BEDROOM_ID, this._data.length);
        // cc.log("bedroomObjects: " + JSON.stringify(bedroomObjects));
        // while (bedroomObjects.filter(function(obj) {return obj.type == "HEAVY_WEIGHT_ITEM"}).length > BEDROOM_HEAVYWEIGHT_ITEMS_POSITION.length)
        //     var bedroomObjects = dsInstance.getRandomObjects(BEDROOM_ID, this._data.length);
        var bedroomObjects = [];
        this._processObjectData(bedroomObjects);
        cc.log("bedroomObjects: " + JSON.stringify(bedroomObjects));

        var shuffledPositionArray = shuffle(BEDROOM_ITEMS_POSITION);
        var heavyObjectPositions = shuffle(BEDROOM_HEAVYWEIGHT_ITEMS_POSITION);
        var shuffledPositionIndex = 0, heavyObjPosIndex = 0;

        for ( var i = 0; i < this._data.length; i++) {
            cc.log("iiiiii: " + JSON.stringify(bedroomObjects[i]));
            if (bedroomObjects[i].type === ROOM_ITEM_TYPE.LIGHT_WEIGHT_ITEM)
                this.addObjectButton(shuffledPositionArray[shuffledPositionIndex++], bedroomObjects[i].imageName, i, bedroomObjects[i].z);
            else
                this.addObjectButton(heavyObjectPositions[heavyObjPosIndex++], bedroomObjects[i].imageName, i, bedroomObjects[i].z);

            this.addObjectShade(bedroomObjects[i], bedroomObjects[i].imageName, bedroomObjects[i].z);
        }
        this.runSparklesEffect();
    },

    addObjectButton: function(objPosition, imageName, index) {
        // cc.log("imageName: " + imageName);
        NativeHelper.callNative("customLogging", ["Sprite", "objects/" + imageName + ".png"]);
        var objImageName = "objects/" + imageName + ".png";
        var object = new cc.Sprite(objImageName);
        self = this;
        object.setAnchorPoint(objPosition.anchorX, objPosition.anchorY);

        object.x = objPosition.x;
        object.y = objPosition.y;
        object.tag = index;
        object.userData = { scaleFactor: 1, imageName: objImageName}
        object.scale = this._allScale * object.userData.scaleFactor;
        this.addChild(object, Z_OBJECT);

        var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.SpriteDistort_fsh);
        var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        // shaderState.setUniformInt("useDistrort", 0);
        object.shaderProgram = shader;

        this._objectNames.push({name: imageName, tag: object.tag});

        this.animateObjectIn(object, index);
        this._objects.push(object);
        this.runObjectAction(this, 0,
            function(){
                if (Global.NumberGamePlayed)
                self._lastClickTime = self._hudLayer.getRemainingTime();
            }
        )
    },

    addObjectShade: function(object, imageName, index) {

        NativeHelper.callNative("customLogging", ["Sprite", "objects/" + imageName + ".png"]);
        var shadeObject = new cc.Sprite("objects/" + imageName + ".png");
        shadeObject.setAnchorPoint(object.anchorX, object.anchorY);
        shadeObject.setPosition(cc.p(object.x, object.y));
        shadeObject.scale = this._allScale /2;

        if (this.hadObjectRequired())
            shadeObject.visible = false;
        else {
            shadeObject.visible = true;
            this._currentObjectShadeZOrder = shadeObject.getLocalZOrder();

            var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.SolidColor_fsh);
            shadeObject.shaderProgram = shader;
            var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
            shaderState.setUniformInt("enabled", 0);
            shadeObject.color = cc.color(140, 130, 200);
            // shadeObject.color = cc.color(6, 66, 94);

            this._effectLayerShade = AnimatedEffect.create(shadeObject, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
        }

        this.addChild(shadeObject, Z_SHADE);
        this._shadeObjects.push(shadeObject);
    },

    animateObjectIn: function(object, delay) {
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

        this.runObjectAction(this, 0,
            function(){
                if (Global.NumberGamePlayed > 1)
                self._lastClickTime = self._hudLayer.getRemainingTime();
            }
        )
    },

    checkWonGame: function() {
        // win condition
        if (this._objectDisableds.length == this._data.length)
            this.completedScene();
    },

    createWarnLabel: function(text, object, x, y) {
        var randSchoolIdx = Math.floor(Math.random() * 4);
        font = FONT_COLOR[randSchoolIdx];

        text = text.toUpperCase();
        var warnLabel = new cc.LabelBMFont(text, font);
        var scaleTo = 1.5;
        warnLabel.setScale(scaleTo);

        warnLabel.x = x || cc.winSize.width / 2;
        warnLabel.y = y || cc.winSize.height / 2 - 100;
        this.addChild(warnLabel, 10000);

        this._warningLabel = warnLabel;
    },

    createCompletedObject: function(lbName) {
        if (!this._maskLayer)
            return;

        var randSchoolIdx = Math.floor(Math.random() * 4);
        font = FONT_COLOR[randSchoolIdx];
        lbName = lbName.toUpperCase();
        var objLabel = new cc.LabelBMFont(lbName, font);
        objLabel.scale = 1.5;
        objLabel.x = cc.winSize.width/2;
        objLabel.y = cc.winSize.height/2 - 100;
        this._maskLayer.addChild(objLabel);

        this._completedObj = new cc.Sprite(this._objectTouching.userData.imageName);
        this._completedObj.x = cc.winSize.width/2;
        this._completedObj.y = objLabel.y + this._completedObj.height/2 + 50;
        this._maskLayer.addChild(this._completedObj);
    },

    completedScene: function() {
        if (this._mask)
        this._hudLayer.pauseClock();
        var starEarned = this._hudLayer.getStarEarned();

        var lbText = "You Win";
        this.createWarnLabel(lbText, null, null, cc.winSize.height/2);
        var warningLabel = this._warningLabel;
        warningLabel.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(warningLabel, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }), 
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5))
            // cc.delayTime(1)
        ));

        var elapseTime = this._hudLayer._clock.getElapseTime();
        RequestsManager.getInstance().postGameProgress(Utils.getUserId(), GAME_ID, 3, elapseTime);

        var eventName = elapseTime == GAME_CONFIG.levelTime ? SEGMENT.LEVEL_INCOMPLETE : SEGMENT.LEVEL_COMPLETE;

        SegmentHelper.track(eventName,
            {
                room: "room",
                time_taken: this._hudLayer._clock.getElapseTime()
            });

        this.increaseAmountGamePlayed();

        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function() {
                    if (warningLabel)
                        warningLabel.removeFromParent();
                    self._moveToNextScene();
                })
            )
        )
    },

    _findTouchedObject: function(touchedPos) {
        var distance = 0;
        var objBoundingBox = null;

        for ( var i = 0; i < this._objects.length; i++) {
            if (this.isObjectDisabled(this._objects[i]))
                continue;
            
            objBoundingBox = this._objects[i].getBoundingBox();
            var isRectContainsPoint = cc.rectContainsPoint(objBoundingBox, touchedPos);
            if (isRectContainsPoint) {
                return this._objects[i];
            }
        }

        return null;
    },

    getSoundConfigByName: function(imageName) {
        var strName = imageName.toUpperCase();
        for ( var i = 0; i < OBJECT_SOUNDS_LENGTH.length; i++) {
            if (strName === OBJECT_SOUNDS_LENGTH[i].name) {
                return OBJECT_SOUNDS_LENGTH[i];
            }
        }
    },

    getObjectIndex: function(object) {
        for ( var i = 0; i < this._objects.length; i++)
            if (object === this._objects[i])
                return i;
    },

    onTouchBegan: function(touch, event) {
        var beginTime = Date.now();
        var targetNode = event.getCurrentTarget();
        var touchedPos = touch.getLocation();
        targetNode._objectTouching = targetNode._findTouchedObject(touchedPos);
        if (!targetNode._objectTouching)
            return false;

        SegmentHelper.track(SEGMENT.OBJECT_PICK_START, 
            { 
                room: "room", 
                object_name: targetNode.getObjectName(targetNode._objectTouching)
            });
        
        jsb.AudioEngine.play2d("sounds/pickup.mp3");
        targetNode.processGameLogic();
        if (Global.NumberGamePlayed < 2) {
            if(targetNode._tutorial != null) {
                targetNode._tutorial.removeFromParent();
                targetNode._tutorial = null;
            }
        }
        var oldScale = targetNode._objectTouching.scale;
        targetNode._objectTouching.setScale(0.7 * oldScale);
        targetNode._objectTouching.runAction(cc.sequence(
            cc.EaseBounceInOut(cc.scaleTo(0.5, 1.1 * oldScale)),
            cc.EaseBounceInOut(cc.scaleTo(0.5, 1.05 * oldScale))
        ));
        
        targetNode._lastClickTime = targetNode._hudLayer.getRemainingTime();
        // targetNode._effectSmoke.stopRepeatAction();
        var objectPosition = targetNode.getObjectPosWithTouchedPos(touchedPos);
        targetNode._objectTouching.setPosition(objectPosition);

        var index = targetNode.getObjectIndex(targetNode._objectTouching);
        targetNode._shadeObjects[index].setLocalZOrder(Z_SHADE_SELECTED);
        targetNode._objectTouching.setLocalZOrder(Z_OBJECT_SELECTED);

        return true;
    },

    onTouchMoved: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = touch.getLocation();

        var objectPosition = targetNode.getObjectPosWithTouchedPos(touchedPos);
        if (objectPosition == null) {
            onTouchEnded(touch, event);
            return;
        }

        targetNode._objectTouching.setPosition(objectPosition);
    },

    onTouchEnded: function (touch, event) {
        var targetNode = event.getCurrentTarget();

        if (targetNode._effectAudioID)
            jsb.AudioEngine.stop(targetNode._effectAudioID);
        targetNode._effectAudioID = null;

        if (targetNode._objectTouching.x < 0)
            targetNode._objectTouching.x = 0;
        if (targetNode._objectTouching.y > cc.winSize.height)
            targetNode._objectTouching.y = cc.winSize.height;

        //set shadeObject visible to false
        targetNode._lastClickTime = targetNode._hudLayer.getRemainingTime();
        var index = targetNode.getObjectIndex(targetNode._objectTouching);
        targetNode._shadeObjects[index].visible = false;
        targetNode._shadeObjects[index].stopAllActions();
        targetNode._shadeObjects[index].setColor(cc.color(140, 130, 200));
        targetNode._shadeObjects[index].setLocalZOrder(Z_SHADE);
        // targetNode._shadeObjects[index].setColor(cc.color(6, 66, 94));
        targetNode._objectTouching.setLocalZOrder(Z_OBJECT);
        targetNode.handleObjectCorrectPos(index);

        targetNode._selectedShadeShader.setUniformInt("enabled", 0);
        targetNode._selectedShadeShader = null;

        targetNode._objectTouching.stopAllActions();
        targetNode._objectTouching.runAction(cc.sequence(
            cc.EaseBounceInOut(cc.scaleTo(0.2, 0.7 * targetNode._objectTouching.userData.scaleFactor)),
            cc.EaseBounceInOut(cc.scaleTo(0.2, 1 * targetNode._objectTouching.userData.scaleFactor))
        ));

        if (targetNode._objectDisableds.indexOf(targetNode._objectTouching) >= 0) {
            SegmentHelper.track(SEGMENT.OBJECT_PICK_END, 
                { 
                    room: "room", 
                    object_name:  targetNode.getObjectName(targetNode._objectTouching)
                });
        }

        if (targetNode._objectDisableds.indexOf(targetNode._objects[0]) < 0)
            targetNode.runTutorial(false);

        targetNode._objectTouching = null;
        targetNode.runSparklesEffect();

        jsb.AudioEngine.play2d("sounds/drop.mp3");
    },

    processGameLogic: function() {
        this._removeWarnLabel();

        this._objectTouching.setLocalZOrder(Z_OBJECT_SELECTED);
        this._objectTouching.stopAllActions();
        this.removeObjectAction();
        this._lastClickTime = this._hudLayer.getRemainingTime();
        this.playObjectSound(true);
        // this._objectTouching.shaderProgram = cc.shaderCache.getProgram("SpriteDistort");
        var shader = this._objectTouching.shaderProgram;
        var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        shaderState.setUniformInt("enabled", 1);
        this._selectedShadeShader = shaderState;

        //set shadeObject to visible
        var index = this.getObjectIndex(this._objectTouching);
        if (!this.hadObjectRequired()) {
            this.hideAllShadow();
        }
        this.highLightObjectCorrectPos(index);
        this._shadeObjects[index].visible = true;

    },

    runObjectAction: function(object, delayTime, func) {
        object.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(func)
        ));
    },

    highLightObjectCorrectPos: function(index) {
        var shadeObject = this._shadeObjects[index];
        this._currentObjectShadeZOrder = shadeObject.getLocalZOrder();

        var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.SolidColor_fsh);
        shadeObject.shaderProgram = shader;
        shadeObject.runAction(cc.repeatForever(cc.sequence(
            cc.tintTo(0.25, 140, 130, 200),
            // cc.tintTo(0.25, 6, 66, 94),
            cc.tintTo(0.25, 186, 186, 186))));

        shadeObject.setLocalZOrder(Z_SHADE_SELECTED);

        this._effectLayerShade = AnimatedEffect.create(shadeObject, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
    },

    handleObjectCorrectPos: function(index) {
        if (!this._objectTouching)
            return;
        var objectPos = this._objectTouching.getPosition();
        var shadePos = this._shadeObjects[index].getPosition();
        var distance = cc.pDistance(objectPos, shadePos);
        cc.audioEngine.stopAllEffects();
        if (distance < 100) {
            // this.popGold(shadePos);
            this._objectTouching.setPosition(shadePos);
            this._objectTouching.setLocalZOrder(Z_OBJECT);
            this._objectTouching.userData.scaleFactor = 0.5;
            this._objectDisableds.push(this._objectTouching);

            this.removeObjectAction();
            this.playObjectSound(false);
            this.updateProgressBar();
            this._shadeObjects[index].setLocalZOrder(-1);

            this._hudLayer.popGold(1, shadePos.x, shadePos.y);
        }
        if (!this.hadObjectRequired())
            this.showAllShadows();
    },

    getObjectPosWithTouchedPos: function(touchedPos) {
        if (this._objectTouching == null)
            return null;

        var objectAnchorPoint = this._objectTouching.getAnchorPoint();
        var objectSize = this._objectTouching.getContentSize();

        var delta = (objectAnchorPoint.y < 0.5) ? 0.5 : 1;

        var objectPosDistance = cc.p(objectSize.width*(1 - objectAnchorPoint.x),
                                    -objectSize.height/2* delta);

        var objectPosition = cc.pSub(touchedPos, objectPosDistance);

        return objectPosition;
    },

    getObjectName: function(object) {
        for (var i = 0; i < this._objectNames.length; i++) {
            if (object.tag === this._objectNames[i].tag)
                return this._objectNames[i].name;
        }
    },

    isObjectDisabled: function(objectTouching) {
        for (var i = 0; i < this._objectDisableds.length; i++) {
            if (objectTouching === this._objectDisableds[i]){
                return true;
            }
        }
    },

    playObjectSound: function(isDragging){
        var self = this;
        if (!this._objectTouching)
            return;

        var objectName = this.getObjectName(this._objectTouching);
        var object = this._objectTouching;
        var str = objectName[0].toUpperCase();
        var soundConfig = this.getSoundConfigByName(objectName);
        // cc.log("soundConfig: " + soundConfig.length);
        var soundSuffix = isDragging ? "-1" : "";
        // Show cutscene
        var oldZOrder = object.getLocalZOrder();
        if (!isDragging) {
            str = objectName;
            var mask = new cc.LayerColor(cc.color(0, 0, 0, 200));
            this.addChild(mask, 10000);
            this._maskLayer = mask;

            object.setLocalZOrder(Z_OBJECT);

            var blockFlag = true;
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) { return true; },
                onTouchEnded: function(touch, event) {
                    if (GAME_CONFIG.needTouchToHideCutScene) {
                        if (blockFlag)
                            return;

                        self._blockAllObjects = false;
                        self._removeWarnLabel();

                        mask.removeFromParent();
                        self._mask = null;

                        if (self._objectTouching)
                            self._objectTouching.setLocalZOrder(oldZOrder);
                    }
                }
            }, mask);
        }

        if (this._effectAudioID)
            jsb.AudioEngine.stop(this._effectAudioID);
        
        this._effectAudioID = jsb.AudioEngine.play2d("res/sounds/words/" + localize(objectName) + soundSuffix + ".mp3", isDragging);

        if (!isDragging)
        {
            self._blockAllObjects = true;
            // self.createWarnLabel(str);
            self.createCompletedObject(str);
            self.runAction(cc.sequence(
                cc.delayTime(Math.max(soundConfig.length, 3)),
                cc.callFunc(function() {
                    if (GAME_CONFIG.needTouchToHideCutScene) {
                        blockFlag = false;
                    } else {
                        self._blockAllObjects = false;
                        // self._removeWarnLabel();
                        // self._completedObj.removeFromParent();
                        // self._completedObj = null;

                        if (self._maskLayer) {
                            self._maskLayer.removeFromParent();
                            self._maskLayer = null;
                        }
                        if (self._objectTouching)
                            self._objectTouching.setLocalZOrder(oldZOrder);

                        self.checkWonGame();
                    }
                })
            ));
        }
    },

    updateProgressBar: function() {
        var percent = this._objectDisableds.length / this._data.length;
        this._hudLayer.setCurrentGoals(this._objectDisableds.length);
        this._hudLayer.updateTotalGoalsLabel();
        this._hudLayer.setProgressBarPercentage(percent);
    },

    runSoundCountDown: function() {
        this.schedule(this.addSoundCountDown, CLOCK_INTERVAL, this._hudLayer.getRemainingTime())
    },

    addSoundCountDown: function() {
        if (this._hudLayer.getRemainingTime() == COUNT_DOWN_TIME){
            jsb.AudioEngine.play2d("res/sounds/Countdown.mp3")
        }
    },

    runHintObjectUp: function() {
        this.schedule(this.showHintObjectUp, CLOCK_INTERVAL, this._hudLayer.getRemainingTime());
    },

    runSparklesEffect: function() {
        for ( var i = 0; i < this._objects.length; i++) {
            if (this.isObjectDisabled(this._objects[i]))
                continue;

            var effect = AnimatedEffect.create(this._objects[i], "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
            this._effectLayers.push(effect)
        }
    },

    _removeWarnLabel: function() {
        if (this._warningLabel)
            this._warningLabel.removeFromParent();
        this._warningLabel = null;
    },

    removeObjectAction: function() {
        for (var i = 0; i < this._objects.length; i++) {
            this._objects[i].removeAllChildren();
        }
        this._effectLayers = [];
    },

    showHintObjectUp: function() {
        if (this._objectTouching)
            return;
        var deltaTime = this._lastClickTime - this._hudLayer.getRemainingTime();
        if (deltaTime == TIME_HINT) {
            if (this._objects.length > 0) {
                var i = Math.floor(Math.random() * (this._objects.length - 1));
                if (this.isObjectDisabled(this._objects[i]))
                    return;
                var oldScale = this._objects[i].userData.scaleFactor;
                this._objects[i].runAction(                               
                                        cc.sequence(
                                            cc.scaleTo(0.1, 0.7 * oldScale),
                                            cc.scaleTo(0.3, 1.05 * oldScale),
                                            cc.scaleTo(0.1, 0.7 * oldScale),
                                            cc.scaleTo(0.3, 1.05 * oldScale),
                                            cc.scaleTo(0.1, 1 * oldScale),
                                            cc.callFunc(function() {
                                                if (self._hudLayer)
                                                    self._lastClickTime = self._hudLayer.getRemainingTime();
                                            })
                                        )                 
                );
            }
        }
    },

    increaseAmountGamePlayed: function() {
        Global.NumberGamePlayed += 1;
        Global.NumberRoomPlayed++;
    },

    hadObjectRequired: function() {
        var requireObjectsToHideAllShadow = GAME_CONFIG.requireObjectsToHideAllShadow;
        if (this._data.length >= requireObjectsToHideAllShadow)
            return true;
        else
            return false;
    },

    showAllShadows: function() {
        if (this._shadeObjects.length > 0)
            for ( var i = 0; i< this._shadeObjects.length; i++) {
                this._shadeObjects[i].visible = true;
                this._shadeObjects[i].setLocalZOrder(Z_SHADE);
            }
    },

    hideAllShadow: function() {
        if (this._shadeObjects.length > 0)
            for ( var i = 0; i< this._shadeObjects.length; i++) {
                    this._shadeObjects[i].visible = false;
            }
    },

    _moveToNextScene: function() {
        Utils.updateStepData();
        for (var i = 0; i < this._objectDisableds.length; i++) {
            this._objectDisableds[i].removeFromParent();
            this._shadeObjects[i].removeFromParent();
        }

        this._hudLayer.removeFromParent();

        var self = this;
        cc.audioEngine.stopMusic();
        var numberScene = KVDatabase.getInstance().getInt("scene_number");
        var durationArray = JSON.parse(KVDatabase.getInstance().getString("durationsString"));
        cc.log("numberScene: " + numberScene);
        cc.log("durationArray: " + JSON.stringify(durationArray));
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        SceneFlowController.getInstance().moveToNextScene(nextSceneName, JSON.stringify(this._data), durationArray[numberScene]);
    },

    _fetchObjectData: function(data) {
        // data = JSON.parse(data);
        cc.log("_fetchObjectData data: " + data);
        if (data)
            this._data = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0];
                else
                    return id;
            });
        else
            this._data = [];

        cc.log("data after map: " +JSON.stringify(this._data));
    },

    _processObjectData: function(bedroomObjects) {
        var self = this;
        cc.log("BEDROOM_ITEMS: " + JSON.stringify(BEDROOM_ITEMS));
        this._data.forEach(function(obj) {
            cc.log("processGameLogic: obj: " + obj.value);
            for(var i = 0; i < BEDROOM_ITEMS.length; i++) {
                var item = BEDROOM_ITEMS[i];
                if (obj.value === item.imageName) {
                    bedroomObjects.push(item);
                }
            }
        });
    },

    popGold: function(from) {
        this._hudLayer.popGold(1, from.x, from.y);
    },
});

var RoomScene = cc.Scene.extend({
    ctor: function(data, timeForScene) {
        this._super();
        this.name = "room";
        var roomLayer = new RoomLayer(data, timeForScene);
        this.addChild(roomLayer);
    }
});