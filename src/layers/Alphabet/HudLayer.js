var HudLayer = cc.Layer.extend({
    _layer: null,
    _clock: null,
    _clockImg: null,
    _settingBtn: null,
    _goalImg: null,
    _progressBarBg: null,
    _progressLabel: null,
    _gameProgressBar: null,
    _progressPercentage: 0,
    _starEarned: 0,
    _trophiesEarned: 0,
    _lbCoin: null,

    ctor: function(layer, withoutClock, timeForScene) {
        this._super();

        this._layer = layer;
        this._trophiesEarned = KVDatabase.getInstance().getInt("trophiesEarned", 0);
        cc.log("createHUD: " +  timeForScene);
        this.addSettingButton();
        this.addGameProgressBar();
        this.addGoalImage();
        this.addCurrency();
        if(withoutClock == false || withoutClock == null )
            this.addClockImage(true,timeForScene);
        else this.addClockImage(false, timeForScene);

        this.width = this._clockImg.x + this._clockImg.width/2;
        this.height = this._settingBtn.height;
        this.scheduleUpdate();
        this.schedule(this.updatex, 0.5);
    },

    addSettingButton: function() {
        var settingBtn = new ccui.Button();
        settingBtn.loadTextures("btn_pause.png", "btn_pause-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        settingBtn.x = settingBtn.width - 10;
        settingBtn.y = cc.winSize.height - 80 + settingBtn.height/2 - 10;
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
        gameProgressBar.x = progressBarBg.width/2 ;
        gameProgressBar.y = progressBarBg.height/2 + 2;
        gameProgressBar.type = cc.ProgressTimer.TYPE_BAR;
        gameProgressBar.midPoint = cc.p(0, 1);
        gameProgressBar.barChangeRate = cc.p(1, 0);
        gameProgressBar.percentage = 1;
        // gameProgressBar.shaderProgram = shaderScrolling;
        progressBarBg.addChild(gameProgressBar);

        this._gameProgressBar = gameProgressBar;

        this.addStar("dark", DARK_STAR_NUMBERS);
    },

    addGoalImage: function() {
        var goalBg = new cc.Sprite("#whitespace.png");
        goalBg.x = this._progressBar.x + this._progressBar.width/2 + goalBg.width/2 + HUD_BAR_DISTANCE;
        goalBg.y = this._progressBar.y;
        this.addChild(goalBg);

        var cupImage = new cc.Sprite("#cup.png");
        cupImage.x = 0;
        cupImage.y = cupImage.height/2 - 5;
        goalBg.addChild(cupImage);

        this._goalImg = goalBg;
        var numItems = Global.NumberItems;
        // this.addProgressLabel(goalBg, "0/" + numItems);
        this.addProgressLabel(goalBg, this._trophiesEarned);
    },

    addClockImage: function(visible, timeForScene) {
        var clockBg = new cc.Sprite("#whitespace.png");
        clockBg.x = this._goalImg.x + this._goalImg.width/2 + clockBg.width/2 + HUD_BAR_DISTANCE;
        clockBg.y = this._goalImg.y;
        this.addChild(clockBg);

        var clockImg = new cc.Sprite("#clock.png");
        clockImg.x = 0;
        clockImg.y = clockImg.height/2 - 5;
        clockBg.addChild(clockImg);
        clockBg.setVisible(visible);
        this._clockImg = clockBg;
        this.addCountDownClock(visible, timeForScene);
    },

    addProgressLabel: function(object, text) {
        // cc.log("text: " + text);
        font =  "hud-font.fnt";

        var label = new cc.LabelBMFont(text+"", font);
        // label.scale = 0.5;
        // var label = new cc.LabelTTF(text, "Arial", 32);
        label.color = cc.color("#ffd902");
        label.x = object.width/2 + 10;
        label.y = object.height - 17;
        object.addChild(label);

        this._progressLabel = label;
    },

    addStar: function(type, number) {
        for ( var i = 0; i < number; i++) {
            var star = new cc.Sprite("#star-" + type +".png");
            star.x = (this._progressBarBg.width - 30)/3 * (i+1);
            star.y = this._progressBarBg.height/2 + 5;
            this._progressBarBg.addChild(star);
            // cc.log("david add Star");
        }
    },

    addCountDownClock: function(withClock, timeForScene) {
        var self = this;
        var clockInitTime = GAME_CONFIG.levelTime;
        if(timeForScene) {
            clockInitTime = timeForScene;
        };
        cc.log("clockInitTime: " + clockInitTime);
        var currentSceneName = SceneFlowController.getInstance().getCurrentSceneName();
        cc.log("currentSceneName: " + currentSceneName ); 
        var clock = new Clock(clockInitTime, function(){
            if(currentSceneName == "speaking")
                self._layer._timesUp = true;
            if(withClock == true)
                self._layer.completedScene();
        });
        clock.x = this._clockImg.width / 2 + 10;
        clock.y = cc.winSize.height - 80 + this._clockImg.height / 2;
        this._clockImg.addChild(clock, 99);

        this._clock = clock;
    },

    addCurrency: function() {
        var coin = new cc.Sprite("gold.png");
        coin.x = cc.winSize.width - coin.width/2 - 10;
        coin.y = cc.winSize.height - 80 + coin.height/2 + 10;
        this.addChild(coin, 999);
        var coinAmount = CurrencyManager.getInstance().getCoin();
        var lbCoin = new cc.LabelBMFont(coinAmount.toString(), "res/font/custom_font.fnt");
        lbCoin.scale = 0.4;
        lbCoin.anchorX = 1;
        lbCoin.x = -coin.width/2;
        lbCoin.y = coin.height/2;
        coin.addChild(lbCoin);

        this._lbCoin = lbCoin;
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
        // var numberItems = 0;
        // if (numItems == null)
        //     numberItems = Global.NumberItems
        // else numberItems = numItems;
        // this._progressLabel.setString(text + "/" + numberItems);
        cc.log("setProgressLabelStr");
        this._trophiesEarned++;
        this._progressLabel.setString(this._trophiesEarned);
        KVDatabase.getInstance().set("trophiesEarned", this._trophiesEarned);
    },

    updateProgressLabel: function(text){
        this._progressLabel.setString(text);
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
        this._lbCoin.setString(CurrencyManager.getInstance().getCoin().toString());
        // this.popGold(1, cc.winSize.width/3, cc.winSize.height/3);
    },

    popGold: function(amount, x, y, delay) {
        if(amount == 0)
            return;
        var finalScale = 2;
        var self = this;
        var node = new ccui.Button("coin-empty.png", "", "");
        // node.setTitleFontName(this._gameTheme.font);
        // node.setTitleText(amount);
        // node.setTitleFontSize(40);
        // node.setTitleColor(cc.color(111, 96, 0))
        node.addClickEventListener(this._tappedGoldNode.bind(this));
        node.tag = amount;
        node.x = x;
        node.y = y;
        node.setCascadeColorEnabled(true);
        var goldNumber = new cc.LabelBMFont(amount.toString(), res.Font_gold_fnt);
        goldNumber.scale = 0.7
        goldNumber.x = node.width/2 - 0.5;
        goldNumber.y = node.height/2 + 1.5;
        goldNumber.setCascadeColorEnabled(true);
        node.addChild(goldNumber);

        node.scaleX = 0.2*finalScale;
        node.scaleY = 0.5*finalScale;
        node.visible = true;

        var jumpHeight = 150 + Math.random()*50;
        var jumpDistanceX = 20 + Math.random()*20;
        var jumpDistanceY = 0;
        if (Math.random() < 0.5) 
            jumpDistanceX *= -0.5;
        if(x > (cc.winSize.width - 80))
            jumpDistanceX = - 20;
        if(x < 40)
            jumpDistanceX  = 10;
        var duration = 0.4 * finalScale;

        // node.runAction(cc.sequence(
        //     cc.delayTime(delay),
        //     cc.show(),
        //     cc.spawn(
        //         cc.scaleTo(duration, finalScale, finalScale),
        //         cc.jumpBy(duration, jumpDistanceX*finalScale, jumpDistanceY*finalScale, jumpHeight*finalScale, 1)
        //     )
        // ));
        // node.runAction(cc.repeatForever(cc.sequence(
        //     cc.tintTo(0.15, 220, 220, 220),
        //     cc.tintTo(0.15, 255, 255, 255)
        // )));
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
        // increase balance
        CurrencyManager.getInstance().incCoin(amount);


        for (var i = 0; i < amount; i++) {
            var gold = new cc.Sprite("gold.png");
            gold.x = goldNode.x;
            gold.y = goldNode.y;
            gold.scale = Math.random()*0.1 + 0.8;
            this.addChild(gold,99999);

            var flyTime = 0.8 + Math.random()*0.2;

            var weight = 100 + Math.random()*150;
            var goldBalanceNodeBox = this._lbCoin.parent.getBoundingBox()
            var to = cc.p(cc.rectGetMidX(goldBalanceNodeBox), cc.rectGetMidY(goldBalanceNodeBox));
            
            var cp2x = (gold.x > to.x ? -1 : 1) * (Math.random()*600 - 300);
            var cp1 = cc.p(gold.x, gold.y - weight);
            var cp2 = cc.p(gold.x + cp2x, gold.y - weight);

            var flyAction = cc.bezierTo(flyTime, [cp1, cp2, to]);
            gold.runAction(cc.repeatForever(cc.rotateBy(flyTime, 260)));
            var self = this;
            gold.runAction(cc.sequence(
                cc.spawn(
                    // cc.callFunc(function(){
                    //     cc.log("flyAction");
                    // }),
                    flyAction
                ),
                cc.callFunc(function(node) {
                    // self._goldBalanceNode.stopAllActions();
                    // self._goldBalanceNode.runAction(cc.sequence(
                    //     cc.callFunc(function() {
                    //         AudioManager.getInstance().play2d(res.EarnGold_sfx);
                    //     }),
                    //     cc.scaleTo(0.05, 1*1.2),
                    //     cc.scaleTo(0.05, 1)
                    // ));
                    node.removeFromParent();
                })
            ));
        };

        goldNode.removeFromParent();
        // count up balance gradually
        // this._updateGoldAmountLabel(amount, 0.8);
    }
});