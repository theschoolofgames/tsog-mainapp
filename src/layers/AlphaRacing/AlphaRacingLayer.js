var AR_TAG_TILE_MAP = 1;
var AR_SCALE_NUMBER = 1;
var TEST_SPEED = 1;
var ENABLE_DEBUG_DRAW = false;
var AR_ADI_ZODER = 1002;
var AR_LANDS_ZODER = 1000;
var AR_WORD_ZODER = 1001;
var AR_MAP_HORIZONTAL_TILES = 30;
var AR_MAP_VERTICLE_TILES = 20;

var AlphaRacingLayer = cc.LayerColor.extend({
	
    gameLayer: null,
    arEffectLayer: null,
    maps: [],
    mapIndexArray: [],
    historyMapIndexArray: [],
    layers: [],
    _mapIndex: 0,
    _gameLayerSize: cc.size(0,0),
    _mapWidth: 0,
    _mapHeight: 0,
    _player: null,
    _tileSize: cc.size(0,0),
    _landLayer: null,
    _playerBorder: null,
    _tileBorder: null,
    _alphabetPosArray: [],
    _alphabetObjectArray: [],
    _inputData: [],
    _tempInputData: [],
    _currentChallange: null,
    _currentEarnedNumber: 0,
    _hudLayer: null,
    _totalEarned: 0,
    _totalGoalNumber: 0,
    _warningLabel: null,
    _lastPlayerPos: cc.p(0,0),
    // Background objects
    _mountain01: null,
    _mountain02: null,
    _ground01: null,
    _ground02: null,
    _dust01: null,
    _dust02: null,
    _cloudGroup01: null,
    _cloudGroup02: null,

    _elapsedTime: 0,

    _deltaTime: 1 / 60,
    _timeForSence: 0,

	ctor: function(inputData, option, timeForScene) {
        this._super(cc.color("#ebfcff"));

        this.resetData();
        cc.log("timeForScene:" + timeForScene);
        this._inputData = inputData;
        this._tempInputData = inputData.slice();

        this._elapsedTime = 0;
        this._timeForSence = timeForScene;
        this.addRefreshButton();
    },

    addRefreshButton: function() {
        NativeHelper.callNative("customLogging", ["Button", "res/refresh-button.png"]);
        var refreshButton = new ccui.Button("res/refresh-button.png", "", "");
        refreshButton.x = cc.winSize.width - refreshButton.width;
        refreshButton.y = refreshButton.height / 2;
        this.addChild(refreshButton, 100);
        var self = this;
        refreshButton.addClickEventListener(function() {
            cc.director.replaceScene(new AlphaRacingScene([{"id": "word_a","value": "A","amount": "20"},{"id": "word_a","value": "a","amount": "20"}]));
        });
    },

    _init: function() {
        
        this.addHud();
        this.initPlatforms();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this)
        }, this);

        this.scheduleUpdate();
    },

    onEnter: function() {
        this._super();
        this._alphabetObjectArray = [];
        this.layers = [];
        this.maps = [];
        
        this._init();
        this._playBackgroundMusic();

        this._eventGameOver = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: EVENT_AR_GAMEOVER,
            callback: function(event) {
                this.unscheduleUpdate();
            }.bind(this)
        });
        cc.eventManager.addListener(this._eventGameOver, 1);
    },

    onExit: function() {
        this._super();
        this.unscheduleUpdate();
        this._player = null;
        this._tileSize = cc.size(0,0);
        this._landLayer = null;
        this._playerBorder = null;
        this._tileBorder = null;
        this._alphabetPosArray = [];
        this._alphabetObjectArray = [];
        this.layers = [];

        ARObstacleWorker.getInstance().removeAll();
        ARBoosterWorker.getInstance().removeAll();

        for (var i = 0; i < this.maps.length; i++) {
            this.gameLayer.removeChild(this.maps[i]);
        }
        this.maps = [];

        cc.eventManager.removeListener(this._eventGameOver);
    },

    resetData: function() {
        this.gameLayer = null;
        this.maps = [];
        this.mapIndexArray = [];
        this.historyMapIndexArray = [];
        this.layers = [];
        this._mapIndex = 0;
        this._gameLayerSize = cc.size(0,0);
        this._mapWidth = 0;
        this._mapHeight = 0;
        this._player = null;
        this._tileSize = cc.size(0,0);
        this._landLayer = null;
        this._playerBorder = null;
        this._tileBorder = null;
        this._alphabetPosArray = [];
        this._alphabetObjectArray = [];
        this._inputData = [];
        this._tempInputData = [];
        this._currentChallange = null;
        this._currentEarnedNumber = 0;
        this._hudLayer = null;
        this._totalEarned = 0;
        this._totalGoalNumber = 0;
        this._warningLabel = null;
        this._lastPlayerPos = cc.p(0,0);
        // Background objects
        this._mountain01 = null;
        this._mountain02 = null;
        this._ground01 = null;
        this._ground02 = null;
        this._dust01 = null;
        this._dust02 = null;
        this._cloudGroup01 = null;
        this._cloudGroup02 = null;
    },

    update: function(dt) {
        // Force to 60 FPS
        var updateTimes = Math.round(dt / this._deltaTime);

        for (var i = 0; i < updateTimes; i++) {
            let startTime = (new Date()).getTime();
            this._player.updatea(this._deltaTime / TEST_SPEED);
            this._checkAndReloadMaps(this._player);
            this.checkForAndResolveCollisions(this._player);
            this.checkForAlphabetCollisions();

            this.setViewpointCenter(this._player.getPosition());
            this._checkAndScrollBackgrounds(this._player.getPosition());
        }

        ARObstacleWorker.getInstance().update(dt);
        ARBoosterWorker.getInstance().update(dt);
    },

    _playBackgroundMusic: function() {
        cc.audioEngine.setEffectsVolume(0.2);
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
    },

    initPlatforms: function() {
        this._player = new ARAdiDog();

        ARObstacleWorker.getInstance().setPlayer(this._player);
        ARBoosterWorker.getInstance().setPlayer(this._player);
        
        // Check current goal and update UI
        this._initChallenges();

        this._addBackground();

        this.gameLayer = new cc.Layer();
        
        for (var i = 0; i < AR_TMX_LEVELS.length; i++) {
            var tmxMap = new cc.TMXTiledMap(AR_TMX_LEVELS[i]);
            tmxMap.setScale(AR_SCALE_NUMBER);
            tmxMap.setPosition(cc.p(-3000, -3000));
            tmxMap.setVisible(false)
            
            this.maps.push(tmxMap);
            this.gameLayer.addChild(tmxMap, AR_LANDS_ZODER, 2);

            var tmxLayer = tmxMap.getLayer("Lands");
            this.layers.push(tmxLayer);

            this.mapIndexArray.push({index: i});

            this._mapWidth = tmxMap.getContentSize().width;
            this._mapHeight = tmxMap.getContentSize().height;
            this._tileSize = cc.size(tmxMap.getTileSize().width * AR_SCALE_NUMBER, tmxMap.getTileSize().height * AR_SCALE_NUMBER);
        }

        // Shuffle map index array
        let shuffledMapArray = shuffle(this.mapIndexArray);

        // Render 3 maps
        for (var i = 0; i < 3; i++){
            let index = shuffledMapArray[i].index;
            this.maps[index].setVisible(true)
            this.maps[index].setPosition(cc.p(this._gameLayerSize.width, 0));
            cc.log("Map %d - Pos: (%d, %d) - Visible: %d", index, this.maps[index].x, 0, (this.maps[index].isVisible()) ? 1 : 0);
            this._gameLayerSize = cc.size(this._gameLayerSize.width + this._mapWidth, this._mapHeight);
            this.historyMapIndexArray.push(index);

            this.addAlphabet(this.maps[index]);
            this.addObstacles(this.maps[index]);
            this.addBoosters(this.maps[index]);
        }

        // cc.log("GameLayerSize = (%d, %d)", this._gameLayerSize.width, this._gameLayerSize.height);
        this.gameLayer.addChild(this._player, AR_ADI_ZODER);

        this._playerBorder = cc.DrawNode.create();
        // this._playerBorder.retain();
        this.gameLayer.addChild(this._playerBorder, AR_ADI_ZODER+1);

        this._tileBorder = cc.DrawNode.create();
        // this._tileBorder.retain();
        this.addChild(this._tileBorder);

        this.addChild(this.gameLayer);

        this.arEffectLayer = new AREffectLayer();
        this.addChild(this.arEffectLayer, 10);
    },

    _addBackground: function() {
        cc.spriteFrameCache.addSpriteFrames(res.AR_Background_plist);

        this._mountain01 = new cc.Sprite("#mountain.png");
        this._mountain01.setScale(1);
        this._mountain01.setAnchorPoint(0.5,0);
        this._mountain01.setPosition(cc.p(cc.winSize.width / 2, 150));
        this.addChild(this._mountain01, 0, 1);

        this._mountain02 = new cc.Sprite("#mountain.png");
        this._mountain02.setScale(1);
        this._mountain02.setAnchorPoint(0.5,0);
        this._mountain02.setPosition(cc.p(cc.winSize.width / 2 + this._mountain01.width, 150));
        this.addChild(this._mountain02, 0, 1);

        this._dust01 = new cc.Sprite("#foreground2.png");
        this._dust01.setScale(1);
        this._dust01.setAnchorPoint(0.5,0);
        this._dust01.setPosition(cc.p(cc.winSize.width / 2, 100));
        this.addChild(this._dust01, 0, 1);

        this._dust02 = new cc.Sprite("#foreground2.png");
        this._dust02.setScale(1);
        this._dust02.setAnchorPoint(0.5,0);
        this._dust02.setPosition(cc.p(cc.winSize.width / 2 + this._dust01.width, 100));
        this.addChild(this._dust02, 0, 1);

        this._ground01 = new cc.Sprite("#foreground1.png");
        this._ground01.setScale(1);
        this._ground01.setAnchorPoint(0.5,0);
        this._ground01.setPosition(cc.p(cc.winSize.width / 2, 100));
        this.addChild(this._ground01, 0, 1);

        this._ground02 = new cc.Sprite("#foreground1.png");
        this._ground02.setScale(1);
        this._ground02.setAnchorPoint(0.5,0);
        this._ground02.setPosition(cc.p(cc.winSize.width / 2 + this._ground01.width, 100));
        this.addChild(this._ground02, 0, 1);

        this._addCloudBackground();
    },

    _addCloudBackground: function() {
        this._cloudGroup01 = new cc.Layer();
        this._cloudGroup02 = new cc.Layer();
        this._cloudGroup02.setPositionX(cc.winSize.width);

        var cloud = new cc.Sprite("#cloud1.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup01.addChild(cloud);

        cloud = new cc.Sprite("#cloud2.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup01.addChild(cloud);

        cloud = new cc.Sprite("#cloud1.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup01.addChild(cloud);

        cloud = new cc.Sprite("#cloud2.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup02.addChild(cloud);

        cloud = new cc.Sprite("#cloud1.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup02.addChild(cloud);

        cloud = new cc.Sprite("#cloud2.png");
        cloud.setPosition(cc.p(Utils.getRandomInt(100, cc.winSize.width / 2), cc.winSize.height - Utils.getRandomInt(50, 120)));
        this._cloudGroup02.addChild(cloud);

        this.addChild(this._cloudGroup01);
        this.addChild(this._cloudGroup02);
    },

    _checkAndScrollBackgrounds: function(playerPos) {
        if (this._lastPlayerPos == cc.p(0,0)){
            this._lastPlayerPos = playerPos;
        }

        let offsetPos = cc.pSub(playerPos, this._lastPlayerPos);
        offsetPos.x = 0.1;
        this._scrollBackground(this._mountain01, this._mountain02, offsetPos, 0.1, 0.2);
        this._scrollBackground(this._ground01, this._ground02, offsetPos, 0.2, 0.4);
        this._scrollBackground(this._dust01, this._dust02, offsetPos, 0.17, 0.34);
        this._scrollBackground(this._cloudGroup01, this._cloudGroup02, offsetPos, 0.25, 0.25);

        this._lastPlayerPos = playerPos;
    },

    _scrollBackground: function(background1, background2, offsetPos, speedX, speedY) {
        let background1Pos = background1.getPosition();
        let background2Pos = background2.getPosition();

        var bg1NewPos = cc.p(background1Pos.x - offsetPos.x * speedX, background1Pos.y - offsetPos.y * speedY);
        var bg2NewPos = cc.p(background2Pos.x - offsetPos.x * speedX, background2Pos.y - offsetPos.y * speedY)

        if (background1Pos.x < background2Pos.x){
            if (background2Pos.x < cc.winSize.width / 2){
                bg1NewPos.x = background2Pos.x + background1.getContentSize().width - 10;
            }
        }
        else {
            if (background1Pos.x < cc.winSize.width / 2){
                bg2NewPos.x = background1Pos.x + background2.getContentSize().width - 10;   
            }
        }

        // bg1NewPos = cc.p(Math.round(bg1NewPos.x * cc.contentScaleFactor()) / cc.contentScaleFactor(), 
        //                  Math.round(bg1NewPos.y * cc.contentScaleFactor()) / cc.contentScaleFactor());
        // bg2NewPos = cc.p(Math.round(bg2NewPos.x * cc.contentScaleFactor()) / cc.contentScaleFactor(), 
        //                  Math.round(bg2NewPos.y * cc.contentScaleFactor()) / cc.contentScaleFactor());

        background1.setPosition(bg1NewPos);
        background2.setPosition(bg2NewPos);
    },

    _checkAndReloadMaps: function(player) {
        var newMapIndex = Math.floor(player.getPosition().x / this._mapWidth);

        if (newMapIndex == this._mapIndex)
            return;

        if (newMapIndex > 1){
            let shouldHideMapIndex = this.historyMapIndexArray[this.historyMapIndexArray.length - 3];
            this.maps[shouldHideMapIndex].setVisible(false);
            this.maps[shouldHideMapIndex].setPosition(cc.p(-3000, -3000));
            cc.log("Hide Map %d - Pos: (%d, %d)", shouldHideMapIndex, -3000, -3000);
            // Shuffle map index array
            let shuffledMapArray = shuffle(this.mapIndexArray.slice(0));

            let hasAvaiableMap = false;
            for (var i = 0; i < shuffledMapArray.length; i++){
                let index = shuffledMapArray[i].index;
                cc.log("Map %d - Pos: (%d, %d) - Visible: %d", index, this.maps[index].x, this.maps[index].y, (this.maps[index].isVisible()) ? 1 : 0);
                if (!this.maps[index].isVisible()){
                    hasAvaiableMap = true;
                    this.maps[index].setVisible(true);
                    this.maps[index].setPosition(cc.p(this._gameLayerSize.width, 0));

                    this._gameLayerSize = cc.size(this._gameLayerSize.width + this._mapWidth, this._mapHeight);
                    this.historyMapIndexArray.push(index);

                    this.addAlphabet(this.maps[index]);
                    this.addObstacles(this.maps[index]);
                    this.addBoosters(this.maps[index]);
                    break;
                }
            }
        }

        this._mapIndex = newMapIndex;
    },

    addHud: function() {
        cc.log("timeForScene: " + this._timeForSence);
        var hudLayer = new HudLayer(this, false, this._timeForSence);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
    },

    _addButtons: function() {
        var self = this;

        // RESTART
        var btnRestart = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnRestart.x = btnRestart.width - btnRestart.width;
        btnRestart.y = cc.winSize.height - btnRestart.height*2/3
        btnRestart.setLocalZOrder(1000);
        this.addChild(btnRestart);
        btnRestart.addClickEventListener(function() {
            self.restart();
        });

        var lbRestart = new cc.LabelBMFont("RESTART", "yellow-font-export.fnt");
        lbRestart.scale = 0.6;
        lbRestart.x = btnRestart.width/2;
        lbRestart.y = btnRestart.height/2;
        btnRestart.getRendererNormal().addChild(lbRestart);
    },

    restart: function() {

    },

    completedScene: function() {
        this._hudLayer.pauseClock();

        var lbText = "You Win";
        this.createWarnLabel(lbText, null, null, cc.winSize.height/2);
        var warningLabel = this._warningLabel;
        warningLabel.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(warningLabel, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }), 
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5))
        ));

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

    _moveToNextScene: function() {
        Utils.updateStepData();

        this._hudLayer.removeFromParent();

        this._inputData = this._inputData.map(function(id) {
            var o = GameObject.getInstance().findById(id);
            if (o[0])
                return o[0]; // return the name of the word
            else
                return id;
        });

        var self = this;
        cc.audioEngine.stopMusic();

        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        SceneFlowController.getInstance().moveToNextScene(nextSceneName, JSON.stringify(this._inputData));
    },

    _backToHome: function() {
        cc.director.replaceScene(new cc.TransitionFade(1, new MainScene(), cc.color(255, 255, 255, 255)));
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

    _initChallenges: function(){
        for (var i = 0; i < this._tempInputData.length; i++) {
            this._totalGoalNumber += parseInt(this._tempInputData[i].amount);
        }

        this._currentChallange = this._tempInputData.shift();

        this._hudLayer.updateProgressLabel("".concat(this._currentChallange.amount).concat("-").concat(this._currentChallange.value));
    },

    _checkForGoalAccepted: function(word) {
        if (!this._currentChallange){
            // Init
            for (var i = 0; i < this._tempInputData.length; i++) {
                this._totalGoalNumber += parseInt(this._tempInputData[i].amount);
            }

            this._currentChallange = this._tempInputData.shift();
        }

        if (this._tempInputData.length == 0 && parseInt(this._currentChallange.amount) <= this._currentEarnedNumber)
            return;

        if (this._currentChallange.value == word){
            jsb.AudioEngine.play2d(res.Succeed_sfx);

            this._currentEarnedNumber++;
            this._totalEarned++;
            // this._hudLayer.setProgressBarPercentage(this._totalEarned / this._totalGoalNumber);

            var percent = this._totalEarned / this._totalGoalNumber;
            this._hudLayer.setProgressBarPercentage(percent);

            let starEarned = 0;
            if (this._totalEarned == this._totalGoalNumber)
                starEarned = 3;
            else if (percent > 0.6)
                starEarned = 2;
            else if (percent > 0.3)
                starEarned = 1;
            else 
                starEarned = 0;
            
            this._hudLayer.setStarEarned(starEarned);
            if (starEarned > 0) {
                this._hudLayer.addStar("light", starEarned);
            }

            if (parseInt(this._currentChallange.amount) == this._currentEarnedNumber){
                if (this._tempInputData.length > 0){
                    this._currentChallange = this._tempInputData.shift();
                    this._currentEarnedNumber = 0;
                }
                else {
                    // Completed game
                    this.completedScene();
                }
            }
        }
        else {
            jsb.AudioEngine.play2d(res.Failed_sfx);
        }

        let leftObjects = parseInt(this._currentChallange.amount) - this._currentEarnedNumber;
        this._hudLayer.updateProgressLabel("".concat(leftObjects).concat("-").concat(this._currentChallange.value));
    },

    checkForAlphabetCollisions: function(){
        for (var i = 0; i < this._alphabetObjectArray.length; i++) {
            if (this._alphabetObjectArray[i].x < this._player.x - this._mapWidth / 2){
                this.gameLayer.removeChild(this._alphabetObjectArray[i]);
                this._alphabetObjectArray.splice(i--, 1);
                continue;
            }

            let pRect = this._player.getCollisionBoundingBox();
            let alphaRect = cc.rect(this._alphabetObjectArray[i].x,
                this._alphabetObjectArray[i].y,
                this._alphabetObjectArray[i].getBoundingBox().width, 
                this._alphabetObjectArray[i].getBoundingBox().height );
            if (cc.rectIntersectsRect(pRect, alphaRect)) {
                this._checkForGoalAccepted(this._alphabetObjectArray[i].getName());

                this.gameLayer.removeChild(this._alphabetObjectArray[i]);
                this._alphabetObjectArray.splice(i--, 1);
            }
            
        }
    },

    addObstacles: function(tmxMap) {
        let self = this;
        let group = this.getGroupPositions(tmxMap).filter(group => group.name == "Obstacles" )[0];

        if (group && group.posArray.length > 0) {
            group.posArray.forEach((params) => {                
                var obstacle = ARObstacleWorker.getInstance().addObstacle(params);
                self.gameLayer.addChild(obstacle, AR_WORD_ZODER);
            });
        }
    }, 

    addBoosters: function(tmxMap) {
        let self = this;
        let group = this.getGroupPositions(tmxMap).filter(group => group.name == "Boosters" )[0];

        if (group && group.posArray.length > 0) {
            group.posArray.forEach((params) => {                
                var obstacle = ARBoosterWorker.getInstance().addBooster(params);
                self.gameLayer.addChild(obstacle, AR_WORD_ZODER);
            });
        }
    },

    addAlphabet: function(tmxMap) {
        let posArray = this.getGroupPositions(tmxMap).filter(group => group.name.startsWith("alphaPosition"));
        let inputArray = this._inputData.slice(0);
        let groupIndex = 0;
        let self = this;

        // cc.log("This.Input Length: %d, That length: %d", this._inputData.length, inputArray.length);

        // this._alphabetObjectArray = [];

        posArray = shuffle(posArray);
        inputArray = shuffle(inputArray);
        
        let randomGroupNumber = Utils.getRandomInt(2, posArray.length);

        for (var i = 0; i < randomGroupNumber; i++) {
            let group = posArray.pop();
            let randomInputIndex = Utils.getRandomInt(0, self._inputData.length);
            let alphabet = self._inputData[randomInputIndex];
            // Set 0.8 probability for current alphabet
            if (Utils.getRandomInt(0, 10) < 6){
                alphabet = self._currentChallange;
            }

            group.posArray.forEach((pos) => {
                var object = new cc.LabelBMFont(alphabet.value, res.CustomFont_fnt);
                object.setScale(0.8);
                object.x = pos.x;
                object.y = pos.y;
                object.setName(alphabet.value);
                self.gameLayer.addChild(object, AR_WORD_ZODER);
                self._alphabetObjectArray.push(object);
            });
        }
    },

    getGroupPositions: function(tmxMap){
        var posArray = [];
        let _csf = cc.director.getContentScaleFactor();

        var self = this;
        tmxMap.getObjectGroups().forEach(function(group) {
            var groupPos = {
                name: group.getGroupName(),
                posArray: []
            };

            group.getObjects().forEach(function(obj) {
                var keys = Object.keys(obj);
                var copy = {};

                keys.forEach(k => copy[k] = obj[k]);

                copy.x = (copy.x + self._gameLayerSize.width - self._mapWidth) * _csf;
                copy.y = copy.y * _csf;

                groupPos.posArray.push(copy); 
            });

            posArray.push(groupPos);
        });
        return posArray;
    },

    onTouchBegan: function(touch, event) {
        var touchedPos = touch.getLocation();
        
        this._player.setMightJump(true);

        return true;
    },

    onTouchMoved: function(touch, event) {
        
    },

    onTouchEnded: function (touch, event) {
        var touchedPos = touch.getLocation();
        
        this._player.setMightJump(false);
    },

    tileCoordForPosition: function(position) {
        let x = Math.floor(position.x / this._tileSize.width);
        let levelHeightInPixels = this._gameLayerSize.height;
        let y = Math.floor((levelHeightInPixels - position.y) / this._tileSize.height);
        return cc.p(x, y);
    },

    tileRectFromTileCoords: function(tileCoords, mapIndex) {
        let levelHeightInPixels = this._gameLayerSize.height;
        let origin = cc.p(tileCoords.x * this._tileSize.width + mapIndex * this._mapWidth, levelHeightInPixels - ((tileCoords.y + 1) * this._tileSize.height));
        return cc.rect(origin.x, origin.y, this._tileSize.width, this._tileSize.height);
    },

    getSurroundingTilesAtPosition: function(position, layer, mapIndex) {
        let plPos = this.tileCoordForPosition(cc.p(position.x % this._mapWidth, position.y));
        // cc.log("position: %d, %d -> plPos: %d, %d", position.x, position.y, plPos.x, plPos.y);
    
        let gids = [];

        for (var j = 0; j < 9; j++) {
            let i = j;
            if (j == 4) {
                continue;
            } else if (j > 4) {
                i = j - 1;
            }

            let index = i;
            if (i == 0) {
                index = 6;
            } else if (i == 2) {
                index = 3
            } else if (i == 3) {
                index = 4
            } else if (i == 4) {
                index = 0
            } else if (i == 5) {
                index = 2
            } else if (i == 6) {
                index = 5
            } else if (i == 7) {
                index = 7
            } 

            let indexToCalculateRC = index
            if (index >= 4) {
                indexToCalculateRC = index + 1;
            }
            let c = indexToCalculateRC % 3;
            let r = Math.floor(indexToCalculateRC / 3);
            let tilePos = cc.p(plPos.x + (c - 1), plPos.y + (r - 1));
            
            if (tilePos.x > AR_MAP_HORIZONTAL_TILES - 1)
                tilePos.x = AR_MAP_HORIZONTAL_TILES - 1;
            if (tilePos.x < 0)
                tilePos.x = 0;

            if (tilePos.y > AR_MAP_VERTICLE_TILES - 1)
                tilePos.y = AR_MAP_VERTICLE_TILES - 1;
            if (tilePos.y < 0)
                tilePos.y = 0;

            let tgid = layer.getTileGIDAt(tilePos);
            
            let tileRect = this.tileRectFromTileCoords(tilePos, mapIndex);
            
            let tileDict = {gid: tgid, x: tileRect.x, y: tileRect.y, tilePos: tilePos, c: c, r: r};

            // cc.log("gid = %d -> tilePos.x = %d, tilePos.y = %d, index = %d", tgid, tilePos.x, tilePos.y, index);

            gids.push(tileDict);
        }

        return gids;
    },

    drawRectWithLabel: function(from, to, fillColor, lineSize, lineColor, label) {
        if (!ENABLE_DEBUG_DRAW)
            return;

        this._playerBorder.drawRect(from, to, fillColor, lineSize, lineColor);

        var lbl = new cc.LabelBMFont(label+"", "hud-font.fnt");
        lbl.color = cc.color("#ffd902");
        lbl.x = (to.x - from.x)/2 + from.x;
        lbl.y = (to.y - from.y)/2 + from.y;

        this._playerBorder.addChild(lbl);
    },

    drawRectPlatforms: function() {
        if (!ENABLE_DEBUG_DRAW)
            return;

        this._tileBorder.clear();

        var ls = this._landLayer.getLayerSize();
        var offsetPos = this._tmxMap.getPosition();
        for (var y = 0; y < ls.height; y++) {
            for (var x = 0; x < ls.width; x++) {
                let tile = this._landLayer.getTileAt(cc.p(x, y));
                if (tile){
                    let tileRect = cc.rect(tile.x + offsetPos.x, tile.y + offsetPos.y, this._tileSize.width, this._tileSize.height);
                    this._tileBorder.drawRect(tileRect, cc.p(tileRect.x + tileRect.width 
                        ,tileRect.y + tileRect.height), cc.color(255,0,100,0), 3, cc.color(33, 33, 33, 100));
                }
            }
        }
    },

    checkForAndResolveCollisions: function(p) {
        // cc.log("MapIndex %d, MapWidth %d, layersLength %d", this._mapIndex, this._mapWidth, this.layers.length);
        this._playerBorder.clear();
        this._playerBorder.removeAllChildren();

        var pRect = p.getCollisionBoundingBox();

        this.drawRectWithLabel(cc.p(pRect.x, pRect.y),
            cc.p(pRect.x + pRect.width, pRect.y + pRect.height),
            cc.color(255,0,100,0), 3, cc.color(0, 100, 100,255),
            "[]");

        this.drawRectPlatforms();
        
        // Player pass through 2nd map => create a new map, push new map,layer => remove old map, layer
        // => current map, layer index will be 1
        // let layerIndex = (this._mapIndex > 1) ? 1 : this._mapIndex; 
        let layerIndex = 0;
        for (var i = 0; i < this.maps.length; i++){
            // cc.log("Player (%d, %d) - MapPos (%d, %d)", p.x, p.y, this.maps[i].x, this.maps[i].y);
            if (this.maps[i].isVisible()){
                if (p.x >= this.maps[i].x && p.x < (this.maps[i].x + this._mapWidth)){
                    layerIndex = i;
                    break;
                }
            }
        }

        // console.log("Layer Index => " + layerIndex);

        var tiles = this.getSurroundingTilesAtPosition(p.getPosition(), this.layers[layerIndex], this._mapIndex);
        p.setOnGround(false);
        p.setOnRightCollision(false);

        for (var i = 0; i < tiles.length; i++) {

            var dic = tiles[i];
            // let _tileRect = cc.rect(dic.x, dic.y, this._tileSize.width, this._tileSize.height); 
            
            // cc.log("Gid Json => %s", JSON.stringify(dic));
            // cc.log("Player Rect => (%d, %d, %d, %d)", pRect.x, pRect.y, pRect.width, pRect.height);
            var gid = dic.gid;
            if (gid) {
                let tileRect = cc.rect(dic.x, dic.y + this._tileSize.height/2, this._tileSize.width, this._tileSize.height/2); 
                if (cc.rectIntersectsRect(pRect, tileRect)) {               

                    this.drawRectWithLabel(cc.p(dic.x, dic.y),
                        cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                        cc.color(255,0,100,0), 3, cc.color(255, 0, 0,255),
                        i+1);

                    // continue;

                    let intersection = cc.rectIntersection(pRect, tileRect);

                    let desiredPosition = p.getDesiredPosition();
                    let velocity = p.getVelocity();
                    
                    if (i == 0) {
                        // cc.log("tile is directly below player. i = %d", i + 1);
                        if (!p.onGround()){
                            p.setDesiredPosition( cc.p(desiredPosition.x, desiredPosition.y + intersection.height));
                            p.setVelocity(cc.p(velocity.x, 0.0));
                            p.setOnGround(true);
                            p.runAnimation();
                        }
                    } else if (i == 1) {
                        // cc.log("tile is directly above player");
                        p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y - intersection.height));
                        p.setVelocity(cc.p(velocity.x, 0.0));
                    } else if (i == 2) {
                        // cc.log("tile is left of player. i = %d", i + 1);
                        p.setDesiredPosition(cc.p(desiredPosition.x + intersection.width, desiredPosition.y));
                    } else if (i == 3) {
                        // cc.log("tile is right of player. i = %d", i + 1);
                        p.setDesiredPosition(cc.p(desiredPosition.x - intersection.width, desiredPosition.y));
                        p.setOnRightCollision(true);
                        // p.setVelocity(cc.p(0.0, 0.0));
                    } else {
                        
                        if (intersection.width > intersection.height) {
                            // cc.log("tile is diagonal, but resolving collision vertially. i = %d", i + 1);
                            p.setVelocity(cc.p(velocity.x, 0.0)); 
                            let resolutionHeight;
                            if (i > 5) {
                                resolutionHeight = intersection.height;
                                // p.setOnGround(true);
                            } else {
                                resolutionHeight = -intersection.height;
                            }
                            // p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y + resolutionHeight ));
                            
                        } else {
                            // cc.log("tile is on right or left side. i = %d", i + 1);
                            let resolutionWidth;
                            if (i == 6 || i == 4 || !p.onGround()) {
                                resolutionWidth = intersection.width;
                            } else {
                                resolutionWidth = -intersection.width;
                            }
                            // p.setDesiredPosition(cc.p(desiredPosition.x , desiredPosition.y + resolutionWidth));
                        } 
                    } 

                    // cc.log("Desired Position (%d, %d)", this._player.getDesiredPosition().x, this._player.getDesiredPosition().y);
                }
                else {
                    this.drawRectWithLabel(cc.p(dic.x, dic.y),
                        cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                        cc.color(255,0,100,0), 3, cc.color(0, 0, 255,255),
                        i+1);
                }
            }
            else {
                this.drawRectWithLabel(cc.p(dic.x, dic.y),
                    cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                    cc.color(255,0,100,0), 3, cc.color(33, 33, 33,255),
                    i+1);
            }
        }
        // cc.log("yo, onground: ", p.onGround());
        // cc.log("ARLayer desiredPosition => (%d, %d)", p.getDesiredPosition().x, p.getDesiredPosition().y);
        p.setPosition(p.getDesiredPosition());
    },

    setViewpointCenter: function(position) {
        let winSize = cc.winSize;

        let x = Math.max(position.x, winSize.width / 2);
        let y = Math.max(position.y, winSize.height / 2);
        x = Math.min(x, (this._gameLayerSize.width * this._tileSize.width) 
                - winSize.width / 2);
        y = Math.min(y, (this._gameLayerSize.height * this._tileSize.height) 
                - winSize.height/2);
        let actualPosition = cc.p(x, y);
        
        let centerOfView = cc.p(winSize.width/3, winSize.height/3);
        let viewPoint = cc.pSub(centerOfView, actualPosition);

        let contentScaleFactor = cc.contentScaleFactor();
        this.gameLayer.setPosition(cc.p(
            Math.round(viewPoint.x * contentScaleFactor) / contentScaleFactor, 
            Math.round(viewPoint.y * contentScaleFactor) / contentScaleFactor)); 

        this.arEffectLayer.y = this.gameLayer.y;
    },

});

var AlphaRacingScene = cc.Scene.extend({
    ctor: function(inputData, option, timeForScene) {
        this._super();
        cc.log("timeForScene: " + timeForScene);
        this.name = "alpha-racing";
        var layer = new AlphaRacingLayer(inputData,option, timeForScene);
        this.addChild(layer);
    }
});