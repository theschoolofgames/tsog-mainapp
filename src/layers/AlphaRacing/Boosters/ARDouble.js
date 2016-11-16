var ARDouble = ARBooster.extend({

    effectiveTime: 6, // second

    ctor: function(worker, player) {
        this._super(worker, player, "ar-boosters/double.png")
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