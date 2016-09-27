var RENDER_TEXTURE_WIDTH = 320;
var RENDER_TEXTURE_HEIGHT = 320;

var CHAR_SPACE = 10;
var MAX_AVAILABLE_WIDTH = 850;
var GOFIGURE_BRUSH_COLOR = ["red", "blue", "green", "yellow"];
var GOFIGURE_SPECIAL_CASE = 1;

var GoFigureTestLayer = TestLayer.extend({
    _writingWords: null,

    _characterNodes: [],
    _finger: null,
    _wordScale: 1,

    _currentCharConfig: null,
    _baseRender: null,
    _tmpRender: null,
    _emptyFillCharacter: null,
    _dashedLine: null,

    _nameIdx: -1,
    _charIdx: -1,
    _pathIdx: -1,

    _writeFailCount: 0,

    _blockTouch: false,

    _nextSceneName: null,
    _oldSceneName: null,
    _data: null,

    _currentChar: "",

    _board: null,
    _currentBrushColor: cc.color.GREEN,
    _brushColorButtons: [],

    _option: null,

    ctor: function(data, option) {
        this._super();

        this._data = data;
        this._option = option;
        cc.log("option:" + JSON.stringify(option));
        this._brushColorButtons = [];

        if (data[0].hasOwnProperty("data")) {
            data = data[0].data;
        }
        this._names = data.map(function(obj) {
            // cc.log("input obj " + JSON.stringify(obj));
            if (Array.isArray(obj)) {
                var tempArr = [];
                for (var i = 0; i < obj.length; i++) {
                    var o = GameObject.getInstance().findById(obj[i]);
                    tempArr.push(o[0].value);
                }
                return tempArr;
            } else {
                var o = GameObject.getInstance().findById(obj);
                return o[0].value;
            }
                
        });
        // cc.log("names after map: " + JSON.stringify(this._names));
        // this._oldSceneName = oldSceneName;
        this._nameIdx = this._charIdx = this._pathIdx = 0;

        this._writingWords = this._names;
        
        this._addAdiDog();
        this._addBoard();
        this._displayWord();
        this._addRenderTextures();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this._playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    _playBeginSound: function() {
        var self = this;

        var didInstructionSoundPlay = KVDatabase.getInstance().getInt("beginSound_WritingTestScene", 0);
        if (didInstructionSoundPlay == 0) {
            var nation = Utils.getLanguage();
            // cc.log("nation: %s", nation);

            this._blockTouch = true;
            this._adiDog.adiTalk();

            var audioId = jsb.AudioEngine.play2d("res/sounds/writingTest_" + nation + ".mp3", false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                self._blockTouch = false;
                if (!self._adiDog)
                    return;

                self._adiDog.adiIdling();
                self._moveToNextShape();
            });
            KVDatabase.getInstance().set("beginSound_WritingTestScene", 1);
        }else {
            this._blockTouch = false;
            if (!this._adiDog)
                return;

            this._adiDog.adiIdling();
            this._moveToNextShape();
        }

        // var nation = Utils.getLanguage();

        // this._blockTouch = true;
        // this._adiDog.adiTalk();

        // var audioId = jsb.AudioEngine.play2d("res/sounds/writingTest_" + nation + ".mp3", false);
        // jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
        //     self._blockTouch = false;
        //     if (!self._adiDog)
        //         return;

        //     self._adiDog.adiIdling();
        //     self._moveToNextShape();
        // });
    },

    onTouchBegan: function(touch, event) {
        if (this._blockTouch)
            return false;

        this._finger.stopAllActions();
        this._finger.opacity = 0;
        return true;
    },

    onTouchMoved: function(touch, event) {
        var touchedPos = touch.getLocation();
        var prevPos = touch.getPreviousLocation();

        var renderPos = this.convertToRTSpace(touchedPos);
        var prevRenderPos = this.convertToRTSpace(prevPos);

        var distance = cc.pDistance(renderPos, prevRenderPos);
        var dif = cc.pSub(renderPos, prevRenderPos);

        this._tmpRender.begin();
        for (var i = 0; i < distance; i++) {
            var delta = i / distance;
            var newPos = cc.p(renderPos.x + (dif.x * delta), renderPos.y + (dif.y * delta));
            var brush = new cc.Sprite("brush_large.png");  
            brush.scale = this._wordScale * 0.9;          
            brush.setPosition(newPos);
            brush.visit();
        }
        this._tmpRender.end();
        this._tmpRender.getSprite().color = this._currentBrushColor;
    },

    onTouchEnded: function(touch, event) {
        var self = this;

        var image = this._tmpRender.newImage(); 

        this._blockTouch = true;
        if (this.imageMatched(image)) {
            this._pathIdx++;
            // cc.log("onTouchEnded this._pathIdx: " + this._pathIdx);
            this._tmpRender.getSprite().runAction(cc.sequence(
                cc.spawn(
                    cc.tintTo(0.2, cc.color.WHITE),
                    cc.fadeOut(0.2)
                ),
                cc.spawn(
                    cc.fadeIn(0.2),
                    cc.tintTo(0.2, this._currentBrushColor)
                ),
                cc.callFunc(function() {
                    self._blockTouch = false;

                    var sprite = new cc.Sprite(self._tmpRender.getSprite().getTexture());
                    sprite.flippedY = true;
                    sprite.setPosition(self._tmpRender.getPosition());

                    self._tmpRender.getSprite().color = cc.color.WHITE;
                    self._baseRender.begin();
                    sprite.visit();
                    self._baseRender.end();

                    self._tmpRender.clear(0,0,0,0);
                    self._tmpRender.getSprite().color = cc.color("#333333");
                    if (self.checkChangingCharacter()) {
                        var correctedCharacter = self._currentChar;
                        self._nameIdx++;
                        self._changeWord();
                        self._touchCounting++;
                        self.updateProgressBar();
                        self._correctAction(correctedCharacter);
                    } else {
                        self._displayFinger();
                    }
                })
            ));
        } else {
            this._writeFailCount++;
            this._displayFinger();
            var failTimes = GAME_CONFIG.writingTestFailTimesToNextCharacter || UPDATED_CONFIG.writingTestFailTimesToNextCharacter;
            
            this._tmpRender.getSprite().runAction(cc.sequence(
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.callFunc(function() {
                    self._blockTouch = false;
                    self._tmpRender.clear(0,0,0,0);

                    if (self._writeFailCount >= failTimes) {
                        self._segmentTracking("false");
                        self._finishAndMoveToNextChar();
                    }
                })
            ));
            this._incorrectAction();
        }
    },  

    imageMatched: function(image) {
        var self = this;

        var includedCoverPercentage = GAME_CONFIG.writingTestIncludedCoverPercentage || UPDATED_CONFIG.writingTestIncludedCoverPercentage;
        var excludedCoverPercentage = GAME_CONFIG.writingTestExcludedCoverPercentage || UPDATED_CONFIG.writingTestExcludedCoverPercentage;

        for (var i = 0; i < this._currentCharConfig.paths.length; i++) {
            var pathCfg = this._currentCharConfig.paths[i];

            var matchedCount = 0;
            pathCfg.forEach(function(point) {
                var p = self.convertScaledPath(point);
                if (!self.isSpriteTransparentInPoint(image, p))
                    matchedCount++;
            });

            var coverPercentage = matchedCount / pathCfg.length * 100;

            if (((i == this._pathIdx) && (coverPercentage < includedCoverPercentage)) ||    // Included Point
                ((i != this._pathIdx) && (coverPercentage > excludedCoverPercentage)))      // Excluded Point
                return false;
        }
        
        return true;
    },

    updateProgressBar: function() {
        var percent = this._touchCounting / this._data.length;
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
        cc.log("starEarned" + starEarned);

        this._hudLayer.setStarEarned(this._data.length);
        if (starEarned > 0)
            this._hudLayer.addStar("light", starEarned);
    },

    countingStars: function() {
        var starGoal1 = Math.ceil(this._data.length/3);
        var starGoal2 = Math.ceil(this._data.length/3 * 2);
        var starGoal3 = this._data.length;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },

    convertToRTSpace: function(p) {
        return cc.pSub(p, cc.pSub(this._tmpRender.getPosition(), cc.p(RENDER_TEXTURE_WIDTH*2/2, RENDER_TEXTURE_HEIGHT/2)));
    },

    convertToWSpace: function(p) {
        return cc.pAdd(p, cc.pSub(this._tmpRender.getPosition(), cc.p(RENDER_TEXTURE_WIDTH*2/2, RENDER_TEXTURE_HEIGHT/2)));
    },

    convertScaledPath: function(p) {
        return cc.pAdd(cc.pMult(p, this._wordScale), cc.p(RENDER_TEXTURE_WIDTH*2 * (1 - this._wordScale) / 2, RENDER_TEXTURE_HEIGHT * (1 - this._wordScale) / 2));
    },

    isSpriteTransparentInPoint: function(image, point) {
        return h102.Utils.isPixelTransparent(image, point.x, point.y);
    },

    fetchCharacterConfig: function() {
        // cc.log("fetchCharacterConfig");
        if (Array.isArray(this._writingWords[this._nameIdx])) {
            this._currentChar = this._writingWords[this._nameIdx][this._charIdx];
            // cc.log("special case");
        }
        else
            this._currentChar = this._writingWords[this._nameIdx];

        this._currentCharConfig = GoFigureTestLayer.CHAR_CONFIG[this._currentChar];

        // cc.log("this._currentChar: " + JSON.stringify(this._currentChar));
        // cc.log("this._currentCharConfig: " + JSON.stringify(this._currentCharConfig));
        // cc.log("this._writingWords[this._nameIdx]: " + JSON.stringify(this._writingWords[this._nameIdx]));
    },

    _finishAndMoveToNextChar: function() {
        var self = this;
        // ConfigStore.getInstance().setBringBackObj(
        //     this._oldSceneName == "RoomScene" ? BEDROOM_ID : FOREST_ID, 
        //     this._names[this._nameIdx], 
        //     (this._oldSceneName == "RoomScene" ? Global.NumberRoomPlayed : Global.NumberForestPlayed)-1);
        
        this._finger.stopAllActions();
        this._finger.opacity = 0;

        // cc.log("_finishAndMoveToNextChar this._nameIdx: " + this._nameIdx)
        this._characterNodes[0].runAction(cc.fadeTo(0.5, 64));
        this._nameIdx++;
        this._pathIdx = 0;
        this._writeFailCount = 0;

        // if (self.checkChangingWord())
        self._changeWord();
        // else
        //     self._moveToNextShape();
    },

    checkChangingCharacter: function() {
        if (this._pathIdx >= this._currentCharConfig.paths.length)
        {
            cc.log("checkChangingCharacter");
            this._segmentTracking("true");
            // next char
            this._charIdx++;
            this._pathIdx = 0;
            this._writeFailCount = 0;
            return true;
        }

        return false;
    },

    checkChangingWord: function() {
        cc.log("checkChangingWord this._charIdx: " + this._charIdx + " - " + this._writingWords[this._nameIdx].length);
        if (this._charIdx >= this._writingWords[this._nameIdx].length) {
            // cc.log("return true on checkChangingWord");
            this._charIdx = 0;
            this._nameIdx++;
            return true;
        }
        return false;
    },

    _changeWord: function() {
        var self = this;
        var sprite, objName;
        self._blockTouch = true;

        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function() {
                self._characterNodes.forEach(function(obj) {
                    obj.runAction(cc.fadeOut(0.5));
                });

                self._baseRender.getSprite().runAction(cc.fadeOut(0.5));
            }),
            cc.delayTime(0.25),
            cc.callFunc(function() {
                // sprite = self._addObjImage(self._names[self._nameIdx-1]);
                // sprite.runAction(cc.spawn(
                //     cc.fadeIn(0.5),
                //     cc.scaleTo(0.5, 1.5)
                // ));

                // objName = self._addObjName(self._names[self._nameIdx-1], self._writingWords[self._nameIdx-1].length);
                // objName.opacity = 0;
                // objName.runAction(cc.fadeIn(0.5));
            }),
            cc.delayTime(0.5),
            cc.callFunc(function() {
                self._playObjSound(self._names[self._nameIdx-1], function() {
                    self.runAction(cc.sequence(
                        cc.delayTime(1.2),
                        cc.callFunc(function() {
                            // sprite.runAction(cc.sequence(
                            //     cc.fadeOut(0.3),
                                // cc.callFunc(function() {
                                    if (self._nameIdx >= self._writingWords.length) {
                                        self._moveToNextScene();
                                        return;
                                    }

                                    // sprite.removeFromParent();
                                    // objName.removeFromParent();
                                    self._baseRender.getSprite().opacity = 128;

                                    self._displayWord();
                                    self._baseRender.clear(0,0,0,0);
                                    self._moveToNextShape();

                                    self._blockTouch = false;
                                // })
                            // ));
                        })
                    ));
                });
            })
        ));
    },

    _addObjImage: function(name) {
        var spritePath;
        if (TSOG_DEBUG)
            spritePath = "objects/" + "hat" + ".png";
        else if (this._oldSceneName == "RoomScene") {
            spritePath = "objects/" + name.toLowerCase() + ".png";
        } else {
            spritePath = "animals/" + name.toLowerCase() + ".png";
        }
        
        var s = new cc.Sprite(spritePath);
        s.x = cc.winSize.width * 0.65;
        s.y = cc.winSize.height * 0.5;
        s.opacity = 0;
        this.addChild(s, 2);

        return s;
    },

    _addObjName: function(name, writingLength) {
        if (TSOG_DEBUG)
            name = "hat";
        var nameNode = new cc.LabelBMFont(name, "hud-font.fnt");
        nameNode.x = cc.winSize.width * 0.65
        nameNode.y = cc.winSize.height - 120;
        nameNode.scale = 1.5;
        this.addChild(nameNode);

        for (var i = writingLength; i < name.length; i++) {
            nameNode.getLetter(i).opacity = 128;
        }

        return nameNode;
    },

    _playObjSound: function(name, cb) {
        var soundPath = "";
        name = name || "";
        cc.log("name: " + name);
        // if (this._oldSceneName == "RoomScene") {
        //     soundPath = "sounds/objects/" + name.toLowerCase() + ".mp3";
        // } else {
        //     soundPath = "sounds/animals/" + name.toLowerCase() + ".mp3";
        // }

        if (jsb.fileUtils.isFileExist(soundPath)) {
            var audioId = jsb.AudioEngine.play2d(soundPath, false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                cb && cb();
            });
        } else {
            cb && cb();
        }

        
    },

    _displayWord: function() {
        // cc.log("_displayWord");
        // cc.log("this._currentCharConfig: " + JSON.stringify(this._currentCharConfig));
        if (this._characterNodes.length > 0) {
            this._characterNodes.forEach(function(obj) {obj.removeFromParent();});
        }
        this._characterNodes = [];

        var objName = this._writingWords[this._nameIdx];
        // cc.log("objName: " + objName);
        // cc.log("objName: " + JSON.stringify(objName));
        // cc.log("_nameIdx: " + this._nameIdx);
        this._wordScale = 1;
        var optionIdx = (this._option) ? this._option.index : 1;
        var charArrays = [];
        var totalWidth = 0;
        var totalWords = (Array.isArray(objName)) ? objName.length : 1;
        // cc.log("totalWords: " + totalWords);
        var s = new cc.Sprite("#" + objName + ".png");
        this.addChild(s);

        this._characterNodes.push(s);
        totalWidth += s.width;
        if (totalWidth > cc.winSize.width * 0.7)
            this._wordScale = Math.min(this._wordScale, cc.winSize.width * 0.7/totalWidth);

        s.scale = this._wordScale;
        s.x = cc.winSize.width * 0.65 - totalWidth/2 * this._wordScale + s.width/2 * this._wordScale - 10;
        s.y = cc.winSize.height/2 * Utils.getScaleFactorTo16And9();


        // for (var j = 1; j < charArrays[i].length; j++) {
        //     charArrays[i][j].scale = this._wordScale;
        //     charArrays[i][j].x = charArrays[i][j-1].x + (charArrays[i][j-1].width/2 + CHAR_SPACE + charArrays[i][j].width/2) * this._wordScale;
        //     charArrays[i][j].y = cc.winSize.height/2 - (i - lines/2 + 0.5) * 300 * this._wordScale;
    },

    _moveToNextShape: function() {
        cc.log("_moveToNextShape");
        this._tmpRender.setPosition(this._characterNodes[0].getPosition()); // 0 because there is only 1 shape appear at a time

        this.fetchCharacterConfig();
        this._displayNewDashedLine();
        this._displayFinger();
    },

    _displayNewDashedLine: function() {
        return;
        if (this._dashedLine) {
            this._dashedLine.removeFromParent();
            this._dashedLine = null;
        }

        var dashCfg = this._currentCharConfig.dashedLines[this._pathIdx];
        if (!dashCfg)
            return;

        this._dashedLine = new cc.Sprite("#" + dashCfg.sprite);
        this._dashedLine.x = dashCfg.x + this._emptyFillCharacter.x - this._emptyFillCharacter.width/2;
        this._dashedLine.y = dashCfg.y + this._emptyFillCharacter.y - this._emptyFillCharacter.height/2;
        this._dashedLine.scaleX = dashCfg.w / this._dashedLine.width;
        this._dashedLine.scaleY = dashCfg.h / this._dashedLine.height;
        this._dashedLine.rotation = dashCfg.rotation;
        this._dashedLine.anchorX = this._dashedLine.anchorY = 0;
        this.addChild(this._dashedLine, 1);
    },

    _addAdiDog: function() {
        this._adiDog = new AdiDogNode();
        this._adiDog.scale = Utils.screenRatioTo43() * 0.5;
        this._adiDog.setPosition(cc.p(cc.winSize.width * 0.15, cc.winSize.height/2 - 150 * this._adiDog.scale));
        this.addChild(this._adiDog);
    },

    _addRenderTextures: function() {
        this._baseRender = new cc.RenderTexture(cc.winSize.width, cc.winSize.height);
        // this._baseRender.retain();
        this._baseRender.x = cc.winSize.width/2;
        this._baseRender.y = cc.winSize.height/2;
        this._baseRender.getSprite().color = cc.color.GREEN;
        this._baseRender.getSprite().opacity = 128;
        this._baseRender.getSprite().setOpacityModifyRGB(false);
        this.addChild(this._baseRender, 2);

        this._tmpRender = new cc.RenderTexture(RENDER_TEXTURE_WIDTH*2, RENDER_TEXTURE_HEIGHT);
        // this._tmpRender.setPosition(this._baseRender.getPosition());
        this._tmpRender.getSprite().opacity = 128;
        this._tmpRender.getSprite().color = cc.color("#333333");
        this._tmpRender.getSprite().setOpacityModifyRGB(false);
        this.addChild(this._tmpRender, 3);        
    },

    _displayFinger: function() {
        if (!this._finger) {
            this._finger = new cc.Sprite("#finger-1.png");
            this._finger.anchorX = 0.26;
            this._finger.anchorY = 0.77; 
            this.addChild(this._finger, 5);
        }

        this._finger.stopAllActions();
        this._finger.opacity = 0;
        // cc.log("_displayFinger pathIdx: " + this._pathIdx);
        cc.log("this._pathIdx: " + this._pathIdx);
        cc.log("this._currentCharConfig.paths: " + JSON.stringify(this._currentCharConfig.paths));
        var pathCfg = this._currentCharConfig.paths[this._pathIdx];
        var actions = [];

        actions.push(cc.moveTo(0, this.convertToWSpace(this.convertScaledPath(pathCfg[0]))));
        actions.push(cc.fadeIn(0.15));

        // var optionIdx = this._option.index;
        // for (var k = 0; k < optionIdx.length; k++) {
        //     var opt = optionIdx[k];
        //     if (opt == this._nameIdx) {
        //         for (var i = 1; i < pathCfg.length; i++) {
        //             pathCfg[i] = cc.pRotateByAngle(pathCfg[i], pathCfg[0], 0.5*Math.PI);
        //         }
        //     }
        // }

        for (var i = 1; i < pathCfg.length; i++) {
            var distToPrevPoint = cc.pDistance(this.convertScaledPath(pathCfg[i]), this.convertScaledPath(pathCfg[i-1]));
            actions.push(cc.moveTo(distToPrevPoint * 0.005, this.convertToWSpace(this.convertScaledPath(pathCfg[i]))));
        }
        actions.push(cc.fadeOut(0.15));
        actions.push(cc.delayTime(0.3));

        this._finger.runAction(cc.repeatForever(cc.sequence(actions)));
    },

    _correctAction: function(correctedCharacter) {
        var self = this;
        jsb.AudioEngine.play2d(res.Succeed_sfx);
        cc.log("correct: " + correctedCharacter);

        jsb.AudioEngine.play2d("res/sounds/alphabets/" + correctedCharacter + ".mp3");
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

    _segmentTracking: function(correct) {
        var objName = this._writingWords[this._nameIdx];
        // cc.log("writingTest charname correct: " + charName + " " + correct);
        // SegmentHelper.track(SEGMENT.GOFIGURE_TEST,
        //     {
        //         object_name: objName,
        //         correct: correct
        //     });  //TODO
    },

    _addBoard: function() {
        // where to set color -> this._baseRender.getSprite().color
        this._board = new cc.Sprite(res.Board_png);
        this._board.scale = Utils.getScaleFactorTo16And9();
        this._board.anchorX = 1;
        this._board.anchorY = 0;
        this._board.x = cc.winSize.width - 50 * Utils.getScaleFactorTo16And9();
        this._board.y = 0;
        // cc.log("Utils.getScaleFactorTo16And9() " + Utils.getScaleFactorTo16And9());
        this.addChild(this._board);
        for (var i = 0; i < GOFIGURE_BRUSH_COLOR.length; i++) {
            var btnImgNameNormal = "btn_" + GOFIGURE_BRUSH_COLOR[i] +".png";
            var btnImgNamePressed = "btn_" + GOFIGURE_BRUSH_COLOR[i] +"-pressed.png";
            var b = new ccui.Button(btnImgNameNormal, btnImgNamePressed, "", ccui.Widget.PLIST_TEXTURE);
            b.x = b.width + i*(b.width*1.5 + 10 * Utils.getScaleFactorTo16And9());
            b.y = 104 * Utils.getScaleFactorTo16And9();
            b.tag = i;
            b.opacity = (i == 2) ? 255 : 180;
            b.addClickEventListener(this._changeBrushColorPressed.bind(this));
            this._board.addChild(b);
            this._brushColorButtons.push(b);
        }
    },

    _changeBrushColorPressed: function(button) {
        var color;
        switch(button.tag){
            case 0:
                color = cc.color.RED;
                break;
            case 1:
                color = cc.color("#00aaff"); // Blue
                break;
            case 2:
                color = cc.color.GREEN;
                break;
            case 3:
                color = cc.color.YELLOW;
                break;
            default:
                color = cc.color.GREEN;
                break;
        }

        for (var i = 0; i < this._brushColorButtons.length; i++) {
            var b = this._brushColorButtons[i];
            if (b.tag == button.tag)
                b.opacity = 255;
            else
                b.opacity = 180;
        }

        this._currentBrushColor = color;
        this._baseRender.getSprite().color = color;
    }
});

GoFigureTestLayer.CHAR_CONFIG = null;

var GoFigureTestScene = cc.Scene.extend({
    ctor: function(data, oldSceneName, isTestScene){
        this._super();

        if (GoFigureTestLayer.CHAR_CONFIG == null) {
            GoFigureTestLayer.CHAR_CONFIG = {};

            var csf = cc.director.getContentScaleFactor();
            var tiledMap = new cc.TMXTiledMap();
            tiledMap.initWithTMXFile(res.Figure_TMX);

            var mapSize = tiledMap.getMapSize();
            var tileSize = tiledMap.getTileSize();

            tiledMap.getObjectGroups().forEach(function(group) {
                var config = {
                    paths: [],
                    dashedLines: [],
                    includedPoints: []
                };

                group.getObjects().forEach(function(obj) {
                    if (obj.name.startsWith("Path")) {
                        var pathIdx = parseInt(obj.name.substring(4));
                        config.paths[pathIdx-1] = [];

                        var offsetX = obj.x * csf;
                        var offsetY = mapSize.height * tileSize.height - obj.y * csf;

                        for (var i = 0; i < obj.polylinePoints.length; i++) {
                            var x = obj.polylinePoints[i].x * csf + offsetX;
                            var y = mapSize.height * tileSize.height - (obj.polylinePoints[i].y * csf + offsetY);
                            var p = cc.p(x, y);
                            config.paths[pathIdx-1].push(p);
                        }
                    }

                    if (obj.name.startsWith("Dash")) {
                        var dashIdx = parseInt(obj.name.substring(4));

                        var dashCfg = {};

                        dashCfg.x = obj.x * csf;
                        dashCfg.y = (obj.y + obj.height) * csf; 
                        dashCfg.w = obj.width;
                        dashCfg.h = obj.height;
                        dashCfg.sprite = obj.sprite;
                        dashCfg.rotation = obj.rotation || 0;

                        config.dashedLines[dashIdx-1] = dashCfg;
                    }
                });

                GoFigureTestLayer.CHAR_CONFIG[group.getGroupName()] = config;
            });
        }

        var layer = new GoFigureTestLayer(data, oldSceneName, isTestScene);
        this.addChild(layer);

    }
});