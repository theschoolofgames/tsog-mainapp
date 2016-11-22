var ARAdiDog = ARPlayer.extend({
    _characterName : "adi",
    animationFrameCount: 4,

    ctor: function() {
        this._super();
        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(name) {
            this._characterName = name
        };

        var cfg = CharacterManager.getInstance().getCharacterConfig(name);
        if (cfg) {
            this.animationFrameCount = cfg.animationFrameCount;
            this._hp = cfg.heathy;
        }
    },

    configAnimation: function() {
       
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        // this.sprite = new cc.Sprite("#" + this._characterName + "_run1.png");
        this.sprite = new CharacterNodeAlpharacing("monkey");
        // this.sprite.attr({x:60, y:40, anchorX: 1, anchorY: 1});
        this.sprite.scale = 2;
        this.addChild(this.sprite);

        // this.runAnimationFrames = [];
        // for (var i = 1; i <= this.animationFrameCount; i++) {
        //     var str = this._characterName + "_run" + i + ".png";
        //     cc.log("frame name: " + str);
        //     var frame = cc.spriteFrameCache.getSpriteFrame(str);
        //     cc.log("get sprite frame name: " + frame);
        //     this.runAnimationFrames.push(frame);
        // }
        // cc.log("before create animation: ");
        // var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        // cc.log("after create animation: ");
        // this.runningAction = new cc.RepeatForever(new cc.Animate(animation));

        // this.sprite.characterRunning();

    },

    jumpAnimation: function() {
        var self = this;
        this.sprite.stopAllActions();
        // cc.log("jumpAnimation");
        // this.sprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_jump1.png"));
        // cc.log("done jumpAnimation");
        this.isRunningAnim = false;
        cc.log("JUMP");
        this.sprite.characterJump();
        // this.sprite.runAction(cc.RepeatForever(
        //     cc.delayTime(1),
        //     cc.callFunc(function(){
        //         this.characterRunning();
        //     })
        // ));
    },

    runAnimation: function() {
        var self = this;
        // this.sprite.characterRunning();
        if (this.isRunningAnim)
            return;
        cc.log("RUN");
        self.sprite.characterRunning();
        // this.sprite.runAction(cc.RepeatForever(
        //     cc.delayTime(1),
        //     cc.callFunc(function(){
        //         cc.log("REPEAT");
        //     })
        // ));
        // var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        // this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        // this.sprite.runAction(this.runningAction);
        this.isRunningAnim = true;
    },

    reduceHP: function() {
        this._super();
    },
})