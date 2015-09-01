var MainScreenLayer = cc.Layer.extend({
    accLayer: null,
    schLayer: null,
    loginLayer: null,
    signUpLayer: null,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Account_plist);

        this.schLayer = new SchoolSelectorLayer();

        this.addChild(this.schLayer);
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