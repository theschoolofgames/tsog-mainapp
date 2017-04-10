var ARBeeHive = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "ar-obstacles/beehive-1.png");
        Utils.runAnimation(this, "ar-obstacles/beehive", 0.05, 15, true, 0.05);
    },

    willStart: function() {

    },

    didStart: function() {

    },

    willEnd: function() {
        this._player.die();
    },

    didEnded: function() {
    },

    // update: function(dt) {

    // },
})