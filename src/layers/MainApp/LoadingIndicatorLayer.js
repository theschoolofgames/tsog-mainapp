var LoadingIndicatorLayer = cc.LayerColor.extend({
    _indicator: null,

    ctor: function(block) {
        if (block)
            this._super(cc.color(0, 0, 0, 120));
        else
            this._super(cc.color(0, 0, 0, 0));

        this.tag = TAG_LOADING_INDICATOR_LAYER;

        this._indicator = new cc.Sprite("res/SD/loading_indicator.png");
        this._indicator.x = cc.winSize.width/2;
        this._indicator.y = cc.winSize.height/2;
        this.addChild(this._indicator);

        this._indicator.runAction(cc.rotateBy(0.5, 359).repeatForever());

        if (block)
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) { return true; },
                onTouchMoved: function(touch, event) { },
                onTouchEnded: function(touch, event) { },
                onTouchCancelled: function(touch, event) { }
            }, this);   
    },

    setIndicactorPosition: function(x, y) {
        if (y == undefined) {
            y = x.y;
            x = x.x;
        }

        this._indicator.x = x;
        this._indicator.y = y;
    }
});