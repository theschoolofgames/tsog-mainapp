var MainScreenLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.School_plist);

        var schList = new SchoolSelectorLayer();
        this.addChild(schList);
    }
});

var MainScreen = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});