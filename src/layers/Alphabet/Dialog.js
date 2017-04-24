var Dialog = cc.LayerColor.extend({
    _csf: 1,

    touchBlocked: false,
    background: null,

    currentDialog: null,

    ctor: function() {
        this._super(cc.color(0, 0, 0, 200));
        this._csf = cc.director.getContentScaleFactor();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);

        Dialog.setCurrentDialog(this);
    },

    onEnter: function() {
        this._super();
        
        this.animateIn();
    },

    animateIn: function() {
        this.runAction(cc.fadeTo(0.1, 150));

        var self = this;
        this.background.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeTo(0.25, 255),
                    cc.sequence(
                        cc.scaleTo(0.2, 1.05),
                        cc.scaleTo(0.135, 0.95),
                        cc.scaleTo(0.05, 1.0)
                    )
                )
            )
        );
        
        Dialog.currentDialog = this;

        if (this._showCurrencyHud) {
            this._addCurrencyHud();
        }
    },

    close: function() {
        this.touchBlocked = true;
        AudioManager.getInstance().play(res.ui_close_mp3, false, null);
        this.animateOut();
        Dialog.setCurrentDialog(null);
    },

    animateOut:function() {
        this.runAction(cc.sequence(cc.delayTime(0.3), 
                            cc.fadeTo(0.2, 0),
                            cc.delayTime(0),
                            cc.callFunc(function(){this.removeFromParent();}.bind(this))
                        ));

        this.background.runAction(cc.sequence(    
            cc.spawn(
                cc.scaleTo(0.5, 0.7).easing(cc.easeBackIn(0.8)),
                cc.sequence(
                    cc.delayTime(0.3),
                    cc.fadeTo(0.2, 0)
                )
            ),
            cc.callFunc(function() {
                this.background.removeFromParent();
            }, this)
        ));
    },


});

Dialog._currentDialog = null;

Dialog.setCurrentDialog = function(dialog) {
    Dialog._currentDialog = dialog;
};

Dialog.getCurrentDialog = function() {
    return Dialog._currentDialog;
};