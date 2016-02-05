var input = input || {};

// this is needed because no matter that ID the touch can trigger the ccui.Button click event
input.SingleTouch = function () {
    this.enabled = false;
    var self = this;
    
    var blockEveryTouchOtherThanFirstOne = function (touch, event) {
        // blocks every touch other than the frist one
        if (self.enabled) {
            if (touch.getID () !== 0) {
                cc.log ("Swallow touch " + touch.getID ());
                return true;
            }
        }

        return false;
    };
    
    this.listener = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: blockEveryTouchOtherThanFirstOne,
        onTouchesMoved: blockEveryTouchOtherThanFirstOne,
        onTouchesEnded: blockEveryTouchOtherThanFirstOne,
        onTouchesCancelled: blockEveryTouchOtherThanFirstOne
    });
    
    cc.eventManager.addListener(this.listener, -1);
};

input.SingleTouch.prototype.setEnable = function (enable) {
    this.enabled = enable;
};

input.SingleTouch.instance = null;

input.SingleTouch.getInstance = function () {
    if (!input.SingleTouch.instance) {
        input.SingleTouch.instance = new input.SingleTouch ();
    }
    return input.SingleTouch.instance;
};

input.SingleTouch.setEnable = function (enable) {
    input.SingleTouch.getInstance().setEnable (enable);
};