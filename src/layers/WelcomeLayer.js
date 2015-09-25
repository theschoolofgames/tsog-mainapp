var WelcomeLayer = cc.LayerColor.extend({

	ctor: function() {
		this._super(cc.color(255, 255, 255, 255));

		this.addWelcomeCutscene();
		this.moveToMainScene();

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
			cc.delayTime(5.5),
			cc.callFunc(function() {
                cc.director.runScene(new cc.TransitionFade(1, new GameSelectorScene(), cc.color(255, 255, 255, 255)));
			}, this)
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