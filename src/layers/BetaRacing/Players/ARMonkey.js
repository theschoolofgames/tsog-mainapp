var ARMonkey = ARPlayer.extend({
    _characterName : "adi",
    animationFrameCount: 4,

    ctor: function() {
        this._super();
        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(name) {
            this._characterName = name
        };

        var cfg = CharacterManager.getInstance().getCharacterConfig("monkey");
        if (cfg) {
            this.animationFrameCount = cfg.animationFrameCount;
            this._hp = cfg.heathy;
        }
    },

    configAnimation: function() {
       
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        this.sprite = new CharacterNodeAlpharacing("monkey");
        // this.sprite.attr({x:60, y:40, anchorX: 1, anchorY: 1});
        this.sprite.scale = 2;
        this.addChild(this.sprite);

    },

    jumpAnimation: function() {
        var self = this;
        this.sprite.stopAllActions(); 
        this.isRunningAnim = false;
        this.sprite.characterJump();
    },

    runAnimation: function() {
        var self = this;
        if (this.isRunningAnim)
            return;
        self.sprite.characterRunning();
        this.isRunningAnim = true;
    },

    reduceHP: function() {
        this._super();
    },
})