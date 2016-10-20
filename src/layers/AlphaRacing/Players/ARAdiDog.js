var ARAdiDog = ARPlayer.extend({
    _health: 1,

    ctor: function() {
        this._super();
    },

    configAnimation: function() {
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        this.sprite = new cc.Sprite("#adi_run1.png");
        this.sprite.attr({x:10, y:65, anchorX: 1, anchorY: 1});
        this.addChild(this.sprite);

        this.runAnimationFrames = [];
        for (var i = 1; i <= 4; i++) {
            var str = "adi_run" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.runAnimationFrames.push(frame);
        }

        var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        // this.sprite = new cc.Sprite("#adi_run1.png");
        this.sprite.runAction(this.runningAction);
        // this.spriteSheet.addChild(this.sprite);
    },

    jumpAnimation: function() {
        this.sprite.stopAllActions();
        this.sprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("adi_jump1.png"));
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

    reduceHealth: function() {
        this._super();

        this._health -= 1;

        if (this._health <= 0) {
            cc.log("Die");
        }
    },
})