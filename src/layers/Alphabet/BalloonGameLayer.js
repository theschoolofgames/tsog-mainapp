var BALLOON_GAME_ADI_ZORDER = 5;

var BalloonGameLayer = TestLayer.extend({

    _balloonsLimit: 15,
    _balloons: [],
    redAnimFrames: [],
    greenAnimFrames: [],
    blueAnimFrames: [],
    grayAnimFrames: [],
    _objectsArray: [],
    _tempArray: [],

    _canTouch: false,
    _enableSpawn: false,
    _canVoildCompletedScene: true,
    _canRunActionPop: true,
    _objectIdArray: ["color_green", "number_1", "word_a"],

    _waitForSpawn: 1.0,
    _balloonScale: 1.0,
    _balloonLifeTime: 6,
    _goalTotal: 0,
    _correctChoose: 0,
    _allCorrectChoose: 0,
    
    _currentObject: null, 
    _adiDog: null,
    _hudLayer: null,
    hudTypeLabel: null,
    hudBalloonBg: null,
    _lbGoal: null,
    spriteSheet:null,
    redAnimation: null,
    greenAnimation: null,
    blueAnimation: null,
    grayAnimation: null,
    
    ctor: function(objectIdArray, timeForScene) {
        this._super(cc.color.WHITE);
        this.init(objectIdArray, timeForScene);
        // this.init(this._objectIdArray); // For testing

        this._removeHud = true;

        jsb.AudioEngine.play2d("res/sounds/sentences/" + currentLanguage + "/pop_the_right_balloon.mp3");
    },

    init: function(objectIdArray, timeForScene) {
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
        }, this);

        cc.spriteFrameCache.addSpriteFrames(res.Balloon_Animation_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.Balloon_Animation_png);
        this.addChild(this.spriteSheet);

        this._addAdi();

        // this._filterObjectsByType(objectIdArray);
        this._fetchObjectData(objectIdArray);
        this._tempArray = shuffle(this._objectsArray).slice(0);
        this._goalTotal = this._checkGoalTotal();
        // console.log("Goal Total " + this._goalTotal);

        this._currentObject = this._tempArray.pop();
        this._spawnBalloonPool();
        // this._addGoalList(this._currentObject.id, this._currentObject.amount);
        this._addHudLayer(timeForScene);
        this._updateCurrentIdHud(this._currentObject);
        this._updateGoalLabel(0);

        this._canTouch = true;

        this.schedule(this._spawnBalloons, this._waitForSpawn);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
    },

    _addHudLayer: function(timeForScene) {
        this._hudLayer = new SpecifyGoalHudLayer(this, timeForScene);
        this.addChild(this._hudLayer);
        this._hudLayer.setTotalGoals(this._goalTotal);
    },

    _addAdi: function() {
        this._adiDog = new AdiDogNode();
        this._adiDog.scale = Utils.screenRatioTo43() * 0.4;
        this._adiDog.setPosition(cc.p(100, 50));
        this.addChild(this._adiDog, BALLOON_GAME_ADI_ZORDER);
    },

    _checkGoalTotal: function() {
        let total = 0;
        for (var i = 0; i < this._objectsArray.length; i++){
            total += parseInt(this._objectsArray[i].amount);
        }
        return total;
    },

    // _updateGoalLabel: function(correct) {
    //     this._hudLayer.updateSpecifyGoalLabel("".concat(correct).concat("-").concat(this._currentObject.amount));
    // },

    updateProgressBar: function() {
        cc.log("ListeningTestLayer - updateProgressBar");
        var percent = this._allCorrectChoose / this._goalTotal;

        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._allCorrectChoose);

        this._super();
    },

    // only accept object with type: colors, numbers and alphabets
    _filterObjectsByType: function(objectIdArray) {
        this._parseGameObjectJSON();
        var tempArray = [];
        if (!this._gameObjectJson || this._gameObjectJson.length == 0)
            return;

        // objectIdArray = JSON.parse(objectIdArray);
        cc.log("objectIdArray: " + (objectIdArray));
        for (var i = 0; i < objectIdArray.length; i++){            
            let itemObject = this._gameObjectJson.find((gameObject) => {
                return gameObject.id === objectIdArray[i];
            });

            if (itemObject.type === "color" || itemObject.type === "number" || itemObject.type === "word")
                tempArray.push({"id": itemObject.id, "type": itemObject.type, "value": itemObject.value});
        }

        this._objectsArray = tempArray;
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
    },

    _updateCurrentIdHud: function(currentObj) {
        cc.log("currentObj: " + JSON.stringify(currentObj));
        let text = "";

        if (currentObj.type === "number" || currentObj.type === "word")
            text = currentObj.value;

        // if (!this.hudBalloonBg){
        //     this.hudBalloonBg = new cc.Sprite("#balloon_gray_1.png");
        //     this.hudBalloonBg.attr({x: 60, y: cc.winSize.height - 200});
        //     this.hudBalloonBg.setScale(0.6);
        //     // circle.setColor(cc.color.RED);   
        //     this.addChild(this.hudBalloonBg);
        // }

        var spriteFrame = "";
        if (currentObj.value.indexOf("red") !== -1){
            spriteFrame = cc.spriteFrameCache.getSpriteFrame("balloon_red_1.png");
        }
        else if (currentObj.value.indexOf("green") !== -1){
            spriteFrame = cc.spriteFrameCache.getSpriteFrame("balloon_green_1.png");
        }
        else if (currentObj.value.indexOf("blue") !== -1){
            spriteFrame = cc.spriteFrameCache.getSpriteFrame("balloon_blue_1.png");
        }
        else {
            spriteFrame = cc.spriteFrameCache.getSpriteFrame("balloon_gray_1.png");
        }
        // this.hudBalloonBg.setSpriteFrame(spriteFrame);
        this._hudLayer.addSpecifyGoal(spriteFrame, currentObj.value);
        this._hudLayer.setTotalSpecifyGoal(currentObj.amount);

        // if (!this.hudTypeLabel){
        //     this.hudTypeLabel = new cc.LabelBMFont(text + "", "hud-font.fnt");
        //     this.hudTypeLabel.setScale(2.0);
        //     this.hudTypeLabel.color = cc.color("#ffd902");
        //     this.hudTypeLabel.x = this.hudBalloonBg.width / 2 + 10;
        //     this.hudTypeLabel.y = this.hudBalloonBg.height/2 + 40;
        //     this.hudBalloonBg.addChild(this.hudTypeLabel);
        // }

        // this.hudTypeLabel.setString(text + "");
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

        return warnLabel;
    },

    completedScene: function() {
        this._canTouch = false;
        if(!this._canVoildCompletedScene)
            return;
        this._canVoildCompletedScene = !this._canVoildCompletedScene;
        cc.log("_canVoildCompletedScene: "  + this._canVoildCompletedScene);
        var starEarned = this._hudLayer.getStarEarned();

        var lbText = localizeForWriting("you win");
        var warningLabel = this.createWarnLabel(lbText, null, null, cc.winSize.height/2);
        warningLabel.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(warningLabel, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }), 
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5))
            // cc.delayTime(1)
        ));

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

    _backToHome: function() {
        cc.director.replaceScene(new cc.TransitionFade(1, new MainScene(), cc.color(255, 255, 255, 255)));
    },

    onTouchBegan: function(touch, event) {
        if (!this._canTouch)
            return false;

        var self = this;
        var touchedPos = touch.getLocation();
        this._canRunActionPop = true;
        this._balloons.forEach(function(obj) {
            var bounding = obj.getBoundingBox();
            if (cc.rectContainsPoint(cc.rect(bounding.x, bounding.y + bounding.height / 2, bounding.width, bounding.height / 2), touchedPos)) {
                if(!self._canRunActionPop)
                    return;
                if (obj.touched)
                    return;
                obj.touched = true;

                if (obj.name === self._currentObject.value){
                    self.popGold(obj.getPosition());

                    var name = obj.name.substr(6);
                    var localizedName = localize(name);
                    jsb.AudioEngine.stopAll();
                    jsb.AudioEngine.play2d(res.Succeed_sfx);
                    cc.log("localizedName: " + localizedName);  
                    jsb.AudioEngine.play2d("res/sounds/colors/" + localizedName + ".mp3");
                    

                    self._adiDog.adiHifi();

                    self._correctChoose++;
                    self._allCorrectChoose++;
                    self._updateGoalLabel(self._correctChoose);
                    self.updateProgressBar();
                    // cc.log("Correct - Goal Total : (%d - %d)", self._allCorrectChoose, self._goalTotal);
                    

                    if (self._correctChoose >= self._currentObject.amount){
                        self._checkCompleteScene();
                    }
                }
                else {
                    jsb.AudioEngine.play2d(res.Failed_sfx);
                    self._adiDog.adiShakeHead();
                }

                var labelBalloon = obj.getChildByTag(100);

                self.redAnimation = new cc.Animation(self.redAnimFrames, 0.05);
                self.greenAnimation = new cc.Animation(self.greenAnimFrames, 0.05);
                self.blueAnimation = new cc.Animation(self.blueAnimFrames, 0.05);
                self.grayAnimation = new cc.Animation(self.grayAnimFrames, 0.05);

                let currentAnimation = self.grayAnimation;

                if (obj.name == "color_blue"){
                    currentAnimation = self.blueAnimation;
                }
                else if (obj.name == "color_green"){
                    currentAnimation = self.greenAnimation;
                }
                else if (obj.name == "color_red"){
                    currentAnimation = self.redAnimation;
                }

                // Reset object for reusing
                obj.stopAllActions();
                let popAction = new cc.Animate(currentAnimation).repeat(1);
                obj.runAction(cc.sequence(popAction, cc.callFunc(() => {
                    obj.stopAllActions();
                    obj.x = -100;
                    obj.y = -100;
                    obj.setOpacity(255);
                    obj.touched = false;
                    obj.setVisible(false);
                }, self)));

                if (obj.type != "color"){
                    labelBalloon.runAction(cc.sequence(cc.fadeOut(0.3), cc.callFunc(() => {
                        labelBalloon.stopAllActions();
                    }, self)));
                };
                self._canRunActionPop = false;
            }
        });

        return true;
    },

    _checkCompleteScene: function() {
        if (this._tempArray.length <= 0)
            this.completedScene();
        else {
            this._currentObject = this._tempArray.pop();
            this._updateCurrentIdHud(this._currentObject);
            this._updateGoalLabel(0);
            this._correctChoose = 0;
        }
    },

    _getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    _spawnBalloons: function() {
        var winSize = cc.winSize;

        var balloon = this._getInActiveBalloon();
        if (!balloon)
            return;

        var newObjectArray = this._objectsArray.slice(0);
        newObjectArray.push(this._currentObject); // For increase frequency goal object
        newObjectArray.push(this._currentObject);
        newObjectArray.push(this._currentObject);
        var randomBalloon = newObjectArray[this._getRandomInt(0, newObjectArray.length)];
        balloon.name = randomBalloon.value;
        balloon.type = randomBalloon.type;
        balloon.setVisible(true);

        var labelBalloon = balloon.getChildByTag(100);
        labelBalloon.setOpacity(255);
        if (labelBalloon && randomBalloon.type !== "color"){
            labelBalloon.setString(randomBalloon.value);
            balloon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("balloon_gray_1.png"));
        }
        else {
            labelBalloon.setString("");

            if (randomBalloon.value.indexOf("red") !== -1){
                balloon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("balloon_red_1.png"));
            }
            else if (randomBalloon.value.indexOf("green") !== -1){
                balloon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("balloon_green_1.png"));
            }
            else if (randomBalloon.value.indexOf("blue") !== -1){
                balloon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("balloon_blue_1.png"));
            }
            else {
                balloon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("balloon_gray_1.png"));
            }
        }

        var ranX = this._getRandomInt(balloon.width, winSize.width - balloon.width);
        balloon.attr({x: ranX, y: - balloon.width});

        //create the move action
        this._balloonLifeTime = 6;
        this._balloonLifeTime = this._balloonLifeTime - 2 + 3 * Math.random();
        var actionTo = new cc.MoveTo(this._balloonLifeTime, cc.p(ranX - 300 + 300 * Math.random(), winSize.height + 100));
        balloon.runAction(new cc.Sequence(actionTo, cc.callFunc(() => {
            balloon.x = -100;
            balloon.y = -100;
            balloon.setVisible(false);
        }, this)));
    },

    _getInActiveBalloon: function() {
        for (var i = 0; i < this._balloons.length; i++){
            // console.log("Balloon name: " + this._balloons[i].name);
            if (!this._balloons[i].isVisible())
                return this._balloons[i];
        }
    },

    _spawnBalloonPool: function() {
        this.redAnimFrames = [];
        this.greenAnimFrames = [];
        this.blueAnimFrames = [];
        this.grayAnimFrames = [];
        for (var i = 1; i <= 8; i++) {
            var strRed = "balloon_red_" + i + ".png";
            var strGreen = "balloon_green_" + i + ".png";
            var strBlue = "balloon_blue_" + i + ".png";
            var strGray = "balloon_gray_" + i + ".png";
            this.redAnimFrames.push(cc.spriteFrameCache.getSpriteFrame(strRed));
            this.greenAnimFrames.push(cc.spriteFrameCache.getSpriteFrame(strGreen));
            this.blueAnimFrames.push(cc.spriteFrameCache.getSpriteFrame(strBlue));
            this.grayAnimFrames.push(cc.spriteFrameCache.getSpriteFrame(strGray));
        }

        this.redAnimation = new cc.Animation(this.redAnimFrames, 0.1);
        this.greenAnimation = new cc.Animation(this.greenAnimFrames, 0.1);
        this.blueAnimation = new cc.Animation(this.blueAnimFrames, 0.1);
        this.grayAnimation = new cc.Animation(this.grayAnimFrames, 0.1);

        this._balloons = [];

        for (var i = 0; i < this._balloonsLimit; i++){
            var balloonSprite = new cc.Sprite("#balloon_gray_1.png");
            balloonSprite.attr({x: -100, y: -100});   
            balloonSprite.setVisible(false);
            balloonSprite.touched = false;
            this._balloonScale = Math.random() * 0.6 + 0.7;
            // balloonSprite.scale = scale;
            balloonSprite.name = "Balloon" + i;
            balloonSprite.index = i;
            balloonSprite.setScale(this._balloonScale);
            this.addChild(balloonSprite); 

            balloonSprite.setCascadeOpacityEnabled(true);

            var lbBalloon = new cc.LabelBMFont("", res.CustomFont_fnt);
            lbBalloon.scale = 1.2;
            lbBalloon.x = balloonSprite.width/2 + 10;
            lbBalloon.y = balloonSprite.height/2 + 40;
            lbBalloon.tag = 100;
            lbBalloon.scale = this._balloonScale - 0.1;
            balloonSprite.addChild(lbBalloon);

            this._balloons.push(balloonSprite);
        }
    },

    _fetchObjectData: function(data) {
        this._data = data;
        // data = JSON.parse(data);
        // cc.log("_fetchObjectData data: " + data);
        if (data)
            this._objectsArray = data.map(function(object) {
                return object;
                // var o = GameObject.getInstance().findById(id);
                // if (o[0])
                //     return o[0];
            });
        else
            this._data = [];

        // cc.log("balloon game data after map: " + JSON.stringify(this._objectsArray));
        cc.log("balloon origin data: " + JSON.stringify(this._data));
        this.setData(JSON.stringify(this._data));
    },

    _addGoalList: function(objectName, goalNumber) {
        var balloonSprite;
        switch(objectName) {
            case "color_red":
                balloonSprite = new cc.Sprite(res.Red_balloon_png);
                break;
            case "color_green":
                balloonSprite = new cc.Sprite(res.Green_balloon_png);
                break;
            case "color_blue":
                balloonSprite = new cc.Sprite(res.Blue_balloon_png);
                break;
            default:
                balloonSprite = new cc.Sprite(res.Gray_balloon_png);    
                break;
        }   
        var lbGoal = new cc.LabelBMFont("0/" + goalNumber, res.CustomFont_fnt);
        lbGoal.scale = 0.5;
        lbGoal.x = cc.winSize.width - lbGoal.width/2;
        lbGoal.y = cc.winSize.height - 100;
        lbGoal.tag = 100;
        this.addChild(lbGoal);
        this._lbGoal = lbGoal;
        balloonSprite.setScale(0.25);
        balloonSprite.x = cc.winSize.width - (lbGoal.width + balloonSprite.width)* lbGoal.scale;
        balloonSprite.y = lbGoal.y;
        this.addChild(balloonSprite); 
    },

    _updateGoalLabel: function(correct) {
        // this._lbGoal.setString(correct + "/" + this._currentObject.amount);
        // this._hudLayer.updateSpecifyGoalLabel("".concat(correct).concat("-").concat(this._currentObject.amount));
        this._hudLayer.setCurrentSpecifyGoal(correct);
        this._hudLayer.updateSpecifyGoalLabel();
    },
});

var BalloonGameScene = cc.Scene.extend({
    ctor: function(objectIdArray, timeForScene) {
        this._super();

        this.name = "balloon";
        var layer = new BalloonGameLayer(objectIdArray, timeForScene);
        this.addChild(layer);
    }
});