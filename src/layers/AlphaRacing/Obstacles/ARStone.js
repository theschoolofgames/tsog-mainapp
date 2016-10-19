var ARStone = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "stone.png");
    },

    start: function() {

    },

    willStart: function() {
        cc.log("ARStone: willStart");
    },

    didStart: function() {
        cc.log("ARStone: didStart");
    },

    end: function() {
        ARObstacleWorker.getInstance().removeObstacle(this);
        this.removeFromParent();

        this._player.reduceHealth();
    },

    willEnd: function() {
        cc.log("ARStone: willEnd");
    },

    didEnded: function() {
        cc.log("ARStone: didEnded");
    },

    // update: function(dt) {

    // },
})