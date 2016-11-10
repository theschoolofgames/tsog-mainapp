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

    ctor: function(removeHud) {
        this._super(cc.color(255, 255, 255, 255));
        this._names = [];
        this.data = null;

        this._removeHud = removeHud;

        Utils.showVersionLabel(this);
        // this.addQuickTestButton();
    },

    setData: function(data) {
        this.data = data;
        data = JSON.parse(data);
        cc.log("data TestLayer: " + JSON.stringify(data));
        for(var i = 0; i < data.length; i ++) {
            DataManager.getInstance().setDataAlpharacing(data[i]);
        }
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
        cc.log("this._hudNeeded: " + this._hudNeeded);
        this._addHudLayer();
    }, 

    onExit: function() {
        this._super();
        this._adiDog = null;
    },

    _addHudLayer: function(duration){
        cc.log("_addHudLayer: " + duration);
        var hudLayer = new HudLayer(this, false, duration);
        hudLayer.x = 0;
        hudLayer.y = 0;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
        // this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);
    },

    setStoryTimeForListeningData: function(data) {
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
    
    completedScene: function(){
        // if(!this._canVoildCompletedScene)
        //     return;
        // cc.log("_canVoildCompletedScene: "  + this._canVoildCompletedScene);
        this._canVoildCompletedScene = !this._canVoildCompletedScene
        this._moveToNextScene();
    },

    _moveToNextScene: function() {
        cc.log("TestLayer moveToNextScene");
        // if (this._isTestScene)
        //     cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255)));
        // else {
            var nextSceneName = SceneFlowController.getInstance().getNextSceneName();

            
            if (nextSceneName) {
                var numberScene = KVDatabase.getInstance().getInt("scene_number");
                var durationArray = JSON.parse(KVDatabase.getInstance().getString("durationsString"));
                cc.log("durationArray: " + JSON.stringify(durationArray));
                SceneFlowController.getInstance().moveToNextScene(nextSceneName, this.data, durationArray[numberScene]);
            }
            else {
                Utils.updateStepData();
                SceneFlowController.getInstance().clearData();
                cc.director.runScene(new MapScene());
            }
        // }


        // var scene;
        // if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
        //     scene = new window[nextSceneName](this._objectsArray, this._oldSceneName);
        // else
        //     scene = new window[nextSceneName]();
        // cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
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