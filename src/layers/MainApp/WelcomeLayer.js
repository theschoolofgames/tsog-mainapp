var WelcomeLayer = cc.LayerColor.extend({

	ctor: function() {
		this._super(cc.color(255, 255, 255, 255));

        this.tag = 1;
		this.addWelcomeCutscene();
		this.moveToMainScene();

        SegmentHelper.track(SEGMENT.TALKING_ADI, null );

        Utils.showVersionLabel(this);
	},

    onEnter: function() {
        this._super();

        cc.audioEngine.setMusicVolume(1);
        cc.audioEngine.playMusic(res.welcome_sound_mp3);
    },

	addWelcomeCutscene: function() {
        var lwfSprite = cc.LWFSprite.create("welcome.lwf");
        lwfSprite.setAnchorPoint(cc.p(0.5, 0.5));
        lwfSprite.x = cc.winSize.width*0.5;
        lwfSprite.y = cc.winSize.height*0.5;
        // lwfSprite.scale = cc.winSize.width / lwfSprite.getContentSize().width;
        this.addChild(lwfSprite);
	},

	moveToMainScene: function() {

		this.runAction(cc.sequence(
			cc.delayTime(7.5),
			cc.callFunc(function() {
                cc.audioEngine.stopMusic();
                cc.director.replaceScene(new MainScene());
			})
		));
	}
});

var WelcomeScene = cc.Scene.extend({
	ctor: function() {
		this._super();

		var welcomelayer = new WelcomeLayer();
		this.addChild(welcomelayer);
	}
});