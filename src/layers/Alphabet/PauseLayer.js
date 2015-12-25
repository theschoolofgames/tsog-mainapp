var PauseLayer = cc.LayerColor.extend({
    ctor: function(callback) {
        this._super(cc.color.WHITE);

        var self = this;
        var clock = new Clock(GAME_CONFIG.timeToResumeGame, function() {
            callback();
            self.removeFromParent();
        });

        clock.x = cc.winSize.width/2;
        clock.y = cc.winSize.height/2;
        this.addChild(clock);

    },


})