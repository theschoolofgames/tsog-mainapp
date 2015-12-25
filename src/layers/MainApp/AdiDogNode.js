
var ADI_HEAD = "bone4";
var ADI_NOSE = "mui2";
var ADI_HAND_LEFT = "hand L 2";
var ADI_HAND_RIGHT = "hand R2";
var ADI_BELLY = "body2";
var ADI_SLOTS = [ADI_HEAD, ADI_NOSE, ADI_HAND_LEFT, ADI_HAND_RIGHT, ADI_BELLY];

var AdiDogNode = cc.Node.extend({
    _talkingAdi: null,
    _isAdiIdling: false,

    listener: null,

    ctor: function(setActive) {
        this._super();

        this._createTalkingAdi();

        if(setActive)
            this._addTouchEvent();
    },

    _addTouchEvent: function() {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                var self = event.getCurrentTarget();
                var touchPos = touch.getLocation();
                cc.log("self._isAdiIdling: " + self._isAdiIdling);
                if (!self._isAdiIdling)
                    return true;

                self.stopAllActions();

                var bbox = self._talkingAdi.getBoundingBox();
                cc.log("bbox: " + JSON.stringify(bbox));
                bbox.x += self.x;
                bbox.y += self.y;

                if (cc.rectContainsPoint(bbox, touchPos)) {
                    cc.log("touchPos.x: " + touchPos.x);
                    cc.log("touchPos.y: " + touchPos.y);
                    cc.log("bbox.x: " + bbox.x);
                    cc.log("bbox.y: " + bbox.y);
                    cc.log("bbox.width: " + bbox.width);
                    cc.log("bbox.height: " + bbox.height);

                    if (touchPos.y > bbox.height*0.95) {
                        cc.log("touched head");
                        AudioListener.getInstance().pauseListening();
                        self.adiSitdown();
                    }
                    if (touchPos.y < bbox.height*0.98 && touchPos.y > bbox.height*0.9 ){
                        cc.log("touched nose");
                        AudioListener.getInstance().pauseListening();
                        self.adiSneeze();
                    }
                    if ((touchPos.x < (bbox.x+bbox.width*0.3) || touchPos.x > (bbox.x+bbox.width*0.7)) && touchPos.y > (bbox.y+bbox.height*0.3) && touchPos.y < (bbox.y+bbox.height*0.6)) {
                        cc.log("touched hand");
                        AudioListener.getInstance().pauseListening();
                        self.adiHifi();
                    }
                    
                    if (touchPos.y < (bbox.y+bbox.height*0.4) && touchPos.x > (bbox.x+bbox.width*0.3) && touchPos.x < (bbox.x+bbox.width*0.7) ) {
                        cc.log("touch belly");
                        AudioListener.getInstance().pauseListening();
                        self.adiJump();
                    }
                    
                    self.runAction(cc.sequence(
                            cc.delayTime(1.5),
                            cc.callFunc(function() {
                                self.adiIdling();
                                NativeHelper.callNative("startBackgroundSoundDetecting");
                            })
                        ))
                }

                return true;
            }
        }, this);
    },

    _createTalkingAdi: function() {
        cc.log("before creating adi");
        this._talkingAdi = new sp.SkeletonAnimation("adidog/adidog.json", "adidog/adidog.atlas", 0.3);

        this._talkingAdi.setMix('adidog-idle', 'adidog-listeningstart', 0.2);
        this._talkingAdi.setMix('adidog-idle', 'adidog-talking', 0.2);
        this._talkingAdi.setMix('adidog-listeningstart', 'adidog-listeningloop', 0.2);
        this._talkingAdi.setMix('adidog-listeningloop', 'adidog-listeningfinish', 0.2);
        this._talkingAdi.setMix('adidog-listeningloop', 'adidog-shake', 0.3);
        this._talkingAdi.setMix('adidog-listeningfinish', 'adidog-talking', 0.2);
        this._talkingAdi.setMix('adidog-listeningfinish', 'adidog-jump', 0.3);
        this._talkingAdi.setMix('adidog-jump', 'adidog-hifi', 0.2);
        this._talkingAdi.setMix('adidog-hifi', 'adidog-jump', 0.2);
        this._talkingAdi.setMix('adidog-shake', 'adidog-talking', 0.5);
        this._talkingAdi.setMix('adidog-talking', 'adidog-idle', 0.2);
        this._talkingAdi.setMix('adidog-talking', 'adidog-listeningstart', 0.2);

        this._talkingAdi.setMix('adidog-jump', 'adidog-idle', 0.2);
        this._talkingAdi.setMix('adidog-sneeze', 'adidog-idle', 0.2);
        this._talkingAdi.setMix('adidog-sitdown', 'adidog-idle', 0.2);
        this._talkingAdi.setMix('adidog-shake', 'adidog-idle', 0.2);

        // this._talkingAdi.setDebugSlotsEnabled(true);

        this._talkingAdi.setAnimation(0, 'adidog-idle', true);

        this.addChild(this._talkingAdi, 4);
        this._isAdiIdling = true;
        AudioListener.getInstance().setListener(this);
    },

    onStartedListening: function() {
        cc.log("onStartedListening");
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-listeningstart', false);
        this._talkingAdi.addAnimation(0, 'adidog-listeningloop', true, 0.5);
    },

    onStoppedListening: function() {
        cc.log("onStoppedListening");
        this._talkingAdi.setAnimation(0, 'adidog-listeningfinish', false);
    },

    adiTalk: function() {
        this._talkingAdi.addAnimation(0, 'adidog-talking', true, 0.3);
    },

    adiShakeHead: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-shake', false);  
    },

    adiSneeze: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-sneeze', false);  
    },

    adiHifi: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-hifi', false);  
    },

    adiIdleHint: function() {
        this._talkingAdi.setAnimation(0, 'adidog-idle-hint', false);  
    },

    adiJump: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-jump', false);  
    },

    adiIdling: function() {
        this._isAdiIdling = true;
        cc.log("setidling: " + this._isAdiIdling);
        AudioListener.getInstance().resumeListening();
        this._talkingAdi.setAnimation(0, 'adidog-idle', true);
    },

    adiSitdown: function() {
        cc.log("adiSitdown");
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'adidog-sitdown', false);
    }
});
