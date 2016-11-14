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
        this._distance = Math.round((this._player.x - this._initPosition.x)/100);
        this._hudlayer.updateDistance(this._distance);
    },

    end: function() {
        UserStorage.getInstance().setARHighscore(this._distance);
    }
})