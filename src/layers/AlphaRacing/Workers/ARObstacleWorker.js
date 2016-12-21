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
        cc.log(JSON.stringify(params));
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

    update: function(dt) {
        var self = this;
        for (var i = this._obstacles.length-1; i >= 0; i--) {
            if (this._obstacles[i].isDead()) {
                this._obstacles[i].removeFromParent();
                this._obstacles.splice(i, 1);
            }
        }

        var updateTimes = Math.round(dt / this._deltaTime);

        this._obstacles.forEach(function(ob) {
            if (!ob.isActive() && ob.x < self._player.x - cc.winSize.width / 2) {
                ob.setIsDead(true);
                return;
            }
            
            for (var i = 0; i < updateTimes; i++) {
                if (ob.isActive())
                    ob.fixUpdate();
            }

            ob.update(dt);
        })
        
    },

    end: function() {
        this._obstacles.forEach(obj => obj.removeFromParent());
        this._obstacles = [];
    }
})