var MainScreenLayer = cc.Layer.extend({
    accLayer: null,
    schLayer: null,
    loginLayer: null,
    signUpLayer: null,
    _isLoggedIn: 0,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.School_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Account_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Game_plist);
        cc.spriteFrameCache.addSpriteFrames(res.Loading_plist);

        this._isLoggedIn = parseInt(cc.sys.localStorage.getItem("isLoggedIn")) || 0;
        /*
            this._isLoggedIn = 0 is not logged in,
            1 is logged in
        */
        cc.log("isLoggedIn " + this._isLoggedIn);
        if (this._isLoggedIn == 0 ) {
            this.schLayer = new SchoolSelectorLayer();
            this.addChild(this.schLayer);
        } else {
            cc.log("move to welcome");
            this.runAction(
                cc.sequence(
                    cc.delayTime(0),
                    cc.callFunc(function() {
                        cc.director.replaceScene(new WelcomeScene());
                    })
                ))
        }

    }
});

var MainScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});