var MainScreenLayer = cc.Layer.extend({
    accList: null,
    schList: null,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        this.addBackground();
        this.accList = new AccountSelectorLayer();
        this.schList = new SchoolSelectorLayer();
        this.addChild(this.schList);
    },

    addBackground: function() {
        var bg = new cc.Sprite(res.Bg_png);
        bg.setScaleX(cc.winSize.width / bg.width);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    addNewLayer: function(oldLayer, newLayer){
        oldLayer.removeFromParent();
        this.addChild(newLayer);
    }
});

var MainScreen = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});