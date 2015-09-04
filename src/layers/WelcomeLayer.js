var WelcomeLayer = cc.Layer.extend({

	ctor: function() {
		this._super();

		this.loadWelcomeLayerImage();
		this.moveToMainScene();
	},

	loadWelcomeLayerImage: function() {
		var WelcomeImage = new cc.Sprite(res.Welcome_jpg);
		var scale = cc.winSize.width / WelcomeImage.width;
		WelcomeImage.setScale(scale);
		WelcomeImage.x = cc.winSize.width / 2;
		WelcomeImage.y = cc.winSize.height / 2;
		this.addChild(WelcomeImage);
	},

	moveToMainScene: function() {

		this.runAction(cc.sequence(
			cc.delayTime(1),
			cc.callFunc(function() {
				// cc.director.runScene(new MainScene());
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