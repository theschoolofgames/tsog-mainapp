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
        //use Spine 
        // var self = this;
        // this.sprite = new AdiDogNode();
        // this.sprite.attr({x:10, y:65, anchorX: 1, anchorY: 1});
        // this.addChild(this.sprite);
        // this.runningAction = new cc.RepeatForever(
        //                                           cc.delayTime(0.05),
        //                                           cc.callFunc(function(){
        //                                                 self._character.
        //                                           })
        // );
        //-------------------------------------------
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        this.sprite = new cc.Sprite("#" + this._characterName + "_run1.png");
        this.sprite.attr({x:10, y:65, anchorX: 1, anchorY: 1});
        this.addChild(this.sprite);

        this.runAnimationFrames = [];
        for (var i = 1; i <= this.animationFrameCount; i++) {
            var str = this._characterName + "_run" + i + ".png";
            cc.log("frame name: " + str);
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            cc.log("get sprite frame name: " + frame);
            this.runAnimationFrames.push(frame);
        }
        cc.log("before create animation: ");
        var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        cc.log("after create animation: ");
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));

        this.sprite.runAction(this.runningAction);

    },

    jumpAnimation: function() {
        this.sprite.stopAllActions();
        cc.log("jumpAnimation");
        this.sprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_jump1.png"));
        cc.log("done jumpAnimation");
        this.isRunningAnim = false;
    },

    runAnimation: function() {
        if (this.isRunningAnim)
            return;

        var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        this.sprite.runAction(this.runningAction);
        this.isRunningAnim = true;
    },

    reduceHP: function() {
        this._super();
    },
})