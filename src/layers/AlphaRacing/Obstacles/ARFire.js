var ARFire = ARObstacle.extend({

    timeForWarning: 3,
    velocity: cc.p(-500, 0),

    _state: "none",


    ctor: function(player) {
        this._super(player, "ar-obstacles/fireball-1.png");
        Utils.runAnimation(this, "ar-obstacles/fireball", 0.05, 5, true, 0.05);
        this.visible = false;
    },

    willStart: function() {
        
    },

    didStart: function() {
        
    },

    willEnd: function() {
        this._player.die();
    },

    didEnded: function() {
        cc.log("ARFire: didEnded");
    },

    setState: function(state) {
        this._state = state;
    },

    prepare: function() {
        var self = this;

        var randomY = Math.random() * cc.winSize.height + 300;

        this.y = randomY;
        this.x += cc.winSize.width * 2 / 3;

        // cc.log("randomY: " + randomY);

        var event = new cc.EventCustom(EVENT_AR_FIREBALL_ACTIVE);
        event.setUserData({
            y: randomY,
            time: this.timeForWarning
        });
        cc.eventManager.dispatchEvent(event);

        this.runAction(cc.sequence(
            cc.delayTime(this.timeForWarning),
            cc.callFunc(() => {
                self.showUp();
            })
        ))
    },

    showUp: function() {
        this.visible = true;
        
        this.setState("showUp");
    },

    fixUpdate: function() {
        // cc.log((this._player.getColli sionBoundingBox().x + this.timeForWarning * this._player.getVelocity().x) + " " + this.x)
        if ( this._state == "none" &&
             (this._player.getDesiredPosition().x + this.timeForWarning * this._player.getVelocity().x + cc.winSize.width / 3) >= this.x) {
            this.setState("preparing");
            this.prepare();
        } else if (this._state == "showUp") {
            this.x += this.velocity.x * 1/60;
            this.y += this.velocity.y * 1/60;
        }
    },
})

