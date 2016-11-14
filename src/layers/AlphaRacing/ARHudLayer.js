var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,

    ctor: function(layer, timeForScene) {
        this._super(layer, timeForScene, "diamond");

        this._addDistanceLabel();
    },

    _addDistanceLabel: function() {
        var text = this._distance.toString() + "m";

        this._lbDistance = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._lbDistance.x = this._bg.x + this._bg.width;
        this._lbDistance.y = this._bg.y - 50;
        this._lbDistance.anchorX = 1;
        this.addChild(this._lbDistance);
    },

    updateDistance: function(d) {
        this._distance = Math.round(d);
        this._lbDistance.setString(this._distance.toString() + "m");
    }
});