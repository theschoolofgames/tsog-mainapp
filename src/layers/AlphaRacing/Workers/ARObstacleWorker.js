var ARObstacleWorker = cc.Class.extend({
    _obstacles: [],
    _player: null,

    _deltaTime: 1 / 60,

    ctor: function(player) {
        ARObstacleWorker._instance = this;
        this._player = player;

        this._obstacles = [];
    },

    addObstacle: function(params) {
        if (params.type == "hanging") {
            var object = new ARBeeHive(this._player);
        } else if (params.type == "standing") {
            var object = new ARStone(this._player);
        } else if (params.type == "flying") {
            var object = new ARFire(this._player);
        }
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

    removeAll: function() {
        this._obstacles.forEach(obj => obj.removeFromParent());
        this._obstacles = [];
    },

    update: function(dt) {
        var updateTimes = Math.round(dt / this._deltaTime);

        for (var i = 0; i < updateTimes; i++) {
            this._obstacles.forEach(function(ob) {
                if (ob.isActive())
                    ob.update(dt);
            })
        }
    }
})

ARObstacleWorker._instance = null;

ARObstacleWorker.getInstance = function () {
  return ARObstacleWorker._instance || ARObstacleWorker.setupInstance();
};

ARObstacleWorker.setupInstance = function () {
    ARObstacleWorker._instance = new ARObstacleWorker();
    return ARObstacleWorker._instance;
}