var ARObstacleWorker = cc.Class.extend({
    _obstacles: [],

    ctor: function() {

    },

    addObstacle: function(obstacle) {
        this._obstacles.push(obstacle);
    },

    removeObstacle: function(obstacle) {
        var idx = this._obstacles.indexOf(obstacle);
        if (idx >= 0)
            this._obstacles.splice(idx, 1);
    },

    update: function(dt) {
        this._obstacles.forEach(function(ob) {
            ob.update(dt);
        })
    }
})

ARObstacleWorker._instance = null;

ARObstacleWorker.getInstance = function () {
    return ARObstacleWorker._instance || ARObstacleWorker.setupInstance();
};

ARObstacleWorker.setupInstance = function () {
    ARObstacleWorker._instance = new ARObstacleWorker();
    return ARObstacleWorker._instance;
};