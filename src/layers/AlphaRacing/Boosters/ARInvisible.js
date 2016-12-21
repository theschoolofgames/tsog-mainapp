var ARInvisible = ARBooster.extend({

    effectiveTime: 6, // second

    ctor: function(worker, player) {
        this._super(worker, player, "ar-boosters/invisible-1.png");
        Utils.runAnimation(this, "ar-boosters/invisible", 0.05, 13, true, 0.05);
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

        let sequence = [];
        sequence.push(cc.delayTime(this.effectiveTime/3 * 2));

        let loopTimes = Math.ceil(this.effectiveTime/3 / 0.5);
        for (var i = 0; i < loopTimes; i++) {
            sequence.push(cc.fadeOut(0.25));
            sequence.push(cc.fadeIn(0.25));
        }
        sequence.push(cc.fadeIn(0));
        let action = cc.sequence(sequence);
        action.tag = this.getBoostFlag();

        this._player.runAction(action);

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
        cc.log("ARInvisible: didEnded");

        this._player.opacity = 255;
        this._player.stopActionByTag(this.getBoostFlag());

        this._player.unsetBoostFlag(ARInvisible.getBoostFlag());
    },

    onCollide: function() {
        if (!this.isActive()) {
            this._super();
            this.setActive(true);
        }
    }
});

ARInvisible.getBoostFlag = function() {
    return ARBooster.State.INVISIBLE;
}