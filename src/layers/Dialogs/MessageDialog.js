var MessageDialog = cc.LayerColor.extend({
	background: null,
	ctor: function(dialogImage) {
		this._super(cc.color(0, 0, 0, 127), cc.winSize.width, cc.winSize.height);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                return true;
            },
            onTouchMoved: function() {},
            onTouchEnded: function() {}
        }, this);
        if (!dialogImage)
            dialogImage = "#setting-dialog-bg.png";
        this.addBackground(dialogImage);
	},

	addBackground: function(dialogImage) {
		this.background = new cc.Sprite(dialogImage);
		this.background.x = cc.winSize.width / 2;
		this.background.y = cc.winSize.height / 2;
		this.addChild(this.background);
	},

	addComponent: function(node) {
		cc.log("js addChild");
		this.background.addChild(node);
	}
});