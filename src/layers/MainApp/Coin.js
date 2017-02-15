var kTagAnimation = 1;
var kTagBlink = 2;
var kTagTransfer = 3;

var Coin = cc.Node.extend({
    bounceCount: 0,
    booster: 0,
    burstStep: 0,
    radius: 0,
    burstSpread: 0,
    groundY: 0,
    velMin: 0,
    velMax: 0,
    accelY: 0,
    transferDelay: 0,
    animationStarted: false,
    animationShouldStop: false,
    transferStarted: false,
    burstStarted: false,
    preserveScale: false,
    randomFirstFrame: false,
    value: 0,
    targetPosition: null,
    vel: null,
    sprite: null,
    animation: null,
    transferDidStart: null,
    transferWillStop: null,
    transferDidStop: null,
    burstDidStart: null,
    burstWillStop: null,
    burstDidStop: null,
    didBounce: null,

    ctor: function(inCoinRain) {
        this._super();
        if (!Coin.coins) {
            Coin.coins = [];
        }

        this.bounceCount = 0;
        this.booster = 0;

        this.burstSpread = 20;
        this.groundY = 0;
        this.transferDelay = 0;

        this.animationStarted = false;
        this.transferStarted = false;
        this.burstStarted = false;
        this.preserveScale = false;
        this.randomFirstFrame = false;

        value = 0;

        this.targetPosition = cc.p(0, 0);

        this.transferDidStart = null;
        this.transferWillStop = null;
        this.transferDidStop = null;
        this.burstDidStart = null;
        this.burstWillStop = null;
        this.burstDidStop = null;
        this.didBounce = null;

        cc.spriteFrameCache.addSpriteFrames(res.Common_plist);
        this.sprite = new cc.Sprite("#coin-01.png");//TODO
        this.addChild(this.sprite);
        if (!inCoinRain) {
            this.sprite.visible = false;
        }

    //  radius = sprite.contentSize.height/2.0f;
        this.radius = 24;
        this.velMin = 30 * this.radius;
        this.velMax = 40 * this.radius;

        var animFrames = [];
        for (var i = 1; i <= 27; i++) {
            var idx = i < 10 ? "0" + i : i;
            var str = "coin-" + idx + ".png";
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(str);
            var animFrame = new cc.AnimationFrame();
            animFrame.initWithSpriteFrame(spriteFrame, 1, null)
            animFrames.push(animFrame);
        }
        this.animation = new cc.Animation(animFrames, 0.04);
        this.animation.retain();

        // [NSNotificationCenter observe:@"appWillResignActiveNotification" target:self]; //TODO
    },

    //Callback
    appWillResignActiveNotification: function() {
        if (this.transferStarted) {
            this.stopTransfer();
        } 

        if (this.burstStarted) {
            this.stopBurst();
        }
    },

    //Override
    visit: function() {
        // if (!this.groundY || this.y - this.radius > this.groundY) {
        //  this._super();
        //  return;
        // }

        // var r = cc.rect(0, groundY, SW, SH-groundY);

        // cc.glEnable(gl.GL_SCISSOR_TEST);
        // Screen.screen.scissorWithRect(r);
        // this._super();
        // cc.glDisable(gl.GL_SCISSOR_TEST);
    },

    startAnimation: function() {
        if (this.animationShouldStop) {
            this.animationShouldStop = false;
            return;
        }

        this.animate();

        this.animationStarted = true;
    },

    stopAnimation: function() {
        this.animationShouldStop = true;    
    },

    animate: function() {
        if (this.animationShouldStop) {
            this.animationShouldStop = false;
            this.animationStarted = false;
            return;
        }

        var anim;
        if (this.burstStarted) {
            var frames = []; 

            if (this.vel.x < 0) {
                for (var i = this.animation.getFrames().length - 1; i >= 0 ; i--) {
                    frames.push(this.animation.getFrames()[i]);
                }
            } else {
                frames = this.animation.getFrames();
            }

            var s = Math.min(Math.abs(this.vel.x) / 100.0, 1);
            var delayPerUnit = 0.03 + (1.0 - s) * 0.05;
            anim = new cc.Animation(frames, delayPerUnit);
            anim.retain();
            this.animation.release();
            this.animation = anim;
        } else {
            anim = this.animation;
        }
        anim.setRestoreOriginalFrame(true);
        var a = cc.sequence(
            cc.animate(anim),
            cc.callFunc(
                function() {
                    this.animate();
                }, this
            )
        ) 
        a.tag = kTagAnimation;
        this.sprite.runAction(a);

        if (this.randomFirstFrame) {
            this.randomFirstFrame = false;
            a.step(0);
            a.step(Math.random() * (1));
        }

    },

    blink: function() {
        // TODO
        // this.sprite.stopActionByTag(kTagBlink);
        // this.sprite.tintOpacity = 255;//TODO: implement TintSprite.js
        // CCAction *a = [CCEaseSineIn actionWithAction:
        //         [CCTintFadeOut actionWithDuration:0.1f]];//TODO
        // var a = cc.easeSineIn(CCTintFadeOut(0.1));
        // a.tag = kTagBlink;
        // this.sprite.runAction(a);
    },

    startTransfer: function() {
        var d = 0.5;

        this.visible = false;

        this.runAction(cc.sequence(
                cc.delayTime(this.transferDelay),
                cc.callFunc(function() {
                    this.visible = true;
                    if (this.transferDidStart) {
                        this.transferDidStart();
                    }
                }, this),
                cc.easeSineOut(
                    cc.moveTo(d, this.targetPosition),
                    cc.callFunc(function() {
                        this.stopTransfer();
                    }, this)
                )
            )
        );

        Coin.coins.push(this);

        this.transferStarted = true;
    },

    stopTransfer: function() {
        if (this.transferWillStop) {
            this.transferWillStop();
        }

        this.topActionByTag(kTagTransfer);

        this.setPosition(this.targetPosition);

        if (this.animationStarted) {
            this.stopAnimation();
        }

        this.removeFromParent(true);

        Coin.coins.splice(Coin.coins.indexOf(this), 1)

        this.transferStarted = false;

        if (this.transferDidStop) {
            transferDidStop();
        }
    },

    startBurst: function() {
        var a = 90 + Utils.randFloat2(-this.burstSpread / 2.0, this.burstSpread / 2.0);
        var radA = cc.degreesToRadians(a);
        this.vel = cc.p(Math.cos(radA), Math.sin(radA));
        var ranNum = Utils.randFloat2(this.velMin, this.velMax);
        this.vel.x *= ranNum;
        this.vel.y *= ranNum;

        this.accelY = -144.0 * this.radius;

        this.setVisible(false);

        var action = this.sprite.getActionByTag(kTagAnimation);
        if (action) {
            action.step(0);
            action.step(Math.random() * (action.duration));
        }

        Coin.coins.push(this);

        this.burstStep = 1;
        this.burstStarted = true;

        var self = this;
        this.scheduleOnce(function() {
            self.startAnimation();

            if (self.preserveScale) {
                self.setScale(1);
                self.setVisible(true);
            } else {
                self.setScale(0);
                self.setVisible(true);
                self.runAction(
                    cc.easeSineOut(
                        cc.scaleTo(0.1, 1)
                    )
                );
            }

            if (self.burstDidStart) {
                self.burstDidStart();
            }

            self.scheduleUpdate();
        }, this.transferDelay);
    },

    stopBurst: function() {
        this.stopBurstAnimated(true);
    },

    stopBurstAnimated: function(animated) {
        if (this.burstWillStop) {
            this.burstWillStop();
        }

        this.unscheduleUpdate();

        if (this.animated) {

            var a = cc.sequence(
                        cc.easeSineIn(
                            cc.fadeOut(0.1)
                        ),
                        cc.callFunc(function() {
                            this.burstAnimationFinished();
                        }, this)
            );
            this.sprite.runAction(a);

        } else {
            this.burstAnimationFinished();
        }
    },

    burstAnimationFinished: function() {
        this.stopAnimation();

        this.removeFromParent(true);

        Coin.coins.splice(Coin.coins.indexOf(this), 1);

        this.burstStarted = false;

        if (this.burstDidStop) {
            this.burstDidStop();
        }
    },

    update: function(dt) {
        // cc.log("this.groundY: " + this.groundY);
        // avoid huge time steps
        dt = cc.clampf(dt, 0.0, 0.1);

        var p = this.getPosition();

        if (this.y > this.groundY) {
            // cc.log("set sprite visible to true");
            this.sprite.visible = true;
        }
        else {
            // cc.log("set sprite visible to false");
            this.sprite.visible = false;
        }

        this.vel.y += this.accelY * dt;

        p.x += this.vel.x * dt;
        p.y += this.vel.y * dt;

        if (this.vel.y < 0.0) {
            if (p.y < this.groundY + this.radius) {
                p.y = this.groundY + this.radius;
                this.vel.y = - this.vel.y * 0.6;
                this.bounceCount++;
                if (this.didBounce) {
                    this.didBounce();
                }
                if (this.burstStep == 1 && this.bounceCount == 8) {
                    this.burstStep++;
                }
            }
        }

        this.setPosition(p);

        if (this.burstStep == 2) {
            this.stopBurst();
            this.burstStep++;
        }
    },

    onExit: function() {
        this.animation.release();
        
        this._super();
    }
});

Coin.coins = null;
Coin.stopAll = function() {
    if (Coin.coins) {
        while (Coin.coins.length > 0) {
            var c = Coin.coins[0];
            if (c.transferStarted) {
                c.stopTransfer();
                continue;
            }
            if (c.burstStarted) {
                c.stopBurstAnimated(false);
                continue;
            }
        }
    }
};