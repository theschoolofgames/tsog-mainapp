var ARBeeHive = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "beehive.png");
    },

    start: function() {

    },

    willStart: function() {
        cc.log("ARBeeHive: willStart");
    },

    didStart: function() {
        cc.log("ARBeeHive: didStart");
    },

    end: function() {
        ARObstacleWorker.getInstance().removeObstacle(this);
        this.removeFromParent();

        this._player.reduceHealth();
    },

    willEnd: function() {
        cc.log("ARBeeHive: willEnd");
    },

    didEnded: function() {
        cc.log("ARBeeHive: didEnded");
    },

    // update: function(dt) {

    // },
})