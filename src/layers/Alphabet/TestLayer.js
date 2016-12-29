var TestLayer = cc.LayerColor.extend({

    _names: [],
    _touchCounting:0,
    _hudLayer:null,

    _adiDog: null,
    _isTestScene: false,
    data: null,
    _canVoildCompletedScene: true,
    _removeHud: false,

    // storytime case for Listenting test
    _storytimeDataForListening: null,
    _storytimeDataForSpeaking: null,
    _timesUp: false,
    storytimeCurrentDataIndex: -1,

    _callingQuickTest: false,
    _soundEffect: null,

    _ended: false,

    ctor: function(removeHud) {
        this._super(cc.color(255, 255, 255, 255));
        this._names = [];
        this.data = null;

        this._removeHud = removeHud;
        
        // Utils.showVersionLabel(this);
        // this.addQuickTestButton();
    },
    _fetchObjectData: function() {

    },
    // TODO: recheck type of this.data
    setData: function(data) {
        this.data = data;

        if(data instanceof String)
            data = JSON.parse(data);

        // cc.log("data TestLayer: " + JSON.stringify(data));
        for(var i = 0; i < data.length; i ++) {
            DataManager.getInstance().setDataAlpharacing(data[i]);
        }
    },

    playBeginSound: function(path, callback) {
        this._soundEffect = AudioManager.getInstance().play(path, false, callback);
    },

    playBackGroundMusic: function() {
        if (cc.audioEngine.isMusicPlaying())
            cc.audioEngine.stopMusic();    
        cc.audioEngine.playMusic(res.level_mp3);
    },

    playWinSound: function(callback) {
        AudioManager.getInstance().play(res.you_win_mp3, false, callback);
    },

    addQuickTestButton: function() {
        if (!TSOG_DEBUG)
            return;
        var qtBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        qtBtn.x = cc.winSize.width - qtBtn.width;
        qtBtn.y = cc.winSize.height - qtBtn.height/2;
        this.addChild(qtBtn, 9999);
        qtBtn.addClickEventListener(this.callQuickTest.bind(this));

        var lbQuickTest = new cc.LabelBMFont("QUICK TEST", "yellow-font-export.fnt");
        lbQuickTest.scale = 0.3;
        lbQuickTest.x = qtBtn.width/2;
        lbQuickTest.y = qtBtn.height/2;
        qtBtn.getRendererNormal().addChild(lbQuickTest);
    },

    callQuickTest:function() {
        if (this._callingQuickTest)
            return;

        this._callingQuickTest = true
        this._timesUp = true;
        cc.audioEngine.stopMusic();
        this._moveToNextScene();
    },

    onEnter: function() {
        this._super();

        this.storytimeCurrentDataIndex = -1;

        if (this._removeHud)
            return;

        this._addHudLayer();

        var self = this;
        this._eventTimeUp1 = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "event_logout",
            callback: function(event){
                self.removeCardGameData();
                // cc.log("_timesUp evnet: " + self._timesUp);
            }
        });
        cc.eventManager.addListener(self._eventTimeUp1, 1);
    }, 

    onExit: function() {
        this._adiDog = null;
        cc.eventManager.removeListener(this._eventTimeUp1);
        if (cc.audioEngine.isMusicPlaying())
            cc.audioEngine.stopMusic();

        this._super();
    },

    _addHudLayer: function(duration){

        cc.log("testlayer _addHudLayer: " + duration);
        var hudLayer = new HudLayer(this, false, duration);
        hudLayer.x = 0;
        hudLayer.y = 0;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
        // this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);
    },

    setStoryTimeForListeningData: function(data) {
        cc.log("setStoryTimeForListeningData");
        KVDatabase.getInstance().set("storytimeForListeningData", JSON.stringify(data));
    },

    getStoryTimeForListeningData: function() {
        var d = KVDatabase.getInstance().getString("storytimeForListeningData", null);
        if (d)
            d = JSON.parse(d);
        return d;
    },

    removeStoryTimeForListeningData: function() {
        KVDatabase.getInstance().remove("storytimeForListeningData");
    },

    setCardGameData: function(data) {
        cc.log("setCardGameData: " + JSON.stringify(data));
        KVDatabase.getInstance().set("CardGameData", JSON.stringify(data));
    },

    getCardGameData: function() {
        var d = KVDatabase.getInstance().getString("CardGameData", null);
        if (d)
            d = JSON.parse(d);
        return d;
    },

    removeCardGameData: function() {
        cc.log("removeCardGameData: ");
        KVDatabase.getInstance().remove("CardGameData");
    },

    setStoryTimeForSpeakingData: function(data) {
        KVDatabase.getInstance().set("storytimeForSpeakingData", JSON.stringify(data));
    },

    getStoryTimeForSpeakingData: function() {
        var d = KVDatabase.getInstance().getString("storytimeForSpeakingData", null);
        if (d)
            d = JSON.parse(d);
        return d;
    },

    removeStoryTimeForSpeakingData: function() {
        KVDatabase.getInstance().remove("storytimeForSpeakingData");
    },

    _setIsTestScene: function(isTestScene) {
        this._isTestScene = isTestScene;
    },

    createWinLabel: function() {
        var lbText = localizeForWriting("you win");

        var randSchoolIdx = Math.floor(Math.random() * 4);
        var font = FONT_COLOR[randSchoolIdx];

        lbText = lbText.toUpperCase();
        var winLabel = new cc.LabelBMFont(lbText, font);
        var scaleTo = 1.5;
        winLabel.setScale(scaleTo);

        winLabel.x = cc.winSize.width / 2;
        winLabel.y = cc.winSize.height / 2;
        this.addChild(winLabel, 10000);

        winLabel.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(winLabel, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }), 
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5))
        ));

        return winLabel;
    },
    
    doCompletedScene: function(){
        this._ended = true;
        // if(!this._canVoildCompletedScene)
        //     return;
        // cc.log("_canVoildCompletedScene: "  + this._canVoildCompletedScene);
        // this._canVoildCompletedScene = !this._canVoildCompletedScene
        this.playWinSound();
        var winLabel = this.createWinLabel();

        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function() {
                    if (winLabel)
                        winLabel.removeFromParent();
                    self._moveToNextScene();
                })
            )
        )
    },

    _moveToNextScene: function() {
        // cc.log("TestLayer moveToNextScene");
    
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();

        if (nextSceneName) {
            this.setCardGameData(this.getCardGameData());
            var numberScene = KVDatabase.getInstance().getInt("scene_number");
            var durationArray = JSON.parse(KVDatabase.getInstance().getString("durationsString"));
            // cc.log("durationArray: " + JSON.stringify(durationArray));
            var sceneData = SceneFlowController.getInstance().getNextSceneData();
            cc.log("sceneData: " + JSON.stringify(sceneData));
            SceneFlowController.getInstance().moveToNextScene(nextSceneName, sceneData, durationArray[numberScene]);
        } else {
            this.removeCardGameData();
            Utils.updateStepData();
            SceneFlowController.getInstance().clearData();
            cc.director.runScene(new MapScene());
        }
    },

    popGold: function(from) {
        this._hudLayer.popGold(1, from.x, from.y);
    },

    setHUDProgressBarPercentage: function(percent) {
        this._hudProgressBarPercentage = percent;
    },

    setHUDCurrentGoals: function(currentGoals) {
        this._hudCurrentGoals = currentGoals;
    },

    updateProgressBar: function() {
        this._hudLayer.setCurrentGoals(this._hudCurrentGoals);
        this._hudLayer.updateTotalGoalsLabel();
        this._hudLayer.setProgressBarPercentage(this._hudProgressBarPercentage);
    },
});