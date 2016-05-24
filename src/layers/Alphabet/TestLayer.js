var TestLayer = cc.LayerColor.extend({

    _names: [],
    _touchCounting:0,
    _hudLayer:null,

    _adiDog: null,

    ctor: function() {
        this._super(cc.color(255, 255, 255, 255));
        Utils.showVersionLabel(this);
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
        var hudLayer = new HudLayer(this, true);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
        this._hudLayer.setProgressLabelStr(this._touchCounting, this._names.length);
    },

    _moveToNextScene: function() {
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        var scene;
        if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
            scene = new window[nextSceneName](this._objectsArray, this._oldSceneName);
        else
            scene = new window[nextSceneName]();
        cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    }
});