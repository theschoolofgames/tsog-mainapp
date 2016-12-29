var ARPlayer = cc.PhysicsSprite.extend({

    ARPLAYER_ANIMATION_TAG: 1122,

    _space: null,
    _body: null,

    _mass: 10,

    _desiredVel: 200,
    _desiredPosition: cc.p(100, 400),
    _velocityFactor: 1,

    _boostState: ARBooster.State.NONE,

    ctor: function(space) {
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);

        this._super("#adi_run1.png");
        this.scale = 0.2;

        this._space = space;

        cc.log("ARPlayer: width: " + this.width * this.scaleX);
        cc.log("ARPlayer: height: " + this.height * this.scaleY);

        var body = space.addBody(new cp.Body(this._mass, Infinity));
        body.setPos(cc.p(50, cc.winSize.height * 0.8));
        this._body = body;

        var shape = space.addShape(new cp.BoxShape(body, this.width * this.scaleX, this.height * this.scaleY));
        shape.setFriction(0);
        shape.setElasticity(0);
        shape.setCollisionType(CHIPMUNK_COLLISION_TYPE_DYNAMIC);

        this.setBody(body);

        StateMachine.create({
            target: this,
            events: [
                { name: 'run',      from: ['none', 'running', 'jumping'],           to: 'running' },
                { name: 'jump',     from: ['jumping', 'running'],                   to: 'jumping' },
                { name: 'die',      from: ['running', 'jumping'],                   to: 'died' },
            ]
        });

        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(name) {
            this._characterName = name
        };

        var cfg = CharacterManager.getInstance().getCharacterConfig(name);
        if (cfg) {
            this.animationFrameCount = cfg.animationFrameCount;
            this._hp = cfg.heathy;
        }

        this.runAnimationFrames = [];
        for (var i = 1; i <= this.animationFrameCount; i++) {
            var str = this._characterName + "_run" + i + ".png";
            // cc.log("frame name: " + str);
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            // cc.log("get sprite frame name: " + frame);
            this.runAnimationFrames.push(frame);
        }

        this.run();

        // this.schedule(this.increasePlayerSpeed.bind(this), 30, cc.REPEAT_FOREVER);
    },

    updatePlayerSpeed: function() {
        if (this._desiredVel < 400)
            this._desiredVel = 200 + 20 * this._velocityFactor; 
    },

    update: function(dt) {

        this.setOpacity(this.getOpacity());
        cc.log(this.getOpacity());

        if (this.current != "died") {
            this.updatePlayerSpeed();
            var vel = this.getBody().getVel();
            var velChange = this._desiredVel - vel.x;
            var impulse = velChange * this.getBody().m;

            if (this.current == "running") {
                this.getBody().applyImpulse(cc.p(impulse, 0), cc.p());
            } else if (this.current == "jumping") {
                this.getBody().applyForce(cc.p(impulse, 0), cc.p());
            }

            if (this.y < 10) {
                this.die();
            }
        }
    },

    getBody: function() {
        return this._body;
    },

    getVelocity: function() {
        return this.getBody().getVel();
    },

    isJumping: function() {
        return this.current == "jumping";
    },

    setVelocityFactor: function(factor) {
        this._velocityFactor = factor;
    },

    // StateMachine Callbacks
    onrun: function(event, from, to, msg) {
        this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        runningAction = new cc.RepeatForever(new cc.Animate(animation));
        runningAction.setTag(this.ARPLAYER_ANIMATION_TAG);
        this.runAction(runningAction);
        // cc.log("onrun " + event + " " + from + " " + to + " " + msg);
    },

    onjump: function(event, from, to, msg) {

        this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_jump1.png"));
        
        // cc.log("onjump " + event + " " + from + " " + to + " " + msg);
    },

    ondie: function(event, from, to, msg) {
        // cc.log("ondie " + event + " " + from + " " + to + " " + msg);

        this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_die.png"));
        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveBy(0.1, cc.p(0,-15)),
            cc.moveBy(0.4,cc.p(0, 200)).easing(cc.easeCircleActionOut()),
            cc.moveBy(0.5, cc.p(0, -600))
        ));
    },

    onrunning: function(event, from, to) {
        // cc.log("onrunning " + event + " " + from + " " + to);
    },

    onjumping: function(event, from, to) {
        if (from != "jumping")
            this.getBody().applyImpulse(cc.p(0, 8000), cc.p());

        // cc.log("onjumping " + event + " " + from + " " + to);
    },

    ondied: function(event, from, to) {
        // cc.log("ondied " + event + " " + from + " " + to);

        var event = new cc.EventCustom(EVENT_AR_GAMEOVER);
        cc.eventManager.dispatchEvent(event);
    },


    // BOOSTER STATE
    // Follow up this one: http://www.alanzucconi.com/2015/07/26/enum-flags-and-bitwise-operators/
    setBoostFlag: function(flag) {
        this._boostState |= flag;
    },

    unsetBoostFlag: function(flag) {
        this._boostState &= ~flag;
    },

    hasBoostFlag: function(flag) {
        return (this._boostState & flag) == flag;
    },

    toggleBoostFlag: function(flag) {
        this._boostState ^= flag;
    }
});