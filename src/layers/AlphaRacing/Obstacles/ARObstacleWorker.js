var ARObstacleWorker = cc.Class.extend({
    _obstacles: [],
    _player: null,

    ctor: function() {

    },

    setPlayer: function(player) {
        this._player = player;
    },

    addObstacle: function(params) {
        var object = new ARBeeHive(this._player);
        // object.setScale(0.8);
        object.x = params.x;
        object.y = params.y;
        object.setActive(true);

        this._obstacles.push(object);

        return object;
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