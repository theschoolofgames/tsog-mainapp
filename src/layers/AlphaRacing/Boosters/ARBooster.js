var ARBooster = cc.Sprite.extend({
    _player: null,
    _isActive: false,

    ctor: function(player, spriteName) {
        this._super("#" + spriteName);
        this._player = player;
    },

    setActive: function(active) {
        this._isActive = active;
        if (this._isActive) {
            this.willStart();
            this.start();
            this.didStart();
        }
        else {
            this.willEnd();
            this.end();
            this.didEnded();
        }
    },

    isActive: function() {
        return this._isActive;
    },

    start: function() {

    },

    willStart: function() {

    },

    didStart: function() {

    },

    end: function() {

    },

    willEnd: function() {

    },

    didEnded: function() {

    },

    update: function(dt) {
        if (cc.rectIntersectsRect(this._player.getCollisionBoundingBox(), this.getBoundingBox())) {
            this.onCollide();
        }
    },

    onCollide: function() {
        this.setActive(false);
    }
}); 

ARBooster.State = {
    NONE        : 0,
    INVISIBLE   : 1 << 0,
    MAGNET      : 1 << 1,
    DOUBLE      : 1 << 2
}