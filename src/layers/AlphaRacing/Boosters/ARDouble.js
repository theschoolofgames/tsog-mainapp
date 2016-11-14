var ARDouble = ARBooster.extend({

    effectiveTime: 6, // second

    ctor: function(player) {
        this._super(player, "ar-boosters/double.png")
    },

    willStart: function() {

    },

    getBoostFlag: function() {
        return ARDouble.getBoostFlag();
    },

    didStart: function() {
        cc.log("ARDouble: didStart");
        
        this.visible = false;
        this._player.setBoostFlag(ARDouble.getBoostFlag());

        this.runAction(cc.sequence(
            cc.delayTime(this.effectiveTime),
            cc.callFunc(obj => {
                obj.setActive(false);
            })
        ));
    },

    willEnd: function() {

    },

    didEnded: function() {
        cc.log("ARDouble: didEnded");

        this._player.unsetBoostFlag(ARDouble.getBoostFlag());
        this.removeFromParent();
        ARBoosterWorker.getInstance().removeBooster(this);
    },

    onCollide: function() {
        if (!this.isActive()) {
            this._super();
            this.setActive(true);
        }
    }
});

ARDouble.getBoostFlag = function() {
    return ARBooster.State.DOUBLE;
}