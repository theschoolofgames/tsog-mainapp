var ARHudLayer = SpecifyGoalHudLayer.extend({

    _distance: 0,
    _lbDistance: null,
    _lbHp: null,

    _player: null,
    _gamePLayLayer: null,
    _hearts: [],
    _word: null,
    _count: null,
    amoutWordCollected: 0,

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
        var delayTime = 0;
        var self = this;

        if(this._node) {
            delayTime = 3;
            var word = new cc.LabelBMFont(this._word,res.HomeFont_fnt);
            word.x = this._node.x;
            word.y = this._node.y;
            word.opacity = 0;
            this.addChild(word);
            word.scale = 0.6;
            word.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeTo(0.5,255),
                    cc.scaleTo(1, 1).easing(cc.easeElasticOut(0.5))
                ),
                cc.delayTime(1),
                cc.fadeTo(0.5,0),
                cc.callFunc(function(){
                    word.removeFromParent();
                })
            ));
            self._node.removeFromParent();
        };
        this.amoutWordCollected = 0;
        this._node = null;
        cc.log("this._word: " + wordNeedCollect);
        this._word = wordNeedCollect;
        var node = new cc.Node();
        node.x = cc.winSize.width/2;
        node.y = this._settingBtn.y  - 80;
        this.addChild(node);
        for(var i = 0; i < wordNeedCollect.length; i ++) {
            var w = new cc.LabelBMFont(wordNeedCollect[i],res.HomeFont_fnt);
            w.x = i * 30 + w.x - 30;
            w.y = 0;
            w.tag = i;
            w.scale = 0.6;
            node.addChild(w);
            w.opacity = 100;
        };
        this._node = node;
        this._node.opacity = 0;
        this._node.setCascadeOpacityEnabled(true);
        this._node.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeTo(0.5, 255),
                cc.scaleTo(1, 2).easing(cc.easeElasticOut(0.5))
            ),
            cc.spawn(
                cc.scaleTo(1, 1).easing(cc.easeElasticIn(0.5)),
                cc.fadeTo(1, 0)
            ),
            cc.callFunc(function(){
            })
        ));
        // var word = new cc.LabelBMFont(wordNeedCollect,res.HomeFont_fnt);
        // word.x = this._settingBtn.x + this._settingBtn.width + word.width;
        // word.y = this._settingBtn.y + 10;
        // this.addChild(word);
        // word.opacity = 0;
        this._oldWord = wordNeedCollect; 
        cc.log("addWordNeedCollect: " + wordNeedCollect);
    },

    _playAdditionEffect: function(node, effectTime) {},

    addGameProgressBar:function(){
        this._super();
        this._progressBarBg.visible = false;
    },

    collectedAlphabet: function(alphabet){
        var self = this;
        // cc.log("this._word: "+this._word);
        var index = this._word.indexOf(alphabet);
        var count = 0;
        // cc.log("getChildrenCount: " + this._node.getChildrenCount());
        for(var i = 0; i < this._word.length; i ++){
            if(this._word[i] == alphabet) {
                var child = this._node.getChildByTag(i);
                if(child) {
                    count++;
                    // this._layer._inputData.splice(0,1);
                    child.tag = 1000;
                    child.opacity = 255;
                    this.amoutWordCollected++;
                    this._node.runAction(cc.sequence(
                        cc.fadeTo(0.5, 255),
                        cc.delayTime(1.2),
                        cc.fadeTo(1, 0),
                        cc.callFunc(function(){
                        })
                    ));
                    cc.log("alphabet HUD: " + alphabet);
                    this._isColected = true;
                    if(count < 2)
                        this._layer.addNewAlphabet();
                }
            }
        };
        if(this.amoutWordCollected == this._count) {
            this._layer._nextWord = localizeForWriting(this._layer._sourceData[0].value);
            this.addWordNeedCollect(this._layer._nextWord);
            this._layer.newWordNeedCollect();
        };
        this._count = this._node.getChildrenCount();
        // cc.log("childCount: " + this._count);
        
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
        this._lbDistance.scale = 1.2;
        this._lbDistance.x = whitespace.width/2 + 10;
        this._lbDistance.y = whitespace.height/2 + 25 * this._lbDistance.scale;
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

    getDistance: function() {
        return this._lbDistance.getString();
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