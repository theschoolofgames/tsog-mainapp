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

    ctor: function(layer, withoutClock) {
        this._super();

        this._layer = layer;
        this.addSettingButton();
        this.addGameProgressBar();
        this.addGoalImage();
        this.addDebugButtons();
        if(withoutClock == false || withoutClock == null )
            this.addClockImage(true);
        else this.addClockImage(false);

        this.width = this._clockImg.x + this._clockImg.width/2;
        this.height = this._settingBtn.height;
        this.scheduleUpdate();

    },

    addDebugButtons: function() {
        var self = this;
        
        if (TSOG_DEBUG) {
            var winCurTestBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
            winCurTestBtn.x = cc.winSize.width - 30;
            winCurTestBtn.y = 80;
            winCurTestBtn.anchorX = winCurTestBtn.anchorY = 1;
            winCurTestBtn.titleText = "Win Current Test";
            winCurTestBtn.setTitleColor(cc.color.BLACK);
            winCurTestBtn.setTitleFontSize(16);
            this.addChild(winCurTestBtn);
            winCurTestBtn.addClickEventListener(function() {
                self._layer._moveToNextScene();
            });

            var winToRoomOrForestBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
            winToRoomOrForestBtn.x = cc.winSize.width - 30;
            winToRoomOrForestBtn.y = 50;
            winToRoomOrForestBtn.anchorX = winToRoomOrForestBtn.anchorY = 1;
            winToRoomOrForestBtn.titleText = "Win To Room/Forest";
            winToRoomOrForestBtn.setTitleColor(cc.color.BLACK);
            winToRoomOrForestBtn.setTitleFontSize(16);
            this.addChild(winToRoomOrForestBtn);
            winToRoomOrForestBtn.addClickEventListener(function() {
                var nextSceneName = SceneFlowController.getInstance().getNextRoomOrForestScene();
                var scene = new window[nextSceneName]();
                cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
            });
        }
    },

    addSettingButton: function() {
        var settingBtn = new ccui.Button();
        settingBtn.loadTextures("btn_pause.png", "btn_pause-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        settingBtn.x = settingBtn.width - 10;
        settingBtn.y = settingBtn.height/2 - 10;
        this.addChild(settingBtn);

        var self = this;
        settingBtn.addClickEventListener(function() {
            self._layer.addChild(new SettingDialog(), 999);
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
        this.addProgressLabel(goalBg, "0/" + numItems);
    },

    addClockImage: function(visible) {
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
        this.addCountDownClock();
    },

    addProgressLabel: function(object, text) {
        // cc.log("text: " + text);
        font =  "hud-font.fnt";

        var label = new cc.LabelBMFont(text, font);
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
            cc.log("david add Strar");
        }
    },

    addCountDownClock: function() {
        var self = this;
        var clockInitTime = GAME_CONFIG.levelTime;
        var clock = new Clock(clockInitTime, function(){
            self._layer.completedScene();
        });
        clock.x = this._clockImg.width / 2 + 10;
        clock.y = this._clockImg.height / 2;
        this._clockImg.addChild(clock, 99);

        this._clock = clock;
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
    }


});