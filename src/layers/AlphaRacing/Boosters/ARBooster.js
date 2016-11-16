var ARBooster = cc.Sprite.extend({
    _player: null,
    _worker: null,
    _isActive: false,
    _isDead: false,

    ctor: function(worker, player, spriteName) {
        this._super("#" + spriteName);
        this._player = player;
        this._worker = worker;
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
        this._player.setBoostFlag(this.getBoostFlag());
    },

    end: function() {
        this._isDead = true;
    },

    fixUpdate: function() {

    },

    update: function(dt) {
        if (cc.rectIntersectsRect(this._player.getCollisionBoundingBox(), this.getBoundingBox())) {
            this.onCollide();
        }
    },

    onCollide: function() {
        if (this._player.hasBoostFlag(this.getBoostFlag())) {
            let boosters = this._worker.findBooster(this.getBoostFlag(), true);
            // cc.log(boosters.length);
            boosters.forEach(b => b.setActive(false));
        }
    },

    willStart: function() {},

    didStart: function() {},

    willEnd: function() {},

    didEnded: function() {},
}); 

ARBooster.State = {
    NONE        : 0,
    INVISIBLE   : 1 << 0,
    MAGNET      : 1 << 1,
    DOUBLE      : 1 << 2
}