var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,
    _lbHp: null,

    _player: null,
    _hearts: [],

    ctor: function(layer, player) {
        this._showClock = false;
        this._player = player;

        this._super(layer, null, "diamond", true);
        this._hearts = [];
        this.updatePositonHud();
        this._addDistanceLabel();
        this._addHPLabel();
        this.addGameProgressBar();
        this.schedule(this.updateHP, 0.5);
    },

    _playAdditionEffect: function(node, effectTime) {},

    addGameProgressBar:function(){
        this._super();
        this._progressBarBg.visible = false;
    },

    _addDistanceLabel: function() {
        var whitespace = new cc.Sprite("#whitespace.png");
        whitespace.x = this._whiteBg.x - this._whiteBg.width - HUD_BAR_DISTANCE + 10;
        whitespace.y = this._whiteBg.y;
        this.addChild(whitespace);

        var cup =  new cc.Sprite("#cup.png");
        cup.x = 0;
        cup.y = whitespace.height/2;
        cup.scale = 0.9;
        whitespace.addChild(cup);


        var text = this._distance.toString();

        this._lbDistance = new cc.LabelBMFont(text, res.MapFont_fnt);
        // this._lbDistance.setColor(cc.color())
        this._lbDistance.x = whitespace.width/2 + 10;
        this._lbDistance.y = whitespace.height/2 + 25;
        whitespace.addChild(this._lbDistance);
    },

    _addHPLabel: function() {
        var hp = this._player.getHP();
        for(var i = 0; i < hp; i ++){
            var heart = new cc.Sprite("#heart-1.png");
            heart.x = (i%4) * 25 + this._progressBar.x - this._progressBar.width/2;
            heart.y = - Math.floor(i/4) * 25 + this._bg.y + 10;
            this.addChild(heart);
            heart.scale = 0.35;
            this._hearts.push(heart);
        }
    },

    playPopGoldSound: function() {
        // AudioManager.getInstance().stopAll();
        // AudioManager.getInstance().play(res.collect_diamond_mp3);
    },

    updateDistance: function(d) {
        this._distance = Math.round(d) * 10;
        this._lbDistance.setString(this._distance.toString());
    },

    updateHP: function() {
        var hp = this._player.getHP();
        for(var i = hp; i < this._hearts.length; i ++) {
            this._hearts[i].setSpriteFrame("heart-2.png");
        }
    },
    updatePositonHud: function() {
        this._whiteBg.x = this._bg.x - this._bg.width - HUD_BAR_DISTANCE + 50;
    }
});