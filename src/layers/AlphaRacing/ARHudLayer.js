var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,
    _lbHp: null,

    _player: null,
    _gamePLayLayer: null,
    _hearts: [],
    _word: null,

    ctor: function(layer, wordNeedCollect) {
        this._showClock = false;
        // this._player = player;
        this._gamePLayLayer = layer;
        this._super(layer, null, "diamond", true);
        this._hearts = [];
        this.updatePositonHud();
        this._addDistanceLabel();
        // this._addHPLabel();
        this.addWordNeedCollect(wordNeedCollect);
        this.addGameProgressBar();
        // this.schedule(this.updateHP, 0.5);
        this._whiteBg.visible = false;
    },

    addWordNeedCollect: function(wordNeedCollect) {
        this._word = wordNeedCollect;
        var node = new cc.Node();
        node.x = this._settingBtn.x + this._settingBtn.width + 20;
        node.y = this._settingBtn.y  - 40;
        this.addChild(node);
        for(var i = 0; i < wordNeedCollect.length; i ++) {
            var w = new cc.LabelBMFont(wordNeedCollect[i],res.HomeFont_fnt);
            w.x = i * 30 + w.x;
            w.y = 0;
            w.tag = i;
            w.scale = 0.6;
            node.addChild(w);
        };
        this._node = node;
        // var word = new cc.LabelBMFont(wordNeedCollect,res.HomeFont_fnt);
        // word.x = this._settingBtn.x + this._settingBtn.width + word.width;
        // word.y = this._settingBtn.y + 10;
        // this.addChild(word);
        // word.opacity = 0;
        // cc.log("addWordNeedCollect: " + wordNeedCollect);
    },

    _playAdditionEffect: function(node, effectTime) {},

    addGameProgressBar:function(){
        this._super();
        this._progressBarBg.visible = false;
    },

    collectedAlphabet: function(alphabet){
        cc.log("alphabet HUD: " + alphabet);
        cc.log("this._word: "+this._word);
        var index = this._word.indexOf(alphabet);
        cc.log("index: " + index);
        child = this._node.getChildByTag(index);
        if(child)
            child.removeFromParent();
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
        this._distance = Math.round(d);
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
    },
});