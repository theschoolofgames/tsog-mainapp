var AREffectLayer = cc.Layer.extend({

    _updateYObjects: [],

    ctor: function() {
        this._super();

        this._updateYObjects = [];

        this.scheduleUpdate();
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

    update: function(dt) {
        var cameraPos = cc.Camera.getDefaultCamera().getPosition();

        this._updateYObjects.forEach(obj => {
            var userData = obj.getUserData();
            if (userData) {
                if (userData.yPos) {
                    obj.y = userData.yPos - cameraPos.y + cc.winSize.height/2;
                }
            }
        })
    },

    showFireballWarning: function(event) {
        var yPos = event.getUserData().y;
        var time = event.getUserData().time;

        var sign = new cc.Sprite("#ar-obstacles/warning-sign-1.png");
        sign.x = cc.winSize.width - 50;
        sign.y = yPos;
        sign.setUserData({
            yPos: yPos
        })
        Utils.runAnimation(sign, "ar-obstacles/warning-sign", 0.05, 7, true, 0.05);
        this.addChild(sign);

        this._updateYObjects.push(sign);

        var self = this;

        sign.runAction(cc.sequence(
            cc.delayTime(time),
            cc.callFunc(obj => {
                self._updateYObjects.splice(self._updateYObjects.indexOf(obj), 1);
                obj.removeFromParent()
            })
        ));
    }
})