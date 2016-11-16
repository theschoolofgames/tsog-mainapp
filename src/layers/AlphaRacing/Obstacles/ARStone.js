var ARStone = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "ar-obstacles/stone.png");
    },

    willStart: function() {
        cc.log("ARStone: willStart");
    },

    didStart: function() {
        cc.log("ARStone: didStart");
    },


    willEnd: function() {
        this._player.reduceHP();
    },

    didEnded: function() {
    },

    // update: function(dt) {

    // },
})