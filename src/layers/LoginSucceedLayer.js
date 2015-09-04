var LoginSucceedLayer = cc.Layer.extend({

	ctor: function() {
		this._super();

		this.loadLoginSucceedImage();
	},

	loadLoginSucceedImage: function() {
		var succeedImage = new cc.Sprite(res.LoginSucceed_png);
		var scale = cc.winSize.width / succeedImage.width;
		succeedImage.setScale(scale);
		succeedImage.x = cc.winSize.width / 2;
		succeedImage.y = cc.winSize.height / 2;
		this.addChild(succeedImage);
	}
});

var LoginSucceedScene = cc.Scene.extend({
	ctor: function() {
		this._super();

		var loginSucceedLayer = new LoginSucceedLayer();
		this.addChild(loginSucceedLayer);
	}
});