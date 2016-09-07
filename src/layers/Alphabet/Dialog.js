var Dialog = cc.LayerColor.extend({
    _csf: 1,

    ctor: function() {
        this._super(cc.color(0, 0, 0, 200));

        this._csf = cc.director.getContentScaleFactor();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);
    },

    animateIn: function() {},
    animateOut: function() {},
});