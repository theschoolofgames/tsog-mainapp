var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,
    _lbHp: null,

    _player: null,

    ctor: function(layer, player) {
        this._showClock = false;
        this._player = player;

        this._super(layer, null, "diamond");

        this._addDistanceLabel();
        this._addHPLabel();

        this.schedule(this.updateHP, 0.5);
    },

    _playAdditionEffect: function(node, effectTime) {},

    _addDistanceLabel: function() {
        var text = this._distance.toString() + "m";

        this._lbDistance = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._lbDistance.x = this._bg.x + this._bg.width;
        this._lbDistance.y = this._bg.y - 50;
        this._lbDistance.anchorX = 1;
        this.addChild(this._lbDistance);
    },

    _addHPLabel: function() {
        var text = this._player.getHP().toString() + "HP";
        this._lbHp = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._lbHp.x = this._clockBg.x;
        this._lbHp.y = this._clockBg.y;
        this._lbHp.anchorX = 1;
        this.addChild(this._lbHp);
    },

    updateDistance: function(d) {
        this._distance = Math.round(d);
        this._lbDistance.setString(this._distance.toString() + "m");
    },

    updateHP: function() {
        var text = this._player.getHP().toString() + "HP";
        this._lbHp.setString(text);
    },
});