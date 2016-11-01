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
        this._player.sprite.opacity = 128;

        this.runAction(cc.sequence(
            cc.delayTime(this.effectiveTime/3),
            cc.callFunc(obj => {
                let sequence = [];
                let loopTimes = Math.ceil(obj.effectiveTime/3 * 2 / 0.5);
                for (var i = 0; i < loopTimes; i++) {
                    sequence.push(cc.fadeTo(0.25, 255));
                    sequence.push(cc.fadeTo(0.25, 128));
                }
                sequence.push(cc.fadeTo(0.25, 255   ));

                obj._player.sprite.runAction(cc.sequence(sequence))
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
        if (!this.isActive()) {
            this.setActive(true);
        }
    }
});

ARInvisible.getBoostFlag = function() {
    return ARBooster.State.INVISIBLE;
}