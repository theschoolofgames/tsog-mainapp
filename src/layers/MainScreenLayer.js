var MainScreenLayer = cc.Layer.extend({
    accLayer: null,
    schLayer: null,
    loginLayer: null,
    signUpLayer: null,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Account_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Game_plist);

        this.schLayer = new SchoolSelectorLayer();
        // this.schLayer = new GameSelectorLayer();

        this.addChild(this.schLayer);
    }
});

var MainScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});