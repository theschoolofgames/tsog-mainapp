var ARStone = ARObstacle.extend({

    ctor: function(player) {
        this._super(player, "ar-obstacles/stone.png");
    },

    willStart: function() {
        // cc.log("ARStone: willStart");
    },

    didStart: function() {
        // cc.log("ARStone: didStart");
    },


    willEnd: function() {
        this._player.die();
    },

    didEnded: function() {
    },

    update: function(dt) {
        var bBox = this.getBoundingBox();
        var reducedBBox = cc.rect(bBox.x + bBox.width/4, bBox.y - bBox.height/4, bBox.width/2, bBox.height/2);

        if (!this._player.hasBoostFlag(ARInvisible.getBoostFlag()) && cc.rectIntersectsRect(this._player.getBoundingBox(), reducedBBox)) {
            // cc.log("reducedBBox -> " + JSON.stringify(reducedBBox));
            // cc.log("this.getBoundingBox() -> " + JSON.stringify(this.getBoundingBox()));
            // cc.log("this._player.getBoundingBox() -> " + JSON.stringify(this._player.getBoundingBox()));
            this.onCollide();
        }
    },  
})