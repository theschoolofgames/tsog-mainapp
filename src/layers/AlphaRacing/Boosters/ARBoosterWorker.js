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
        var object = new ARMagnet(this._player);
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

    findBooster: function(flag, isActive) {
        let boosters = this._boosters.filter(b => b.getBoostFlag() == flag);

        if (isActive != undefined) {
            boosters = boosters.filter(b => b.isActive() == isActive);
        }

        return boosters;
    },

    removeAll: function() {
        this._boosters.forEach(obj => obj.removeFromParent());
        this._boosters = [];
    },

    update: function(dt) {
        var self = this;

        var updateTimes = Math.round(dt / this._deltaTime);

        this._boosters.forEach((ob, idx) => {
            for (var i = 0; i < updateTimes; i++) {
                if (!ob.isActive() && ob.x < this._player.x - cc.winSize.width / 2) {
                    ob.removeFromParent();
                    self._boosters.splice(idx, 1);
                    return;
                }

                ob.fixUpdate();
            }

            ob.update(dt);
        })
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