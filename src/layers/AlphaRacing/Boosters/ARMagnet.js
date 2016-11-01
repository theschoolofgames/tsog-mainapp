var ARMagnet = ARBooster.extend({
    effectiveTime: 6, // second

    ctor: function(player) {
        this._super(player, "ar-boosters/magnet.png")
    },

    willStart: function() {

    },

    getBoostFlag: function() {
        return ARMagnet.getBoostFlag();
    },

    didStart: function() {
        cc.log("ARMagnet: didStart");
        this.visible = false;
        this._player.setBoostFlag(ARMagnet.getBoostFlag());
        this._player.opacity = 128;

        this.runAction(cc.sequence(
            cc.delayTime(this.effectiveTime/3),
            cc.callFunc(obj => {
                obj._player.runAction(cc.sequence(
                    cc.fadeTo(obj.effectiveTime/6, 255),
                    cc.fadeTo(obj.effectiveTime/6, 128),
                    cc.fadeTo(obj.effectiveTime/6, 255),
                    cc.fadeTo(obj.effectiveTime/6, 128),
                    cc.fadeTo(obj.effectiveTime/6, 255)
                ))
            }),
            cc.delayTime(this.effectiveTime/ 3 * 2),
            cc.callFunc(obj => {
                obj.setActive(false);
            })
        ))
    },

    willEnd: function() {

    },

    didEnded: function() {
        cc.log("ARMagnet: didEnded");
        this._player.unsetBoostFlag(ARMagnet.getBoostFlag());
        this.removeFromParent();
        ARBoosterWorker.getInstance().removeBooster(this);
    },

    onCollide: function() {
        if (!this.isActive())
            this.setActive(true);
    }
});

ARMagnet.getBoostFlag = function() {
    return ARBooster.State.MAGNET;
}