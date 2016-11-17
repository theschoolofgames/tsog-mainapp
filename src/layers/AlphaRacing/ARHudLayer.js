var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,
    _lbHp: null,

    _player: null,
    _hearts: [],

    ctor: function(layer, player) {
        this._showClock = false;
        this._player = player;

        this._super(layer, null, "diamond");
        this._hearts = [];
        this._addDistanceLabel();
        this._addHPLabel();
        this.addGameProgressBar();
        this.schedule(this.updateHP, 0.5);
    },
    addGameProgressBar:function(){
        this._super();
        this._progressBarBg.visible = false;
    },
    _addDistanceLabel: function() {
        var cup =  new cc.Sprite("#cup.png");
        cup.x = this.width/2 + 100;
        cup.y = this._bg.y;
        cup.scale = 0.9;
        this.addChild(cup);

        var whitespace = new cc.Sprite("#whitespace.png");
        whitespace.anchorX = 0;
        whitespace.x = 30;
        whitespace.y = cup.height/2;
        cup.addChild(whitespace, -1);

        var text = this._distance.toString() + "m";

        this._lbDistance = new cc.LabelBMFont(text, res.HudFont_fnt);
        this._lbDistance.x = whitespace.width/2 + 10;
        this._lbDistance.y = whitespace.height/2;
        whitespace.addChild(this._lbDistance);
    },

    _addHPLabel: function() {
        var hp = this._player.getHP();
        for(var i = 0; i < hp; i ++){
            var heart = new cc.Sprite("#heart-1.png");
            heart.x = (i%6) * 40 + this._settingBtn.x + 80;
            heart.y = - Math.floor(i/6) * 40 + this._bg.y + 20;
            this.addChild(heart);
            heart.scale = 0.5;
            this._hearts.push(heart);
        }
    },

    updateDistance: function(d) {
        this._distance = Math.round(d);
        this._lbDistance.setString(this._distance.toString() + "m");
    },

    updateHP: function() {
        var hp = this._player.getHP();
        for(var i = hp; i < this._hearts.length; i ++) {
            this._hearts[i].setSpriteFrame("heart-2.png");
        }
    },
});