var TestLayer = cc.LayerColor.extend({

    _names: [],
    _touchCounting:0,
    _hudLayer:null,

    _adiDog: null,
    _isTestScene: false,
    data: null,

    ctor: function() {
        this._super(cc.color(255, 255, 255, 255));
        this._names = [];
        this.data = null;
        Utils.showVersionLabel(this);
        this.addQuickTestButton();
    },

    setData: function(data) {
        this.data = data;
    },

    addQuickTestButton: function() {
        if (!TSOG_DEBUG)
            return;
        var qtBtn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        qtBtn.x = cc.winSize.width - qtBtn.width;
        qtBtn.y = cc.winSize.height - qtBtn.height/2;
        this.addChild(qtBtn);
        qtBtn.addClickEventListener(this.callQuickTest.bind(this));

        var lbQuickTest = new cc.LabelBMFont("QUICK TEST", "yellow-font-export.fnt");
        lbQuickTest.scale = 0.3;
        lbQuickTest.x = qtBtn.width/2;
        lbQuickTest.y = qtBtn.height/2;
        qtBtn.getRendererNormal().addChild(lbQuickTest);
    },

    callQuickTest:function() {
        this._moveToNextScene();
    },

    onEnter: function() {
        this._super();
        this._addHudLayer();
    }, 

    onExit: function() {
        this._super();
        this._adiDog = null;
    },

    _addHudLayer: function(){
        var hudLayer = new HudLayer(this, false);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
        // this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);
    },

    _setIsTestScene: function(isTestScene) {
        this._isTestScene = isTestScene;
    },
    completedScene: function(){
        this._moveToNextScene();
    },

    _moveToNextScene: function() {
        if (this._isTestScene)
            cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255)));
        else {
            var nextSceneName = SceneFlowController.getInstance().getNextSceneName();

            cc.log("nextSceneName: " + nextSceneName); 
            if (nextSceneName)
                SceneFlowController.getInstance().moveToNextScene(nextSceneName, this.data);
            else {
                SceneFlowController.getInstance().clearData();
                cc.director.runScene(new MapScene());
            }
        }


        // var scene;
        // if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
        //     scene = new window[nextSceneName](this._objectsArray, this._oldSceneName);
        // else
        //     scene = new window[nextSceneName]();
        // cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    }
});