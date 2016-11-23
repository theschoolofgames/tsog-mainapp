var CURRENCY_SCALE = 0.8;
var GOLD_ANIMATION_FRAMES_COUNT = 10;
var DIAMOND_ANIMATION_FRAMES_COUNT = 9;
var HudLayer = cc.Layer.extend({
    _layer: null,
    _clock: null,
    _clockBg: null,
    _settingBtn: null,
    _goalImg: null,
    _progressBarBg: null,
    _totalGoalsLabel: null,
    _gameProgressBar: null,
    _lbCoin: null,

    _currencyType: null,
    _coinEffect: null,
    _coin: null,

    _progressPercentage: 0,
    _starEarned: 0,
    _trophiesEarned: 0,
    _currentGoals: 0,
    _totalGoals: 0,

    _coinAnimationFrames: [],

    ctor: function(layer, withoutClock, timeForScene) {
        this._super();

        this._layer = layer;
        this._trophiesEarned = KVDatabase.getInstance().getInt("trophiesEarned", 0);
        cc.log("createHUD: " +  timeForScene);
        this.addSettingButton();
        this.addGameProgressBar();

        this.addTotalGoals();
        if(withoutClock == false || withoutClock == null )
            this.addClockImage(true,timeForScene);
        else this.addClockImage(false, timeForScene);

        this.addCurrency();
        this.width = this._clockBg.x + this._clockBg.width/2;
        this.height = this._settingBtn.height;
        this.scheduleUpdate();
        this.schedule(this.updatex, 0.5);
    },

    createCoinAnimations: function() {
        this._coinAnimationFrames = [];
        var totalFrames = (this._currencyType == "gold") ? GOLD_ANIMATION_FRAMES_COUNT : DIAMOND_ANIMATION_FRAMES_COUNT;

        for (var i = 0; i < totalFrames; i++) {
            var frame = this._currencyType + "-0" + i + ".png";
            cc.log("frame: " + frame);
            cc.log("spriteFrameCache: " + cc.spriteFrameCache.getSpriteFrame(frame));
            this._coinAnimationFrames.push(cc.spriteFrameCache.getSpriteFrame(frame));
        }

        // this._coinAnimationFrames = new cc.Animation(this._coinAnimationFrames, 0.05);
    },

    addSettingButton: function() {
        var settingBtn = new ccui.Button();
        settingBtn.loadTextures("btn_pause.png", "btn_pause-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        settingBtn.x = settingBtn.width - 20;
        settingBtn.y = cc.winSize.height - 80 + settingBtn.height/2 - 20 * Utils.screenRatioTo43();
        this.addChild(settingBtn);

        var self = this;
        settingBtn.addClickEventListener(function() {
            self._layer.addChild(new SettingDialog(), 99999);
            cc.director.pause();
        })
        this._settingBtn = settingBtn;
    },

    addGameProgressBar: function() {
        var progressBarBg = new cc.Sprite("#progress-bar.png");
        progressBarBg.x = this._settingBtn.x + progressBarBg.width/2 + HUD_BAR_DISTANCE;
        progressBarBg.y = this._settingBtn.y;
        this.addChild(progressBarBg);

        this._progressBarBg = progressBarBg;

        this._progressBar = progressBarBg;

        var colorBar = new cc.Sprite("#colorbar.png");
        // var colorBar = new cc.Sprite(res.Hud_progress_bar_png);
        // var mask = cc.textureCache.getTextureForKey(res.Hud_progress_bar_alpha_png);
        // if (!mask)
        //     mask = cc.textureCache.addImage(res.Hud_progress_bar_alpha_png);
        // var shaderScrolling = cc.GLProgram.createWithFilenames(res.PositionTextureColor_vsh, res.ScrollingTexture_fsh);
        // var shaderScrollingState = cc.GLProgramState.getOrCreateWithGLProgram(shaderScrolling);
        // shaderScrollingState.setUniformTexture("u_alphaTexture", mask);

        var gameProgressBar = new cc.ProgressTimer(colorBar);
        gameProgressBar.x = progressBarBg.width/2 - 1;
        gameProgressBar.y = progressBarBg.height/2 + 2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = 1;
        // gameProgressBar.shaderProgram = shaderScrolling;
        progressBarBg.addChild(gameProgressBar);

        this._gameProgressBar = gameProgressBar;

        // this.addStar("dark", DARK_STAR_NUMBERS);
    },

    addGoalImage: function() {

    },

    addClockImage: function(visible, timeForScene) {
        var clockBg = new cc.Sprite("#whitespace.png");
        clockBg.x = this._progressBarBg.x + this._progressBarBg.width/2 + clockBg.width/2 + HUD_BAR_DISTANCE;
        clockBg.y = this._progressBarBg.y;
        this.addChild(clockBg);
        this._clockBg = clockBg;

        var clockImg = new cc.Sprite("#clock.png");
        clockImg.x = 0;
        clockImg.y = clockImg.height/2 - 5;
        clockBg.addChild(clockImg);
        clockBg.setVisible(visible);
        this.addCountDownClock(visible, timeForScene);
        cc.log("visible %s, timeForScene %d", visible, timeForScene)
    },

    addStar: function(type, number) {
        // for ( var i = 0; i < number; i++) {
        //     var star = new cc.Sprite("#star-" + type +".png");
        //     star.x = (this._progressBarBg.width - 30)/3 * (i+1);
        //     star.y = this._progressBarBg.height/2 + 5;
        //     this._progressBarBg.addChild(star);
        //     // cc.log("david add Star");
        // }
    },

    addTotalGoals: function() {
        this._currentGoals = 0;
        this._totalGoals = 0;
        var text = this._currentGoals + "/" + this._totalGoals;
        this._totalGoalsLabel = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._totalGoalsLabel.scale = 0.5;
        this._totalGoalsLabel.x = this._progressBarBg.width *0.5 - 1;
        this._totalGoalsLabel.y = this._progressBarBg.height *0.5 + 2;
        this._progressBarBg.addChild(this._totalGoalsLabel, 99);
    },  

    addCountDownClock: function(withClock, timeForScene) {
        var self = this;
        var clockInitTime = GAME_CONFIG.levelTime;
        if(timeForScene) {
            clockInitTime = timeForScene;
        };
        // cc.log("clockInitTime: " + clockInitTime);
        var currentSceneName = SceneFlowController.getInstance().getCurrentSceneName();
        // cc.log("currentSceneName: " + currentSceneName ); 
        var clock = new Clock(clockInitTime, function(){
            if(withClock)
                self._layer.completedScene();
        });
        clock.x = this._clockBg.width / 2 + 10;
        clock.y = this._clockBg.height / 2;
        this._clockBg.addChild(clock, 99);

        this._clock = clock;
    },

    addCurrency: function() {
        var bg = new cc.Sprite("#whitespace.png");
        bg.x = cc.winSize.width - bg.width/2 - 5;
        bg.y = this._progressBarBg.y;
        this.addChild(bg);
        this._bg = bg;

        if (!this._currencyType)
            this._currencyType = "gold";
        var coin = new cc.Sprite("#" + this._currencyType + ".png");
        coin.scale = CURRENCY_SCALE;
        coin.x = bg.width - coin.width/2 + 10;
        coin.y = bg.height/2;
        this._bg.addChild(coin, 999);
        this._coin = coin;

        var coinAmount = CurrencyManager.getInstance().getCoin();
        var lbCoin = new cc.LabelBMFont(coinAmount.toString(), res.HudFont_fnt);
        // lbCoin.scale = 0.4;
        lbCoin.anchorX = 1;
        lbCoin.x = -5;
        lbCoin.y = coin.height/2 + 2;
        coin.addChild(lbCoin);

        this._lbCoin = lbCoin;
        this.createCoinAnimations();
    },

    getRemainingTime: function() {
        return this._clock.getRemainingTime();
    },

    pauseClock: function() {
        this._clock.stopClock();
    },

    resumeClock: function() {
        this._clock.activeCountDownClock();
    },

    setProgressLabelStr: function(text, numItems) {
        var numberItems = 0;
        if (numItems == null)
            numberItems = Global.NumberItems
        else numberItems = numItems;
        this._progressLabel.setString(text + "/" + numberItems);
        cc.log("setProgressLabelStr");
        this._trophiesEarned++;
        this._progressLabel.setString(this._trophiesEarned);
        KVDatabase.getInstance().set("trophiesEarned", this._trophiesEarned);
    },

    updateTotalGoalsLabel: function(){
        this._totalGoalsLabel.setString(this._currentGoals + "/" + this._totalGoals);
    },

    setTotalGoals: function(totalGoals) {
        this._totalGoals = totalGoals || 0;
        this.updateTotalGoalsLabel();
    },

    setCurrentGoals: function(currentGoals) {
        this._currentGoals = currentGoals;
    },

    setProgressBarPercentage: function(percent){
        this._progressPercentage = percent*100;
    },

    setStarEarned: function(starEarned) {
        this._starEarned = starEarned;
    },

    getStarEarned: function() {
        return this._starEarned;
    },

    update: function(dt){
        var currentPercentage = this._gameProgressBar.getPercentage();
        if ((this._progressPercentage > 0) && (this._progressPercentage > currentPercentage)) {
            currentPercentage += PROGRESSBAR_CHANGE_RATE*dt;
        }
        this._gameProgressBar.percentage = currentPercentage;
    },

    updatex: function() {
        var balance = CurrencyManager.getInstance().getCoin().toString();
        if (this._currencyType == "diamond")
            balance = CurrencyManager.getInstance().getDiamond().toString();

        this._lbCoin.setString(balance);
        // this.popGold(1, cc.winSize.width/3, cc.winSize.height/3);
    },

    popGold: function(amount, x, y, delay) {
        if(amount == 0)
            return;
        var self = this;
        var node = new ccui.Button(this._currencyType + ".png", "", "");

        node.addClickEventListener(this._tappedGoldNode.bind(this));
        node.tag = amount;
        node.x = x;
        node.y = y;
        node.visible = false;

        node.runAction(cc.sequence(
            cc.delayTime(0),
            cc.callFunc(function(){
                cc.log("runAction auto tap");
                self._tappedGoldNode(node);
            })
        ));
        this.addChild(node);
    },

    _tappedGoldNode: function(goldNode) {
        if (goldNode.getNumberOfRunningActions() > 2)
            return;

        var amount = goldNode.tag;

        for (var i = 0; i < amount; i++) {
            var gold = new cc.Sprite("#" + this._currencyType + ".png");
            gold.x = goldNode.x;
            gold.y = goldNode.y;
            gold.scale = CURRENCY_SCALE;//Math.random()*0.1 + 0.8;
            this.addChild(gold,99999);

            var flyTime = 0.8 + Math.random()*0.2;

            var weight = 100 + Math.random()*150;
            var goldBalancePos = this._lbCoin.parent.getPosition();
            goldBalancePos = this._bg.convertToWorldSpace(goldBalancePos);
            // cc.log("pos: " + JSON.stringify(goldBalancePos));
            var goldBalanceNodeBox = this._coin.getBoundingBox();
            var to = cc.p(goldBalancePos.x, goldBalancePos.y);
            
            var cp2x = (gold.x > to.x ? -1 : 1) * (Math.random()*600 - 300);
            var cp1 = cc.p(gold.x, gold.y - weight);
            var cp2 = cc.p(gold.x + cp2x, gold.y - weight);

            var flyAction = cc.bezierTo(flyTime, [cp1, cp2, to]);
                        
            this._playAdditionEffect(gold, flyTime);
            gold.runAction(cc.sequence(
                flyAction,
                cc.callFunc(function(node) {
                    node.removeFromParent();
                })
            ));

            var self = this;
            gold.runAction(cc.sequence(
                cc.delayTime(flyTime-0.1),
                cc.callFunc(function() {
                    cc.log("prepare calling addCoinEffect");
                    self.addCoinEffect();
                    if (self._currencyType == "gold")
                        CurrencyManager.getInstance().incCoin(amount);
                })
            ));
        };

        goldNode.removeFromParent();
    },

    _playAdditionEffect: function(gold, effectTime) {
        // var rotateValue = Math.ceil(Math.random() * 5 + 5) * 350;
        // gold.runAction(cc.repeatForever(cc.rotateBy(effectTime, rotateValue)));
        var anim = new cc.Animation(this._coinAnimationFrames, 0.005);
        var action = cc.repeatForever(cc.animate(anim));
        gold.runAction(action);
    },

    addCoinEffect: function() {
        cc.log("HudLayer addCoinEffect");
        var coinScale = CURRENCY_SCALE;
        this._coin.stopAllActions();
        this._bg.stopAllActions();

        this._coin.runAction(cc.sequence(
            cc.scaleTo(0.15, 0.9 * coinScale),
            cc.scaleTo(0.15, coinScale)
        ));
        
        this._bg.runAction(cc.sequence(
            cc.scaleTo(0.15, 0.9),
            cc.scaleTo(0.15, 1)
        ));
    },

    setCurrencyType: function(name) {
    },

    addSpecifyGoal: function(imageName) {

    },

    setTotalSpecifyGoal: function(goal) {

    },

    setCurrentSpecifyGoal: function(goal) {

    },

    updateSpecifyGoalLabel: function() {

    },
});