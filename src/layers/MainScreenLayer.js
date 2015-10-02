var MainScreenLayer = cc.Layer.extend({
    schLayer: null,
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
        var self = this;
        if (this._isLoggedIn == 0 ) {
            this.runAction(
                cc.sequence(
                    cc.delayTime(0),
                    cc.callFunc(function() {
                        cc.director.replaceScene(new SchoolSelectorScene());
                        self.playBackgroundMusic();
                    })
                ))
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

    },

    playBackgroundMusic: function() {
        if (cc.audioEngine.isMusicPlaying())
            return
        // play background music
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
    },
});

var MainScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});