var ARMagnet = ARBooster.extend({
    effectiveTime: 6, // second

    ctor: function(worker, player) {
        this._super(worker, player, "ar-boosters/magnet-1.png");
        Utils.runAnimation(this, "ar-boosters/magnet", 0.05, 10, true, 0.05);
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

        this.runAction(cc.sequence(
            cc.delayTime(this.effectiveTime),
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
    },

    onCollide: function() {
        if (!this.isActive())
            this.setActive(true);
    }
});

ARMagnet.getBoostFlag = function() {
    return ARBooster.State.MAGNET;
}