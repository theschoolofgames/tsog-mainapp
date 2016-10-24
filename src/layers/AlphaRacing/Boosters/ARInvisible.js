var ARInvisible = ARBooster.extend({

    effectiveTime: 6, // second

    ctor: function(player) {
        this._super(player, "ar-boosters/invisible.png")
    },

    willStart: function() {

    },

    getBoostFlag: function() {
        return ARInvisible.getBoostFlag();
    },

    didStart: function() {
        cc.log("ARInvisible: didStart");
        this.visible = false;
        this._player.setBoostFlag(ARInvisible.getBoostFlag());
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
        cc.log("ARInvisible: didEnded");
        this._player.unsetBoostFlag(ARInvisible.getBoostFlag());
        this.removeFromParent();
        ARBoosterWorker.getInstance().removeBooster(this);
    },

    onCollide: function() {
        if (!this.isActive())
            this.setActive(true);
    }
});

ARInvisible.getBoostFlag = function() {
    return ARBooster.State.INVISIBLE;
}