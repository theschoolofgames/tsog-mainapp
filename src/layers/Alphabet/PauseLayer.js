var PauseLayer = cc.LayerColor.extend({
    ctor: function(callback) {
        this._super(cc.color.WHITE);

        var self = this;
        var clockInitTime = GAME_CONFIG.timeToResumeGame;
        var clock = new Clock(clockInitTime, function() {
            if (callback)
                callback();
            self.removeFromParent();
        });
        clock.setClockScale(2); 

        clock.x = cc.winSize.width/2;
        clock.y = cc.winSize.height/2 - 50;
        this.addChild(clock);

        var font = "hud-font.fnt";
        // var minutes = Math.floor(clockInitTime / 60);
        // var seconds = (clockInitTime%60) > 9 ? (":" + clockInitTime%60) : (":0" + (clockInitTime%60));
        var text = "PLEASE REST YOUR EYES FOR ";
        var lb = new cc.LabelBMFont(text, font);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + 50;
        this.addChild(lb);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() {return true;}
        }, this);

    },


})