var MainScreenLayer = cc.Layer.extend({
    accLayer: null,
    schLayer: null,
    loginLayer: null,
    signUpLayer: null,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        this.addBackground();
        this.schLayer = new SchoolSelectorLayer();

        this.addChild(this.schLayer);
    },

    addBackground: function() {
        var bg = new cc.Sprite("#background.png");
        var scale = cc.winSize.width / bg.width;
        bg.setScaleX(scale);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    addNewLayer: function(oldLayer, newLayer, arg){
        oldLayer.removeFromParent();

        var layer;
        switch(newLayer){
            case "accLayer":
                layer = new AccountSelectorLayer(arg);
                this.accLayer = layer;
                break;
            case "schLayer":
                layer = new SchoolSelectorLayer(arg);
                this.schLayer = layer;
                break;
            case "loginLayer":
                layer = new LoginLayer(arg);
                this.loginLayer = layer;
                break;
            case "signUpLayer":
                layer = new SignUpLayer();
                this.signUpLayer = layer;
                break;
        }

        this.addChild(layer);
    }
});

var MainScreen = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});