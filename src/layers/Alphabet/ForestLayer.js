var ForestLayer = cc.Layer.extend({
    _effectLayers: [],
    _objects: [],
    _objectDisableds: [],
    _animalNames: [],
    _kvInstance: null,
    _blockLayer: null,
    _hudLayer: null,
    _animalPos: null,
    _animalName: null,
    _dsInstance: null,
    _background: null,
    _warningLabel: null,
    _objectTouching: null,
    _countDownClock: null,
    _totalSeconds: 0,
    _touchCounting: 0,
    _star: 0,
    _lastClickTime : 0,
    _blockAllObjects: false,

    _allScale: 1,
    _warnLabel: null,

    _tutorial:null,
    _shadeObjects:null,
    _isWinLabel: false,
    _completedObj: null,
    _maskLayer: null,
    _treeElements: [],

    _data: [],
    _isTestScene: false,

    ctor: function(data, isTestScene) {
        this._super();
        cc.log("isTestScene: " + isTestScene);
        this._isTestScene = isTestScene;
        this.tag = 1;
        this._fetchObjectData(data);
        this._dsInstance = ConfigStore.getInstance();
        this._kvInstance = KVDatabase.getInstance();
        this.resetObjectArrays();
        this.setVolume();
        this.createBackground();
        // this.showAllAnimals();
        this.createAnimals();
        // this.addBackButton();
        // this.addRefreshButton();
        // this.createStarsLabel();
        this.addHud();
        this.runTutorial();
        this.runHintObjectUp();
        this.runSoundCountDown();

        SegmentHelper.track(SEGMENT.LEVEL_START, 
                    { 
                        room: "forest", 
                        object_num: Global.NumberItems
                    });

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan
        }, this);
        // cc.audioEngine.playMusic(res.background_mp3, true);
        // this.scheduleUpdate();

        Utils.showVersionLabel(this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this.playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
        // this.completedScene();
    },

    playBeginSound: function(){
        var didInstructionSoundPlay = KVDatabase.getInstance().getInt("beginSound_ForestScene", 0);
        if (didInstructionSoundPlay == 0) {
            var nation = Utils.getLanguage();
            // cc.log("nation: %s", nation);

            var audioId = jsb.AudioEngine.play2d("sounds/beginforest-sound_" + nation + ".mp3", false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                // mask.removeFromParent();
                cc.audioEngine.playMusic(res.background_mp3, true);
            });
            KVDatabase.getInstance().set("beginSound_ForestScene", 1);
        }else 
            cc.audioEngine.playMusic(res.background_mp3, true);
    },

    setVolume:function() {
        cc.audioEngine.setMusicVolume(0.1);
        cc.audioEngine.setEffectsVolume(0.7);
    },

    addHud: function() {
        var hudLayer = new HudLayer(this);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);

        this._hudLayer = hudLayer;
        if (Global.NumberGamePlayed > 1 )
            this._lastClickTime = this._hudLayer.getRemainingTime();
    },

    createBackground: function() {

        NativeHelper.callNative("customLogging", ["Sprite", "BG.jpg"]);
        var background = new cc.Sprite("BG.jpg");
        this._allScale = cc.winSize.width / background.width;

        background.x = cc.winSize.width;
        background.y = cc.winSize.height / 2;
        background.anchorX = 1;
        // background.scale = this._allScale;
        background.setLocalZOrder(-1);
        this.addChild(background);

        var forestBgData = this._dsInstance.getPositions(FOREST_BACKGROUND_ID);
        for ( var i = 0; i < forestBgData.length; i++) {
            var element = forestBgData[i];

            NativeHelper.callNative("customLogging", ["Sprite", element.imageName]);
            var backgroundElt = new cc.Sprite(element.imageName);
            backgroundElt.x = element.x;
            backgroundElt.y = element.y;
            backgroundElt.setAnchorPoint(element.anchorX, element.anchorY);
            backgroundElt.scale = this._allScale;
            this.addChild(backgroundElt, element.z);
            if (element.imageName.indexOf("tree") > -1)
                this._treeElements.push(backgroundElt);
            if (i < 3)
                this.runCloudsAction(backgroundElt);
        }
    },

    runCloudsAction: function(element) {
        var randomedRunningTime = 0;
        var endPoint = null;
        randomedRunningTime = (Math.random() * 5 + 1) * 100;
        endPoint = cc.p(cc.winSize.width, element.y);
        element.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveTo(randomedRunningTime, endPoint)
                )
            )
        )
    },

    createAnimals: function() {
        var animals = [];
        var allAnimals = this._dsInstance.getObjects(FOREST_ID);
        var rdmAnimalType = this._getRandomAnimalType(this._data.length);
        if (this._data.length) {
            for (var i = 0; i < this._data.length; i++) {
                var obj = this._data[i];
                for (var j = 0; j < allAnimals.length; j++) {
                    var a = allAnimals[j];
                    if (obj.value === a.imageName) {
                        cc.log("obj value -> " + obj.value);
                        // cc.log("a.imageName -> " + a.imageName);
                        cc.log("a -> " + JSON.stringify(a));
                        animals.push(a);
                        break;
                    }
                    else if (obj.id.indexOf("number") > -1) {
                        cc.log("obj -> " + JSON.stringify(obj));
                        cc.log("rdmAnimalType -> " + JSON.stringify(rdmAnimalType));
                        animals.push({
                            "imageName": obj.value,
                            "type": rdmAnimalType[0]
                        });
                        rdmAnimalType.splice(0, 1);
                        break;
                    }
                }
            }
            cc.log("animals : " + JSON.stringify(animals));
        }
        else
            animals = this._dsInstance.getRandomObjects(FOREST_ID, Global.NumberItems);

        // cc.log("Global.NumberItems: " + Global.NumberItems);
        var shuffledArrays = this.addShuffledAnimalPosArray();
        var numbItemsShow = this._data.length;
        cc.log("numbItemsShow: " + numbItemsShow);
        for ( var i = 0; i < numbItemsShow; i++) {
            var animalPositionArray = this.getAnimalPositionType(animals[i].type, shuffledArrays);
            this.createAnimal(animalPositionArray[i], animals[i], i);
            cc.log("animals[i] : " + JSON.stringify(animals[i]));
            cc.log("animalPositionArray[i] : " + JSON.stringify(animalPositionArray[i]));
        }
        this.runSparklesEffect();
    },

    _isTouchingEnableObject: function(touchedPos) {
        var distance = 0;
        var objBoundingBox = null;
        for ( var i = 0; i < this._objects.length; i++) {
            objBoundingBox = this._objects[i].getBoundingBox();
            var isRectContainsPoint = cc.rectContainsPoint(objBoundingBox, touchedPos);
            if (isRectContainsPoint) {
                this._objectTouching = this._objects[i];
                this._objects.splice(i,1);
                return true;
            }
        }
    },

    _isTouchingDisabledObject: function(touchedPos) {
        //check if touched on a disabled animal --> play its sound but not process anything
        var distance = 0;
        var objBoundingBox = null;
        for ( var i = 0; i < this._objectDisableds.length; i++) {

            objBoundingBox = this._objectDisableds[i].getBoundingBox();
            cc.log("_isTouchingDisabledObject getting objBoundingBox");
            var isRectContainsPoint = cc.rectContainsPoint(objBoundingBox, touchedPos);
            if (isRectContainsPoint) {
                // cc.log("isRectContainsPoint")
                this._objectTouching = this._objectDisableds[i];
                this.playAnimalSound();
                return true;
            }
        }
    },

    _checkTouchingTree: function(touchedPos) {
        var objBoundingBox = null;
        for (var i = (this._treeElements.length-1); i > 0; i--) {
            var elm = this._treeElements[i];
            if (elm) {
                objBoundingBox = elm.getBoundingBox();
                var isRectContainsPoint = cc.rectContainsPoint(objBoundingBox, touchedPos);
                if (isRectContainsPoint) {
                    // cc.log("Touching tree");
                    elm.runAction(
                        cc.sequence(
                            cc.scaleTo(0.1, 1.03),
                            cc.scaleTo(0.1, 1)
                        )
                    )
                    var rdmSoundidx = Math.ceil(Math.random() * 5);
                    var soundPath = "sounds/forest-bird-sound/bird-" + rdmSoundidx + ".mp3";
                    // cc.log("soundPath: " + soundPath);
                    jsb.AudioEngine.play2d(soundPath);

                    return true;
                }
            }
        }
    },

    onTouchBegan: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = touch.getLocation();

        if (targetNode._blockAllObjects)
            return false;

        targetNode._checkTouchingTree(touchedPos);

        if (!targetNode._isTouchingEnableObject(touchedPos)) {
            targetNode._isTouchingDisabledObject(touchedPos)            
            return false;
        }
        cc.log("ontouchbegan after check object is disabled or not");
        // if (targetNode._isTouchingDisabledObject(touchedPos))
        //     return false;

        // return if the objectTouching is disabled
        if (targetNode._isObjectDisabled())
            return false;
        SegmentHelper.track(SEGMENT.ANIMAL_CLICK, 
                    { 
                        forest: "forest", 
                        animal_name:  targetNode.getAnimalName(targetNode._objectTouching)
                    });
        if(targetNode._tutorial != null) {
            targetNode._tutorial.removeFromParent();
            targetNode._tutorial = null;
        };
        cc.log("prepare to processGameLogic");
        targetNode.processGameLogic();
        targetNode.runSparklesEffect();
        cc.log("done to processGameLogic");
        if (targetNode._objectDisableds.length == Global.NumberItems) {
            SegmentHelper.track(SEGMENT.LEVEL_COMPLETE,
                {
                    forest: "forest",
                    time_taken: targetNode._hudLayer._clock.getElapseTime()
                });
        };    
        cc.log("done onTouchBegan");
        return true;
    },

    _isObjectDisabled: function() {
        for (var i = 0; i < this._objectDisableds.length; i++) {
            if (this._objectTouching === this._objectDisableds[i]) {
                // cc.log("_isObjectDisabled")
                this.playAnimalSound();
                return true;
            }
        }
    },

    getRamdomPositionMoveto : function(radius, animalOriginPos) {
        var animalPos = null;
        animalPos = cc.p(animalOriginPos.x - Math.random() * radius + 10,
                        animalOriginPos.y - Math.random() * radius + 10);
        return animalPos;
    },

    createAnimal: function(position, animalObject, i) {
        NativeHelper.callNative("customLogging", ["Sprite", "animals/" + animalObject.imageName + ".png"]);
        var animal;
        var objImageName = "animals/" + animalObject.imageName + ".png";
        if (isNaN(animalObject.imageName)) {
            // normal Animal case
            animal = new cc.Sprite(objImageName);
            animal.userData = {imageName: objImageName};
        } else {
            // Number case
            animal = new cc.LabelBMFont(animalObject.imageName, res.CustomFont_fnt);
            // animal.scale = 2;
            // animal = new cc.LabelTTF(animalObject.imageName, "Arial", 50);
            // animal = this._createCustomFont(animalObject.imageName);
        }
        animal.setAnchorPoint(position.anchorX, position.anchorY);
        animal.x = position.x;
        animal.y = position.y;
        animal.tag = i;
        animal.setLocalZOrder(position.z);

        this.addChild(animal);
        this._animalPos = animal.getPosition();

        this._animalNames.push({name: animalObject.imageName, tag: animal.tag});

        this.animateAnimalIn(animal, animalObject.type, i);
        this._objects.push(animal);
    },

    getAnimalSoundConfigByName: function(imageName) {
        var strName = imageName.toUpperCase();
        for ( var i = 0; i < ANIMAL_SOUNDS_LENGTH.length; i++) {
            if (strName === ANIMAL_SOUNDS_LENGTH[i].name)
                return ANIMAL_SOUNDS_LENGTH[i];
        }
    },

    runAnimalAction : function(animal , itemId) {
        if (itemId === FOREST_ITEM_TYPE.BIRD_ITEM)
            this.runFlyAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.LIE_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.STAND_ITEM)
            this.runStandAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.WATER_ITEM)
            this.runStandAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.FROG_ITEM)
            this.runStandAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.MONKEY_ITEM)
            this.runStandAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.OWL_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.NEST_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.OCTOPUS_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.SNAIL_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.DOLPHIN_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.CROCODILE_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.FLY_ITEM)
            this.runLieAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.EAGLE_ITEM)
            this.runStandAnimalAction(animal);
        if (itemId === FOREST_ITEM_TYPE.SHARK_ITEM)
            this.runLieAnimalAction(animal);



    },

    runFlyAnimalAction: function(animal) {
        var animalPos = animal.getPosition();
        animal.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(MOVE_DELAY_TIME, this.getRamdomPositionMoveto(30, animalPos)),
                        cc.moveTo(MOVE_DELAY_TIME, this.getRamdomPositionMoveto(30, animalPos)),
                        cc.moveTo(MOVE_DELAY_TIME, this.getRamdomPositionMoveto(30, animalPos)),
                        cc.moveTo(MOVE_DELAY_TIME, animalPos)
                    )
                )
        )
    },

    runLieAnimalAction: function(animal) {
        animal.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(1, 0.9),
                        cc.scaleTo(1, 1.1)
                    )
                )
        )
    },

    runStandAnimalAction : function(animal) {
        animal.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.rotateBy(MOVE_DELAY_TIME, 4),
                    cc.rotateBy(MOVE_DELAY_TIME * 2, - 8),
                    cc.rotateBy(MOVE_DELAY_TIME, 4)
                    )
                )
            )
    },

    resetObjectArrays: function() {
        this._objects = [];
        this._objectDisableds = [];
        this._effectLayers = [];
        this._animalNames = [];
        this._treeElements = [];
        this._touchCounting = 0;
    },

    addRefreshButton: function() {
        var refreshButton = new ccui.Button("res/refresh-button.png", "", "");
        refreshButton.x = cc.winSize.width - refreshButton.width;
        refreshButton.y = refreshButton.height / 2;

        this.addChild(refreshButton, 100);
        var self = this;
        refreshButton.addClickEventListener(function() {
            cc.director.replaceScene(new ForestScene());
        });
    },

    addBackButton: function() {
        var backButton = new ccui.Button( "back.png",  "back-pressed.png", "");
        backButton.x = cc.winSize.width - backButton.width*3;
        backButton.y = backButton.height / 2;

        this.addChild(backButton, 100);

        var self= this;
        backButton.addClickEventListener(function() {
            cc.director.replaceScene(new RoomScene());
        });
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
        this.addChild(warnLabel, 1000);

        this._warningLabel = warnLabel;
    },

    createCompletedObject: function(animalName) {
        if (!this._maskLayer)
            return;

        var randSchoolIdx = Math.floor(Math.random() * 4);
        font = FONT_COLOR[randSchoolIdx];
        if (isNaN(animalName)) {
            var objLabel = new cc.LabelBMFont(animalName.toUpperCase(), font);
            objLabel.scale = 1.5;
            objLabel.x = cc.winSize.width/2;
            objLabel.y = cc.winSize.height/2 - 100;
            this._maskLayer.addChild(objLabel);

            this._completedObj = new cc.Sprite("animals/" + animalName + ".png");
            this._completedObj.x = cc.winSize.width/2;
            this._completedObj.y = objLabel.y + this._completedObj.height/2 + 50;
        } else {
            cc.log("before create label");
            this._completedObj = new cc.LabelBMFont(animalName, res.CustomFont_fnt);
            this._completedObj.scale = 2;
            // this._completedObj = this._createCustomFont(animalName);
            this._completedObj.x = cc.winSize.width/2;
            this._completedObj.y = cc.winSize.height/2;
            cc.log("after create label");
        }

        this._maskLayer.addChild(this._completedObj);
    },

    checkWonGame: function() {
        cc.log("checkWonGame");
        var totalItems = this._data.length ? this._data.length : Global.NumberItems;
        if (this._touchCounting == totalItems)
            this.completedScene();
    },

    createYouWin: function() {
        var lbText = "You Win";
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 0));
        this.addChild(mask, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);

        this.createWarnLabel(lbText, null, null, cc.winSize.height/2);

        var warningLabel = this._warningLabel;
        warningLabel.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(warningLabel, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }),
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5))

        ));
        cc.log("createYouWin");
        var self = this;
        this.runAction(cc.sequence(
            cc.delayTime(4),
            cc.callFunc(function() {
                warningLabel.setVisible(false);          
                mask.setLocalZOrder(-1);
                self._addSpeakingTest();
            })
        ));

        AnimatedEffect.create(warningLabel, "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);

        this.increaseAmountGamePlayeds();
        this.increaseObjectAmountBaseOnPlay();
    },

    completedScene: function() {
        this._hudLayer.pauseClock();
        var elapseTime = this._hudLayer._clock.getElapseTime();
        RequestsManager.getInstance().postGameProgress(Utils.getUserId(), GAME_ID, this._star, elapseTime);
        if (elapseTime == 120) {
            SegmentHelper.track(SEGMENT.LEVEL_INCOMPLETE, 
                        { 
                            forest: "forest", 
                            time_taken: elapseTime 
                        });
        };
        cc.log("completedScene");
        var starEarned = this._hudLayer.getStarEarned();
        // var str = (starEarned > 1) ? " stars" : " star";
        var self  = this;
        
        this.createYouWin();

        // this.runAction(cc.sequence(
        //     cc.delayTime(4),
        //     cc.callFunc(function() {
        //         if (self.isGamePlayedMatchAmountOfPlay()) {
        //             self.showTryAnOtherGameDialog();
        //             self._isWinLabel =false;
        //         }
        //     })
        // ));

    },


    runTutorial: function() {
        if(Global.NumberGamePlayed < 2) {
            this._tutorial = new TutorialLayer(this._objects, this._shadeObjects);
            this.addChild(this._tutorial, 10000)
        }
    }, 

    runObjectAction: function(object, delayTime, func) {
        object.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(func)
        ));
    },

    createStarsLabel: function() {
        var starLabel = new cc.LabelTTF("0 star", "Arial", 32);
        starLabel.x = cc.winSize.width/2 - 30;
        starLabel.y = cc.winSize.height - 50;
        starLabel.setColor(cc.color.RED);
        this.addChild(starLabel, 99);

        this._starLabel = starLabel;
    },

    addShuffledAnimalPosArray: function() {
        var birdPositionArray = shuffle(FOREST_BIRD_POSITION);
        var groundPositionArray = shuffle(FOREST_GROUND_POSITION);
        var waterPositionArray = shuffle(FOREST_WATER_POSITION);
        var monkeyPositionArray = shuffle(FOREST_MONKEY_POSITION);
        var owlPositionArray = shuffle(FOREST_OWL_POSITION);
        var frogPositionArray = shuffle(FOREST_FROG_POSITION);
        var nestPositionArray = shuffle(FOREST_NEST_POSITION);
        var snailPositionArray = shuffle(FOREST_SNAIL_POSITION);
        var octopusPositionArray = shuffle(FOREST_OCTOPUS_POSITION);
        var dolphinPositionArray = shuffle(FOREST_DOLPHIN_POSITION);
        var crocodilePositionArray = shuffle(FOREST_CROCODILE_POSITION);
        var flyPositionArray = shuffle(FOREST_FLY_POSITION);
        var eaglePositionArray = shuffle(FOREST_EAGLE_POSITION);
        var sharkPositionArray = shuffle(FOREST_SHARK_POSITION);

        return {birdPositionArray: birdPositionArray, 
            groundPositionArray: groundPositionArray, 
            frogPositionArray: frogPositionArray,
            monkeyPositionArray: monkeyPositionArray,
            nestPositionArray: nestPositionArray,
            owlPositionArray: owlPositionArray,
            waterPositionArray: waterPositionArray,
            snailPositionArray: snailPositionArray,
            octopusPositionArray: octopusPositionArray,
            dolphinPositionArray: dolphinPositionArray,
            crocodilePositionArray: crocodilePositionArray,
            flyPositionArray: flyPositionArray,
            eaglePositionArray: eaglePositionArray,
            sharkPositionArray: sharkPositionArray
        };
    },

    getAnimalPositionType: function(type , shuffledArrays) {
        var animalPositionArray = null;
        if (type === FOREST_ITEM_TYPE.BIRD_ITEM)
            animalPositionArray = shuffledArrays.birdPositionArray
        if (type === FOREST_ITEM_TYPE.LIE_ITEM || type === FOREST_ITEM_TYPE.STAND_ITEM)
            animalPositionArray = shuffledArrays.groundPositionArray
        if (type === FOREST_ITEM_TYPE.WATER_ITEM)
            animalPositionArray = shuffledArrays.waterPositionArray
        if (type === FOREST_ITEM_TYPE.MONKEY_ITEM)
            animalPositionArray = shuffledArrays.monkeyPositionArray
        if (type === FOREST_ITEM_TYPE.OWL_ITEM)
            animalPositionArray = shuffledArrays.owlPositionArray
        if (type === FOREST_ITEM_TYPE.FROG_ITEM)
            animalPositionArray = shuffledArrays.frogPositionArray
        if (type === FOREST_ITEM_TYPE.NEST_ITEM)
            animalPositionArray = shuffledArrays.nestPositionArray
        if (type === FOREST_ITEM_TYPE.SNAIL_ITEM)
            animalPositionArray = shuffledArrays.snailPositionArray
        if (type === FOREST_ITEM_TYPE.CROCODILE_ITEM)
            animalPositionArray = shuffledArrays.crocodilePositionArray
        if (type === FOREST_ITEM_TYPE.DOLPHIN_ITEM)
            animalPositionArray = shuffledArrays.dolphinPositionArray
        if (type === FOREST_ITEM_TYPE.OCTOPUS_ITEM)
            animalPositionArray = shuffledArrays.octopusPositionArray
        if (type === FOREST_ITEM_TYPE.FLY_ITEM)
            animalPositionArray = shuffledArrays.flyPositionArray
        if (type === FOREST_ITEM_TYPE.EAGLE_ITEM)
            animalPositionArray = shuffledArrays.eaglePositionArray
        if (type === FOREST_ITEM_TYPE.SHARK_ITEM)
            animalPositionArray = shuffledArrays.sharkPositionArray


        return animalPositionArray
    },

    getAnimalName: function(object) {
        for (var i = 0; i < this._animalNames.length; i++) {
            if (object.tag === this._animalNames[i].tag)
                return this._animalNames[i].name;
        }
    },

    runHintObjectUp: function() {
        this.schedule(this.showHintObjectUp, CLOCK_INTERVAL, this._hudLayer.getRemainingTime());
    },

    animateAnimalIn: function(animal, type, delay) {
        animal.scale = 0;
        var self = this;
        animal.runAction(
            cc.sequence(
                cc.delayTime(delay * ANIMATE_DELAY_TIME),
                cc.callFunc(function() {
                    jsb.AudioEngine.play2d( "sounds/smoke.mp3"),
                    AnimatedEffect.create(animal, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
                }),
                cc.scaleTo(0.7, 1).easing(cc.easeElasticOut(0.9)),
                cc.callFunc(function() {
                    self.runAnimalAction(animal, type);
                })
            )
        );
    },

    showHintObjectUp: function() {
        var self = this;
        var deltaTime = this._lastClickTime - this._hudLayer.getRemainingTime();
        if(deltaTime == TIME_HINT) {
            if (this._objects.length > 0) {
                var i = Math.floor(Math.random() * (this._objects.length - 1));
                this._objects[i].runAction(
                                        cc.sequence(
                                            cc.scaleTo(0.3, 0.7 * this._allScale),
                                            cc.scaleTo(0.2, 1.05 * this._allScale),
                                            cc.scaleTo(0.3, 0.7 * this._allScale),
                                            cc.scaleTo(0.2, 1.05 * this._allScale),
                                            cc.scaleTo(0.2, 1 * this._allScale),
                                            cc.callFunc(function() {
                                                self._lastClickTime = self._hudLayer.getRemainingTime();
                                            })
                                        )
                );
            }
        }
    },

    runSparklesEffect: function() {
        for ( var i = 0; i < this._objects.length; i++) {
            cc.log("runSparklesEffect");
            var effect = AnimatedEffect.create(this._objects[i], "sparkles", SPARKLE_EFFECT_DELAY, SPARKLE_EFFECT_FRAMES, true);
            this._effectLayers.push(effect)
        }
    },

    removeAnimalEffect: function() {
        // for (var i = 0; i < this._objects.length; i++) {
        //     cc.log("this._objects[i]: " + i + " " + this._objects[i]);
        //     this._objects[i].removeAllChildren();
        // }
        for (var i = 0; i < this._effectLayers.length; i++) {
            var ef = this._effectLayers[i];
            ef.removeFromParent();
        }
        this._effectLayers = [];
    },

    processGameLogic: function() {
        this._removeWarnLabel();
        this._touchCounting += 1;
        this.updateProgressBar();
        // this._objectTouching.stopAllActions();
        // this._objectTouching.removeAllChildren();
        this.removeAnimalEffect();
        this._lastClickTime = this._hudLayer.getRemainingTime();
        this.playAnimalSound();
        this._objectDisableds.push(this._objectTouching);
        this._objectTouching = null;
    },

    playAnimalSound: function(){
        var self = this;
        var animalName = this.getAnimalName(this._objectTouching);
        cc.log("playAnimalSound animalName: " + animalName);
        var animal = this._objectTouching;
        var str = animalName;
        var soundConfig = this.getAnimalSoundConfigByName(animalName) || {};
        if (soundConfig)
            soundConfig.length = 3;
        // Show cutscene
        var oldZOrder = animal.getLocalZOrder();
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 200));
        this.addChild(mask, 100);
        // animal.setLocalZOrder(101);

        this._maskLayer = mask;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; },
            onTouchEnded: function(touch, event) {
                if (GAME_CONFIG.needTouchToHideCutScene) {
                    if (blockFlag)
                        return;
                    // cc.log("playAnimalSound onTouchEnded");
                    self._blockAllObjects = false;
                    self._removeWarnLabel();
                    mask.removeFromParent();
                    // animal.stopAllActions();
                    animal.setLocalZOrder(oldZOrder);
                    // cc.log("onTouchEnded prepare checkWonGame");
                    self.checkWonGame();
                }
            }
        }, mask);

        if (isNaN(animalName)) // TODO
            jsb.AudioEngine.play2d("sounds/animals/" + animalName + ".mp3");
        cc.log("done check animalName is number or not");
        animal.runAction(cc.sequence(
            cc.callFunc(function() {
                // self.createWarnLabel(str);
                cc.log("playAnimalSound prepare createCompletedObject");
                self.createCompletedObject(animalName);
                self._blockAllObjects = true;
                cc.log("playAnimalSound done createCompletedObject");
                // self.animateAnimalIn(animal, animal.userData.type, 0);
            }),
            // cc.scaleTo(1, 0.95),
            // cc.scaleTo(1, 1.05),
            cc.delayTime(soundConfig.length + 0.5),
            cc.callFunc(function() {
                if (GAME_CONFIG.needTouchToHideCutScene) {
                    blockFlag = false;
                } else {
                    self._blockAllObjects = false;
                    // self._removeWarnLabel();
                    // self._completedObj.removeFromParent();
                    // self._completedObj = null;

                    mask.removeFromParent();
                    // animal.stopAllActions();
                    animal.setLocalZOrder(oldZOrder);
                    cc.log("playAnimalSound prepare checkWonGame");
                    self.checkWonGame();
                }
            })
        ));
    },

    _removeWarnLabel: function() {
        if (this._warningLabel)
            this._warningLabel.removeFromParent();
        this._warningLabel = null;
    },

    updateProgressBar: function() {
        var totalItems = this._data.length ? this._data.length : Global.NumberItems;
        var percent = this._touchCounting / totalItems;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._touchCounting, totalItems);

        var starEarned = 0;
        var objectCorrected = this._touchCounting;
        var starGoals = this.countingStars();
        if (objectCorrected >= starGoals.starGoal1 && objectCorrected < starGoals.starGoal2)
            starEarned = 1;
        if (objectCorrected >= starGoals.starGoal2 && objectCorrected < starGoals.starGoal3)
            starEarned = 2;
        if (objectCorrected >= starGoals.starGoal3)
            starEarned = 3;

        if (starEarned > 0)
        this._hudLayer.setStarEarned(starEarned);

            this._hudLayer.addStar("light", starEarned);
    },

    countingStars: function() {
        var totalItems = this._data.length ? this._data.length : Global.NumberItems;    
        var starGoal1 = Math.ceil(totalItems/3);
        var starGoal2 = Math.ceil(totalItems/3 * 2);
        var starGoal3 = totalItems;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },

    runSoundCountDown: function() {
        this.schedule(this.addSoundCountDown, CLOCK_INTERVAL, this._hudLayer.getRemainingTime())
    },

    addSoundCountDown: function() {
        if (this._hudLayer.getRemainingTime() == COUNT_DOWN_TIME){
            jsb.AudioEngine.play2d( "res/sounds/Countdown.mp3")
        }
    },

    showAllAnimals: function() {
        var animals = this._dsInstance.getObjects(FOREST_ID, Global.NumberItems);
        var shuffledArrays = this.addShuffledAnimalPosArray();
        var animalPositions = shuffledArrays.birdPositionArray.concat(shuffledArrays.groundPositionArray).concat(shuffledArrays.waterPositionArray);

        for ( var i = 0; i < animalPositions.length; i++) {
            this.createAnimal(animalPositions[i], animals[0], i);
        }
    },

    // getAmountGamePlayeds: function() {
    //     return this._kvInstance.getInt("amountGamePlayed", 0);
    // },

    // getNumberOfObjects: function() {
    //     return this._kvInstance.getInt("numberItems", GAME_CONFIG.objectStartCount);
    // },

    // setNumberOfObjects: function(numberItems) {
    //     this._kvInstance.set("numberItems", numberItems);
    // },

    // setAmountGamePlayeds: function(numberGamePlayed) {
    //     this._kvInstance.set("amountGamePlayed", numberGamePlayed);
    // },

    increaseAmountGamePlayeds: function() {
        // var numberGamePlayed = this.getAmountGamePlayeds();
        // numberGamePlayed += 1;
        // this.setAmountGamePlayeds(numberGamePlayed);
        Global.NumberGamePlayed += 1;
        Global.NumberForestPlayed++;
    },

    increaseObjectAmountBaseOnPlay: function() {
        // var numberGamePlayed = this.getAmountGamePlayeds();
        var baseObjectAmounts = GAME_CONFIG.amountOfObjectBaseOnPlay.base;
        var increaseObjectAmounts = GAME_CONFIG.amountOfObjectBaseOnPlay.increase;
        var maxObjectAmounts = GAME_CONFIG.amountOfObjectBaseOnPlay.max || UPDATED_CONFIG.amountOfObjectBaseOnPlay.max;

        // cc.log("(numberGamePlayed % baseObjectAmounts) " + (numberGamePlayed % baseObjectAmounts));
        if ((Global.NumberGamePlayed % baseObjectAmounts) == 0 && (Global.NumberItems < maxObjectAmounts))
            Global.NumberItems += increaseObjectAmounts;

        cc.log("numberItems: %d", Global.NumberItems);
        cc.log("numberGamePlayed: %d", Global.NumberGamePlayed);
        // cc.log("baseObjectAmounts: %d", baseObjectAmounts);
        // cc.log("increaseObjectAmounts: %d", increaseObjectAmounts);
        // this.setNumberOfObjects(this._numberItems);
    },

    showTryAnOtherGameDialog: function() {
        var text = "AWESOME, LET'S TRY ANOTHER GAME";
        this.stopAllActions();
        this.addChild(new SettingDialog(text), 999);
    },

    isGamePlayedMatchAmountOfPlay: function() {
        if (GAME_CONFIG.amountOfPlay == Math.floor(Global.NumberGamePlayed / 2))
            return true;
    },

    _addSpeakingTest: function() {
        for (var i = 0; i < this._objectDisableds.length; i++) {
            this._objectDisableds[i].removeFromParent();
        }
        
        this._hudLayer.removeFromParent();

        var self = this;
        cc.audioEngine.stopMusic();
        // var speakingTestScene = new SpeakingTestScene(this._animalNames, "RoomScene", "ForestScene");
        this._moveToNextScene();
    },

    _moveToNextScene: function() {
        if (this._isTestScene) {
            cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255)));
            return
        }

        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        SceneFlowController.getInstance().moveToNextScene(nextSceneName, JSON.stringify(this._data));
    },

    _fetchObjectData: function(data) {
        cc.log("_fetchObjectData");
        if (data) {
            // data = JSON.parse(data);
            this._data = data.map(function(id) {
                cc.log("id -> " + id);
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0];
                else
                    return id;
            });
        } else
            this._data = [];
        cc.log("_fetchObjectData - this._data: " + JSON.stringify(this._data));
    },

    _getRandomAnimalType: function(length) {
        var typeList = ["LIE_ITEM", "STAND_ITEM", "FLY_ITEM"];
        var arr = [];
        for (var i = 0; i < length; i++) {
            var rdmIndex = Math.floor(Math.random() * typeList.length);
            arr.push(typeList[rdmIndex]);
        }

        return arr;
    },

    _createCustomFont: function(lbText) {
        cc.log("lbText -> " + lbText);
        var fontSize = 30;
        var object = cc.Label.createWithTTF(Utils.getTTFConfig(res.HELVETICARDBLK_ttf.srcs[0], fontSize), 
                lbText);
        object.scale = 4;
        object.color = cc.color("#ffcc00");
        object.enableStroke(cc.color("#b15a10"), fontSize*0.12);
        object.enableShadow(cc.color(0.0, 0.0, 0.0, 64.0), cc.size(fontSize*0.11, -fontSize*0.11), 0);

        return object;
    }
});
var ForestScene = cc.Scene.extend({
    ctor: function(data, isTestScene) {
        this._super();
        this.name = "forest";
        var forestLayer = new ForestLayer(data, isTestScene);
        this.addChild(forestLayer);
    }
});
