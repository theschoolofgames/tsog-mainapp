var CoinRain = cc.Node.extend({
    started: false,
    coins: null,
    attrs: null,
    stopCallback: null,

    ctor: function() {
        this._super();

        this.started = false;
        // this.coins = [];
        this.attrs = [];
        this.stopCallback = null;
        cc.log("COIN-RAIN");
    },

    startWithCallback: function(callback) {
        CoinRain.currentRain = this;
        this.stopCallback = callback
        AudioManager.getInstance().play(res.coin_rain_mp3, false, null);
        var c;
        var numCoins = 150;
        var SW = cc.winSize.width;
        var SH = cc.winSize.height;
        for (var i = 0; i < numCoins; i++) {
            var x = Utils.randFloat2(0, SW);
            var y = Utils.randFloat2(0, SH * 2) + SH + 50;
            c = new Coin(true);
            c.setPosition(x, y);
            cc.log("NAME: " + c.name);
            if(c.name == "gold")
                c.setRotation(Math.random() * (360));
            c.setScale(Utils.randFloat2(1, 1.5));
            this.addChild(c);
            c.randomFirstFrame = true;
            c.startAnimation();
            // this.coins.push(c);
            var vel = Utils.randFloat2(SH, SH * 1.4);
            var rvel = Utils.randFloat2(60, 120) * (randBool() ? -1 : 1);
            this.attrs.push({
                "vel": vel,
                "rvel": rvel
            });
        }

        this.started = true;
        this.scheduleUpdate();
    },

    update: function(dt) {
        var shouldStop = true;

        var p;
        var attr;
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            attr = this.attrs[i];
            var vel = attr["vel"];
            var rvel = attr["rvel"];
            p = children[i].getPosition();
            p.y -= vel * dt;
            children[i].setPosition(p);
            if (p.y > -100) {
                shouldStop = false;
            } else {
                children[i].rotation += rvel * dt;
            }
        }

        if (shouldStop) {
            this.stop();
        }
    },

    stop: function() {
        this.unscheduleUpdate();

        CoinRain.currentRain = null;

        this.removeAllChildren();

        // this.coins = [];
        this.attrs = [];

        if (this.stopCallback) {
            this.stopCallback();
            this.stopCallback = null;
        }

        this.started = false;

        this.removeFromParent();
    }
});

CoinRain.currentRain = null;

CoinRain.stop = function() {
    if (CoinRain.currentRain) {
        CoinRain.currentRain.stop();
    }
};

CoinRain.current = function() {
    return CoinRain.currentRain;
};