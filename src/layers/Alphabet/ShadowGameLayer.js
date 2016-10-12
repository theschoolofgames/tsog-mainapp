var Z_OBJECT = 4;
var Z_SHADE = 3;
var Z_OBJECT_SELECTED = 10;
var Z_SHADE_SELECTED = 9;

var ShadowGameLayer = TestLayer.extend({
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
    _gameObjectJson: null,
    _objectIdArray: ["number_5", "cat", "word_a", "shape_triangle","number_4", "number_3", "word_b", "word_c"],
    _objectsArray: [],


    ctor: function(objectIdArray) {
        // console.log("Array Checked => \n" + JSON.stringify(objectIdArray));
        // console.log("Array Checked Length => " + objectIdArray.length);
        this._super(cc.color.WHITE);

        // cc.spriteFrameCache.addSpriteFrames(res.Figure_Game_Plist);
        
        this.tag = 1;
        this._kvInstance = KVDatabase.getInstance();
        this.resetAllArrays();
        this.setVolume();

        this._filterObjectsByType(objectIdArray);

        this.addObjects(this._objectsArray);
        
        this.addHud();
        // this.runTutorial(false);
        this.runHintObjectUp();
        this.runSoundCountDown();
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved,
                onTouchEnded: this.onTouchEnded
        }, this);

        // SegmentHelper.track(SEGMENT.LEVEL_START, 
        //     { 
        //         room: "room", 
        //         object_num: this._objectsArray.length
        //     });
        // cc.audioEngine.playMusic(res.background_mp3, true);
        // this.scheduleUpdate();

        Utils.showVersionLabel(this);
    },

    // only accept object with type: animals and objects
    _filterObjectsByType: function(objectIdArray) {
        this._parseGameObjectJSON();
        var tempArray = [];
        if (!this._gameObjectJson || this._gameObjectJson.length == 0)
            return;

        for (var i = 0; i < objectIdArray.length; i++){            
            let itemObject = this._gameObjectJson.find((gameObject) => {
                return gameObject.id === objectIdArray[i];
            });

            if (itemObject.type !== "color"){
                tempArray.push({id: itemObject.id, type: itemObject.type, value: itemObject.value, hasClone: false, index: 0});
            }
        }

        // Sort and check if objects has clones
        tempArray.sortOn("id");
        for (var i = 0; i < tempArray.length; i++){
            if (tempArray.length == 1)
                break;

            if ((i - 1) >= 0 && (tempArray[i - 1].id == tempArray[i].id)){
                tempArray[i].hasClone = true;
                tempArray[i].index = tempArray[i - 1].index + 1;
            }

            if ((i + 1) < tempArray.length && (tempArray[i].id == tempArray[i + 1].id)){
                tempArray[i].hasClone = true;
            }
        }

        this._objectsArray = tempArray;
        this.setData(JSON.stringify(this._objectsArray));
    },

    _parseGameObjectJSON: function() {
        let self = this;
        cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
            if (!err) {
                self._gameObjectJson = data;
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Game_Object_JSON);
                cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
                    self._gameObjectJson = data;
                });
            }
        });

        console.log("GameObjects => " + self._gameObjectJson.length);
    },

    onEnterTransitionDidFinish: function() {
        cc.log("RoomLayer onEnterTransitionDidFinish");
        this._super();
        // this.playBeginSound();
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

    onExit: function() {
        this._super();

        this._objectTouching = null;
    },

    update: function(pDt) {
        this._totalAngle += pDt;
        if(this._totalAngle >= 180)
            this._totalAngle -= 180;

        // if (this._selectedShadeShader)
        //     this._selectedShadeShader.setUniformFloat("eTime", this._totalAngle);
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

            var audioId = jsb.AudioEngine.play2d("res/sounds/beginroom-sound_" + nation + ".mp3", false);
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

    addHud: function() {
        var hudLayer = new HudLayer(this);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
    },

    runTutorial: function(shouldShuffle) {
        this._tutorial = new TutorialLayer(this._objects, this._shadeObjects, shouldShuffle);
        if(Global.NumberGamePlayed < 2)
            this.addChild(this._tutorial, 1000)
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

    // One side of screen (960x640) => (480x640)
    // Each grid is 80x80 => 4 cell in width, 5 cell in height (except the header(2 rows) & bottom row, right & left column)
    generateCoordinateArray: function() { 
        let gridCellSize = 80;
        let coorArray = [];

        for (var i = 0; i < 4; i++){
            let pointX = gridCellSize + gridCellSize / 2 + gridCellSize * i;

            for (var j = 0; j < 5; j++){
                let pointY = gridCellSize + gridCellSize / 2 + gridCellSize * j;

                let offsetX = 0;
                if (j % 2 === 0)
                    offsetX = gridCellSize / 2;

                let objPosition = {
                    x: pointX + offsetX,
                    y: pointY,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    z: 5
                };

                coorArray.push(objPosition);
            }
        }

        return coorArray;
    },

    addObjects: function(objectArray) {
        var coordinateObjectArray = shuffle(this.generateCoordinateArray());
        var coordinateShadeArray = shuffle(this.generateCoordinateArray());
        let sortCoordinateShadeArray = coordinateShadeArray.slice(0);
        sortCoordinateShadeArray.sortOn("y");
        // console.log("CoordinateArray: " + JSON.stringify(coordinateShadeArray));
        for ( var i = 0; i < objectArray.length; i++) {
            this.addObjectButton(coordinateObjectArray[i], objectArray[i], i);
        }

        let objectArrayClone = objectArray.slice(0);
        let index = 0;
        let lastCloneObjectPos = cc.p(-100, -100);
        while (objectArrayClone.length > 0){
            let object = objectArrayClone.shift();
            if (!object.hasClone || object.index == 0){
                let pos = coordinateShadeArray.shift();
                this.addObjectShade(pos, object);
                if (object.index == 0)
                    lastCloneObjectPos = pos;
                else 
                    lastCloneObjectPos = cc.p(-100, -100);
            }
            else {
                for (var i = 0; i < coordinateShadeArray.length; i++){
                    if (coordinateShadeArray[i].y == lastCloneObjectPos.y){
                        let posArray = coordinateShadeArray.splice(i, 1);
                        this.addObjectShade(posArray[0], object);
                        break;
                    }
                }
            }
        }

        this.runSparklesEffect();
    },

    addObjectButton: function(objPosition, gameObject, index) {
        // console.log("Object position: " + JSON.stringify(objPosition));
        self = this;
        NativeHelper.callNative("customLogging", ["Sprite", "objects/" + gameObject.id + ".png"]);
        let objImageName = "";
        let imageName = gameObject.value;
        let imageDir = "";
        if (gameObject.type === "object"){
            imageDir = "objects/";
        }
        else if (gameObject.type === "animal"){
            imageDir = "animals/";
        }
        else if (gameObject.type === "shape"){
            imageDir = "#";
        }
        
        objImageName = imageDir + imageName + ".png";
        var object = null;

        if (gameObject.type === "number" || gameObject.type === "word"){
            object = new cc.LabelBMFont(imageName, "hud-font.fnt");
            object.setScale(3.0);
            object.color = cc.color("#ffd902");
            object.setAnchorPoint(objPosition.anchorX, objPosition.anchorY);
            object.x = objPosition.x;
            object.y = objPosition.y;
        }
        else {
            var object = new cc.Sprite(objImageName);
            object.setAnchorPoint(objPosition.anchorX, objPosition.anchorY);

            object.x = objPosition.x;
            object.y = objPosition.y;
            object.scale = Math.min(70 / object.width, 70 / object.height) * Utils.screenRatioTo43();
        }
        
        object.tag = index;
        object.userData = { scaleFactor: object.scale, imageName: objImageName, hasClone: gameObject.hasClone, index: gameObject.index}
        this.addChild(object, Z_OBJECT);

        this._objectNames.push({name: gameObject.id, type: gameObject.type, value: gameObject.value, tag: object.tag});

        this.animateObjectIn(object, index);
        this._objects.push(object);
        this.runObjectAction(this, 0,
            function(){
                if (Global.NumberGamePlayed)
                self._lastClickTime = self._hudLayer.getRemainingTime();
            }
        )
    },

    addObjectShade: function(objectPosition, gameObject) {
        console.log("ObjectShade position: " + JSON.stringify(objectPosition));
        NativeHelper.callNative("customLogging", ["Sprite", "objects/" + gameObject.id + ".png"]);

        let shadeImageName = "";
        let imageName = gameObject.value;
        let imageDir = "";
        if (gameObject.type === "object"){
            imageDir = "objects/";
        }
        else if (gameObject.type === "animal"){
            imageDir = "animals/";
        }
        else if (gameObject.type === "shape"){
            imageDir = "#";
            imageName += "-shadow";
        }

        shadeImageName = imageDir + imageName + ".png";
        console.log("ShadeImageName => " + shadeImageName);
        var shadeObject = null;

        var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.SolidColor_fsh);
        var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        shaderState.setUniformInt("enabled", 0);

        if (gameObject.type === "number" || gameObject.type === "word"){
            shadeObject = new cc.LabelBMFont(imageName, "hud-font.fnt");
            shadeObject.setScale(3.0);
            shadeObject.color = cc.color("#ffd902");
            shadeObject.setAnchorPoint(objectPosition.anchorX, objectPosition.anchorY);
            shadeObject.x = objectPosition.x + cc.winSize.width / 2;
            shadeObject.y = objectPosition.y;

            shadeObject.children[0].shaderProgram = shader;
            shadeObject.color = cc.color(140, 130, 200);
        }
        else {
            shadeObject = new cc.Sprite(shadeImageName);
            shadeObject.setAnchorPoint(objectPosition.anchorX, objectPosition.anchorY);
            shadeObject.x = objectPosition.x + cc.winSize.width / 2;
            shadeObject.y = objectPosition.y;
            shadeObject.scale = Math.min(70 / shadeObject.width, 70 / shadeObject.height) * Utils.screenRatioTo43();

            shadeObject.visible = true;
            this._currentObjectShadeZOrder = shadeObject.getLocalZOrder();

            shadeObject.shaderProgram = shader;
        }

        shadeObject.color = cc.color(140, 130, 200);
        this._effectLayerShade = AnimatedEffect.create(shadeObject, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);

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
        if (this._objectDisableds.length == this._objectsArray.length)
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

        let touchedObject = this.getObjectByName(lbName);
        if (!touchedObject)
            return;
        cc.log("Touched Object name %s, type %s, value %s", touchedObject.name, touchedObject.type, touchedObject.value);

        // var randSchoolIdx = Math.floor(Math.random() * 4);
        // font = FONT_COLOR[randSchoolIdx];
        lbName = lbName.toUpperCase();
        var objLabel = new cc.LabelBMFont(touchedObject.value, "hud-font.fnt");
        objLabel.scale = 3.0;
        objLabel.x = cc.winSize.width/2;
        objLabel.y = cc.winSize.height/2 - 100;
        this._maskLayer.addChild(objLabel);

        if (touchedObject.type != "word" && touchedObject.type != "number"){
            cc.log("Its not word or number");
            objLabel.scale = 1.5;
            this._completedObj = new cc.Sprite(this._objectTouching.userData.imageName);
            this._completedObj.x = cc.winSize.width/2;
            this._completedObj.y = objLabel.y + this._completedObj.height/2 + 50;
            this._maskLayer.addChild(this._completedObj);
        }
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
                    // self._backToHome();
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
        console.log("getSoundConfigByName => " + imageName);
        // Check type of object 
        let objectType = this._getTypeObjectByName(imageName);
        let soundArray = [];

        console.log("getSoundConfigByName Type => " + objectType);

        if (objectType == "object"){
            soundArray = OBJECT_SOUNDS_LENGTH;
        }
        else if (objectType == "animal"){
            soundArray = ANIMAL_SOUNDS_LENGTH;
        }

        var strName = imageName.toUpperCase();
        for ( var i = 0; i < soundArray.length; i++) {
            if (strName === soundArray[i].name) {
                return soundArray[i];
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

        // SegmentHelper.track(SEGMENT.OBJECT_PICK_START, 
        //     { 
        //         room: "room", 
        //         object_name: targetNode.getObjectName(targetNode._objectTouching)
        //     });
        
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
        targetNode._shadeObjects[index].stopAllActions();
        targetNode._shadeObjects[index].setColor(cc.color(140, 130, 200));
        targetNode._objectTouching.setLocalZOrder(Z_OBJECT);
        targetNode.handleObjectCorrectPos(index);

        targetNode._objectTouching.stopAllActions();
        targetNode._objectTouching.runAction(cc.sequence(
            cc.EaseBounceInOut(cc.scaleTo(0.2, 0.7 * targetNode._objectTouching.userData.scaleFactor)),
            cc.EaseBounceInOut(cc.scaleTo(0.2, 1 * targetNode._objectTouching.userData.scaleFactor))
        ));

        if (targetNode._objectDisableds.indexOf(targetNode._objects[0]) < 0)
            targetNode.runTutorial(false);

        targetNode._objectTouching = null;
        // targetNode.runSparklesEffect();

        jsb.AudioEngine.play2d("sounds/drop.mp3");
    },

    processGameLogic: function() {
        this._removeWarnLabel();

        this._objectTouching.setLocalZOrder(Z_OBJECT_SELECTED);
        this._objectTouching.stopAllActions();
        // this.removeObjectAction();
        this._lastClickTime = this._hudLayer.getRemainingTime();
        // this.playObjectSound(true);
        // this._objectTouching.shaderProgram = cc.shaderCache.getProgram("SpriteDistort");
        // var shader = this._objectTouching.shaderProgram;
        // var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
        // shaderState.setUniformInt("enabled", 1);
        // this._selectedShadeShader = shaderState;

        //set shadeObject to visible
        var index = this.getObjectIndex(this._objectTouching);
        
        this.hideAllShadow();
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
            // if (this._objectTouching.userData.hasClone && this._objectTouching.userData.index > 0){
            //     let cloneObjects = this._objectDisableds.filter((object) => {
            //         return (object.userData.index < this._objectTouching.userData.index);
            //     });
            //     console.log("Clone Touched Object " + JSON.stringify(cloneObjects));
            // }

            this._objectTouching.setPosition(shadePos);
            this._objectTouching.setLocalZOrder(Z_OBJECT);
            // this._objectTouching.userData.scaleFactor = 0.5;
            this._objectDisableds.push(this._objectTouching);

            // this.removeObjectAction();
            this.playObjectSound(false);
            this.updateProgressBar();
            this._shadeObjects[index].matched = true;
            this._shadeObjects[index].setLocalZOrder(0);
            this._shadeObjects[index].setVisible(false);
        }
        // if (!this.hadObjectRequired())
        //     this.showAllShadows();
        this.showAllShadows();
    },

    getObjectPosWithTouchedPos: function(touchedPos) {
        if (this._objectTouching == null)
            return null;
        
        var objectAnchorPoint = this._objectTouching.getAnchorPoint();
        var objectSize = cc.size(this._objectTouching.getBoundingBox().width, this._objectTouching.getBoundingBox().height);
        // cc.log("Touched Object (bounding) size (%d, %d)", objectSize.width, objectSize.height);

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
        var soundLength = 3;
        if (soundConfig)
            soundLength = soundConfig.length;
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

        // Check type of current object
        var soundDir = "";
        var touchedObjectType = this._getTypeObjectByName(objectName);

        if (touchedObjectType == "object"){
            soundDir = "res/sounds/objects/";
        }
        else if (touchedObjectType == "animal"){
            soundDir = "res/sounds/animals/";
        }
        else if (touchedObjectType == "word"){
            soundDir = "res/sounds/alphabets/";
            objectName = objectName.toUpperCase();
        }

        if (object.userData.hasClone){
            let audioId = jsb.AudioEngine.play2d("res/sounds/numbers/" + (object.userData.index + 1) + ".mp3", isDragging);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                jsb.AudioEngine.play2d(soundDir + objectName + soundSuffix + ".mp3", isDragging);
            });
        }
        else {
            this._effectAudioID = jsb.AudioEngine.play2d(soundDir + objectName + soundSuffix + ".mp3", isDragging);
        }

        if (!isDragging)
        {
            self._blockAllObjects = true;
            // self.createWarnLabel(str);
            self.createCompletedObject(str);
            self.runAction(cc.sequence(
                cc.delayTime(Math.max(soundLength, 3)),
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

    _getTypeObjectByName: function(objectName) {
        for (var i = 0; i < this._objectsArray.length; i++){
            if (this._objectsArray[i].id === objectName)
                return this._objectsArray[i].type;
        }

        return "";
    },

    getObjectByName: function(objectName){
        for (var i = 0; i < this._objectsArray.length; i++){
            if (this._objectsArray[i].id === objectName)
                return this._objectsArray[i];
        }

        return null;
    },

    updateProgressBar: function() {
        var percent = this._objectDisableds.length / this._objectsArray.length;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._objectDisableds.length, this._objectsArray.length);

        var starEarned = 0;
        var objectCorrected = this._objectDisableds.length;
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
        var starGoal1 = Math.ceil(this._objectsArray.length/3);
        var starGoal2 = Math.ceil(this._objectsArray.length/3 * 2);
        var starGoal3 = this._objectsArray.length;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
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
        if (this._objectsArray.length >= requireObjectsToHideAllShadow)
            return true;
        else
            return false;
    },

    showAllShadows: function() {
        if (this._shadeObjects.length > 0)
            for ( var i = 0; i< this._shadeObjects.length; i++) {
                if (!this._shadeObjects[i].matched){
                    this._shadeObjects[i].visible = true;
                    this._shadeObjects[i].setLocalZOrder(Z_SHADE);
                }
            }
    },

    hideAllShadow: function() {
        if (this._shadeObjects.length > 0)
            for ( var i = 0; i< this._shadeObjects.length; i++) {
                    this._shadeObjects[i].visible = false;
            }
    },

    _backToHome: function() {
        cc.director.replaceScene(new cc.TransitionFade(1, new MainScene(), cc.color(255, 255, 255, 255)));
    },

    // _moveToNextScene: function() {
    //     for (var i = 0; i < this._objectDisableds.length; i++) {
    //         this._objectDisableds[i].removeFromParent();
    //         this._shadeObjects[i].removeFromParent();
    //     }

    //     this._hudLayer.removeFromParent();

    //     var self = this;
    //     cc.audioEngine.stopMusic();
    //     // var speakingTestScene = new SpeakingTestScene(this._objectNames, "ForestScene", "RoomScene");
    //     var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
    //     var scene;
    //     if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
    //         scene = new window[nextSceneName](this._objectNames, "RoomScene");
    //     else
    //         scene = new window[nextSceneName]();
    //     cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    // },
});

var ShadowGameScene = cc.Scene.extend({
    ctor: function(objectIdArray) {
        this._super();
        var layer = new ShadowGameLayer(objectIdArray);
        this.addChild(layer);
    }
});