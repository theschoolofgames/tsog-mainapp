var ARFire = ARObstacle.extend({

    timeForWarning: 3,
    velocity: cc.p(-200, 0),

    _state: "none",


    ctor: function(player) {
        this._super(player, "fireball.png");
        this.visible = false;
    },

    willStart: function() {
        
    },

    didStart: function() {
        
    },

    willEnd: function() {
        ARObstacleWorker.getInstance().removeObstacle(this);
        this.removeFromParent();
        this._player.reduceHealth();
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
        this.x += cc.winSize.width * Math.abs(this.velocity.x / this._player.getVelocity().x);

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

    update: function(dt) {
        // cc.log((this._player.getColli sionBoundingBox().x + this.timeForWarning * this._player.getVelocity().x) + " " + this.x)
        if ( this._state == "none" &&
             (this._player.getDesiredPosition().x + this.timeForWarning * this._player.getVelocity().x + cc.winSize.width / 3) >= this.x) {
            this.setState("preparing");
            this.prepare();
        } else if (this._state == "showUp") {
            this.x += this.velocity.x * dt;
            this.y += this.velocity.y * dt;
        }

        this._super(dt);
    },
})

