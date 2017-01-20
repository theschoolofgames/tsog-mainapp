let BOX_WIDTH = 64;
let BOX_HEIGHT = 105;
var ARPlayer = cc.PhysicsSprite.extend({

    ARPLAYER_ANIMATION_TAG: 1122,

    _character: null,

    _space: null,
    _body: null,

    _mass: 10,

    _desiredVel: 200,
    _desiredPosition: cc.p(100, 400),
    _velocityFactor: 1,

    _boostState: ARBooster.State.NONE,

    ctor: function(space) {
        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);

        this._super("alpharacingEmptyCharacter.png");
        // this.scale = 0.2;

        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(!name) {
            name = "adi"
        };

        this._character = new sp.SkeletonAnimation("characters/alpharacing/" + name + "/character.json", "characters/alpharacing/" + name + "/character.atlas", 0.3);
        this._character.setCascadeOpacityEnabled(true);
        // this._character.setMix('run', 'run', 0);
        // this._character.setMix('jump', 'run', 1);
        this._character.x = this.width/2;
        this._character.y  = 14;
        this._character.scale = 0.7;
        if (name != "adi") {
            this._character.scale = this._character.scale * 0.5;
        }
        this.addChild(this._character);
        this.setCascadeOpacityEnabled(true);

        this._space = space;

        var body = space.addBody(new cp.Body(this._mass, Infinity));
        body.setPos(cc.p(50, cc.winSize.height * 0.8));
        this._body = body;

        var shape = space.addShape(new cp.BoxShape(body, BOX_WIDTH, BOX_HEIGHT));
        shape.setFriction(0);
        shape.setElasticity(0);
        shape.setCollisionType(CHIPMUNK_COLLISION_TYPE_DYNAMIC);

        this.setBody(body);

        StateMachine.create({
            target: this,
            error: function(eventName, from, to, args, errorCode, errorMessage, originalException) {
                // return 'event ' + eventName + ' was naughty :- ' + errorMessage;
            },
            events: [
                { name: 'run',      from: ['none', 'running', 'jumping'],           to: 'running' },
                { name: 'jump',     from: ['jumping', 'running'],                   to: 'jumping' },
                { name: 'die',      from: ['running', 'jumping'],                   to: 'died' },
                { name: 'revive',  from: ['died'],                                  to: 'running'},
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
        // cc.log(this.getOpacity());

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
        // cc.log("running");
        // this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        // var animation = new cc.Animation(this.runAnimationFrames, 0.1);
        // runningAction = new cc.RepeatForever(new cc.Animate(animation));
        // runningAction.setTag(this.ARPLAYER_ANIMATION_TAG);
        // this.runAction(runningAction);
        this._character.setAnimation(0, 'run', true);
    },

    onjump: function(event, from, to, msg) {

        // this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        // this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_jump1.png"));
        this._character.setAnimation(0, 'jump', false);
        
        // cc.log("onjump " + event + " " + from + " " + to + " " + msg);
    },

    ondie: function(event, from, to, msg) {
        // cc.log("ondie " + event + " " + from + " " + to + " " + msg);

        // this.stopActionByTag(this.ARPLAYER_ANIMATION_TAG);
        // this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._characterName + "_die.png"));
        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveBy(0.1, cc.p(0,-15)),
            cc.moveBy(0.4,cc.p(0, 200)).easing(cc.easeCircleActionOut()),
            cc.moveBy(0.5, cc.p(0, -600))
        ));

        this._character.setAnimation(0, 'die', false);
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