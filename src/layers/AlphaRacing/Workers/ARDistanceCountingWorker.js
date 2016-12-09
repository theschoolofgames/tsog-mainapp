var ARDistanceCountingWorker = cc.Class.extend({

    _player: null,
    _initPosition: null,
    _distance: 0,

    _hudlayer: null,

    ctor: function(player, hudLayer) {
        this._player = player;
        this._hudlayer = hudLayer;
        this._initPosition = this._player.getPosition();
    },

    update: function(dt) {
        this._distance = Math.round((this._player.x - this._initPosition.x)/10);
        this._hudlayer.updateDistance(this._distance);

        var factor = Math.ceil(this._distance / 500) + 0.1;
        this._player.setVelocityFactor(factor);
    },

    end: function() {
        UserStorage.getInstance().setARHighscore(this._distance);
    }
})