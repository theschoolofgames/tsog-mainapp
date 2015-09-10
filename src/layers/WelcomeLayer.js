var WelcomeLayer = cc.LayerColor.extend({

	ctor: function() {
		this._super(cc.color(255, 255, 255, 255));

		this.addWelcomeCutscene();
		this.moveToMainScene();
	},

	addWelcomeCutscene: function() {
		
        var lwfSprite = lwf.Sprite.create("welcome.lwf");
        lwfSprite.setAnchorPoint(cc.p(0.5, 0.5));
        lwfSprite.x = cc.winSize.width*0.5;
        lwfSprite.y = cc.winSize.height*0.5;
        lwfSprite.scale = cc.winSize.width / lwfSprite.getContentSize().width;
        this.addChild(lwfSprite);
	},

	moveToMainScene: function() {

		this.runAction(cc.sequence(
			cc.delayTime(4),
			cc.callFunc(function() {
				cc.director.replaceScene(new GameSelectorScene());
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