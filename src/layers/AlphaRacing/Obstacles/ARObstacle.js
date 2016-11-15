var ARObstacle = cc.Sprite.extend({
    _player: null,
    _isActive: false,
    _isDead: false,

    ctor: function(player, spriteName) {
        this._super("#" + spriteName);
        this._player = player;
    },

    isDead: function() {
        return this._isDead;
    },

    setIsDead: function(d) {
        this._isDead = d;
    },

    setActive: function(active) {
        if (this._isDead || this._isActive == active)
            return;

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
        this._isDead = true;
    },

    willEnd: function() {

    },

    didEnded: function() {

    },

    fixUpdate: function() {

    },

    update: function(dt) {
        if (!this._player.hasBoostFlag(ARInvisible.getBoostFlag()) && cc.rectIntersectsRect(this._player.getCollisionBoundingBox(), this.getBoundingBox())) {
            this.onCollide();
        }
    },

    onCollide: function() {
        this.setActive(false);
    }
})