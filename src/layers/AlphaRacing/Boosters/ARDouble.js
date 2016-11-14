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
        this._player.setBoostFlag(ARInvisible.getBoostFlag());
    },

    willEnd: function() {

    },

    didEnded: function() {
        cc.log("ARDouble: didEnded");

        this._player.unsetBoostFlag(ARInvisible.getBoostFlag());
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