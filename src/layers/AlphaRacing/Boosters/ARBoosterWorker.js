var ARBoosterWorker = cc.Class.extend({
    _boosters: [],
    _player: null,

    _deltaTime: 1 / 60,

    ctor: function() {

    },

    setPlayer: function(player) {
        this._player = player;
    },

    addBooster: function(params) {
        var object = new ARInvisible(this._player);
        // object.setScale(0.8);
        object.x = params.x;
        object.y = params.y;

        this._boosters.push(object);

        return object;
    },

    removeBooster: function(booster) {
        var idx = this._boosters.indexOf(booster);
        if (idx >= 0)
            this._boosters.splice(idx, 1);
    },

    removeAll: function() {
        this._boosters.forEach(obj => obj.removeFromParent());
        this._boosters = [];
    },

    update: function(dt) {
        var self = this;

        var updateTimes = Math.round(dt / this._deltaTime);

        for (var i = 0; i < updateTimes; i++) {
            this._boosters.forEach((ob, idx) => {
                if (!ob.isActive() && ob.x < this._player.x - cc.winSize.width / 2) {
                    ob.removeFromParent();
                    self._boosters.splice(idx, 1);
                    return;
                }

                ob.update(dt);
            })
        }
    }
})

ARBoosterWorker._instance = null;

ARBoosterWorker.getInstance = function () {
    return ARBoosterWorker._instance || ARBoosterWorker.setupInstance();
};

ARBoosterWorker.setupInstance = function () {
    ARBoosterWorker._instance = new ARBoosterWorker();
    return ARBoosterWorker._instance;
};