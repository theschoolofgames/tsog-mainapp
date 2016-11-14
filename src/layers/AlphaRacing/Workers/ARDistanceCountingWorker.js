var ARDistanceCountingWorker = cc.Class.extend({

    _player: null,
    _initPosition: null,

    _hudlayer: null,

    ctor: function(player, hudLayer) {
        this._player = player;
        this._hudlayer = hudLayer;
        this._initPosition = this._player.getPosition();
    },

    update: function(dt) {
        this._hudlayer.updateDistance((this._player.x - this._initPosition.x)/100);
    },
})