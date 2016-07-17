var MessageDialog = cc.LayerColor.extend({
	background: null,
	ctor: function() {
		this._super(cc.color(0, 0, 0, 127), cc.winSize.width, cc.winSize.height);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() {
                return true;
            },
            onTouchMoved: function() {},
            onTouchEnded: function() {}
        }, this);

        this.addBackground();
	},

	addBackground: function() {
		this.background = new cc.Sprite("#setting-dialog-bg.png");
		this.background.x = cc.winSize.width / 2;
		this.background.y = cc.winSize.height / 2;
		this.addChild(this.background);
	},

	addComponent: function(node) {
		cc.log("js addChild");
		this.background.addChild(node);
	}
});