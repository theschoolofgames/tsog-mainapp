var ARDouble = ARBooster.extend({

    effectiveTime: 6, // second

    ctor: function(worker, player) {
        this._super(worker, player, "ar-boosters/double-1.png");
        cc.log(this instanceof cc.Sprite);
        // this.setSpriteFrame("ar-boosters/double-3.png")
        Utils.runAnimation(this, "ar-boosters/double", 0.03, 9, true, 0.03);
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