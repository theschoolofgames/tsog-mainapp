var ARBeeHive = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "ar-obstacles/beehive.png");
    },

    willStart: function() {

    },

    didStart: function() {

    },

    willEnd: function() {
        this._player.reduceHealth();
    },

    didEnded: function() {
    },

    // update: function(dt) {

    // },
})