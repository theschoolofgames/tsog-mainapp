var AREffectLayer = cc.Layer.extend({

    ctor: function() {
        this._super();

        // var sign = new cc.Sprite("#warning-sign.png");
        // sign.x = cc.winSize.width/2;
        // sign.y = cc.winSize.height/2;
        // this.addChild(sign);
    },

    onEnter: function() {
        this._super();

        this._eventFireballWarning = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: EVENT_AR_FIREBALL_ACTIVE,
            callback: this.showFireballWarning.bind(this)
        });
        cc.eventManager.addListener(this._eventFireballWarning, 1);
    },

    onExit: function() {
        cc.eventManager.removeListener(this._eventFireballWarning);

        this._super();
    },

    showFireballWarning: function(event) {
        var yPos = event.getUserData().y;
        var time = event.getUserData().time;

        var sign = new cc.Sprite("#ar-obstacles/warning-sign-1.png");
        sign.x = cc.winSize.width - 50;
        sign.y = yPos;
        Utils.runAnimation(sign, "ar-obstacles/warning-sign", 0.05, 7, true, 0.05);
        this.addChild(sign);

        sign.runAction(cc.sequence(
            cc.delayTime(time),
            cc.callFunc(obj => obj.removeFromParent())
        ));
    }
})