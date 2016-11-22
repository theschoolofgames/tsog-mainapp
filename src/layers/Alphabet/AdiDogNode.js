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

    ctor: function(setActive, characterName) {
        this._super();
        this.setCascadeOpacityEnabled(true);
        this._createTalkingAdi(characterName);

        if(setActive)
            this._addTouchEvent();
    },

    getBoundingBox: function() {
        var bb = this._talkingAdi.getBoundingBox();
        // cc.log("Talking ADi bbox: " + JSON.stringify(bb));
        return cc.rect(bb.x + this.x, bb.y + this.y, bb.width, bb.height);
    },

    _addTouchEvent: function() {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function(touch, event) {
                var self = event.getCurrentTarget();
                var touchPos = touch.getLocation();
                // cc.log("self._isAdiIdling: " + self._isAdiIdling);
                if (!self._isAdiIdling)
                    return true;

                self.stopAllActions();

                var bbox = self._talkingAdi.getBoundingBox();
                // cc.log("bbox: " + JSON.stringify(bbox));
                bbox.x += self.x;
                bbox.y += self.y;

                if (cc.rectContainsPoint(bbox, touchPos)) {
                    // cc.log("touchPos.x: " + touchPos.x);
                    // cc.log("touchPos.y: " + touchPos.y);
                    // cc.log("bbox.x: " + bbox.x);
                    // cc.log("bbox.y: " + bbox.y);
                    // cc.log("bbox.width: " + bbox.width);
                    // cc.log("bbox.height: " + bbox.height);

                    if (touchPos.y > bbox.height*0.95) {
                        // cc.log("touched head");
                        AudioListener.getInstance().pauseListening();
                        self.adiSitdown();
                    }
                    if (touchPos.y < bbox.height*0.98 && touchPos.y > bbox.height*0.9 ){
                        // cc.log("touched nose");
                        AudioListener.getInstance().pauseListening();
                        self.adiSneeze();
                    }
                    if ((touchPos.x < (bbox.x+bbox.width*0.3) || touchPos.x > (bbox.x+bbox.width*0.7)) && touchPos.y > (bbox.y+bbox.height*0.3) && touchPos.y < (bbox.y+bbox.height*0.6)) {
                        // cc.log("touched hand");
                        AudioListener.getInstance().pauseListening();
                        self.adiHifi();
                    }
                    
                    if (touchPos.y < (bbox.y+bbox.height*0.4) && touchPos.x > (bbox.x+bbox.width*0.3) && touchPos.x < (bbox.x+bbox.width*0.7) ) {
                        // cc.log("touch belly");
                        AudioListener.getInstance().pauseListening();
                        self.adiJump();
                    }
                    
                    self.runAction(cc.sequence(
                            cc.delayTime(1.5),
                            cc.callFunc(function() {
                                self.adiIdling();
                                AudioListener.getInstance().resumeListening();
                                // AudioListener.getInstance().onStartedListening();
                            })
                        ))
                }

                return true;
            }
        }, this);
    },

    _createTalkingAdi: function(characterName) {
        cc.log("before creating adi");
        var name = CharacterManager.getInstance().getSelectedCharacter();
        if(!name) {
            name = "adi"
        };
        if(characterName)
            name = characterName;
        this._talkingAdi = new sp.SkeletonAnimation("characters/" + name + "/character.json", "characters/" + name + "/character.atlas", 0.3);
        this._talkingAdi.setCascadeOpacityEnabled(true);
        this._talkingAdi.setMix('idle', 'listeningstart', 0.2);
        this._talkingAdi.setMix('idle', 'talking', 0.2);
        this._talkingAdi.setMix('listeningstart', 'listeningl-still', 0.2);
        this._talkingAdi.setMix('listeningl-still', 'listeningfinish', 0.2);
        this._talkingAdi.setMix('listeningl-still', 'shake', 0.3);
        this._talkingAdi.setMix('listeningl-still', 'talking', 0.3);
        this._talkingAdi.setMix('listeningfinish', 'talking', 0.2);
        this._talkingAdi.setMix('listeningfinish', 'jump', 0.3);
        this._talkingAdi.setMix('jump', 'hifi', 0.2);
        this._talkingAdi.setMix('hifi', 'jump', 0.2);
        this._talkingAdi.setMix('shake', 'talking', 0.5);
        this._talkingAdi.setMix('talking', 'idle', 0.2);
        this._talkingAdi.setMix('talking', 'listeningstart', 0.2);

        this._talkingAdi.setMix('jump', 'idle', 0.2);
        this._talkingAdi.setMix('sneeze', 'idle', 0.2);
        this._talkingAdi.setMix('sitdown', 'idle', 0.2);
        this._talkingAdi.setMix('shake', 'idle', 0.2);

        // this._talkingAdi.setDebugSlotsEnabled(true);

        this._talkingAdi.setAnimation(0, 'idle', true);

        this.addChild(this._talkingAdi, 4);
        this._isAdiIdling = true;
        AudioListener.getInstance().setListener(this);
    },

    onStartedListening: function() {
        cc.log("onStartedListening");
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'listeningstart', false);
        this._talkingAdi.addAnimation(0, 'listeningl-still', true, 0.2);
    },

    onStoppedListening: function() {
        cc.log("onStoppedListening");
        this._talkingAdi.setAnimation(0, 'listeningfinish', false);
    },

    adiTalk: function() {
        this._talkingAdi.addAnimation(0, 'talking', true, 0.3);
    },

    adiShakeHead: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'shake', false);  
    },

    adiSneeze: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'sneeze', false);  
    },

    adiHifi: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'hifi', false);  
    },

    adiIdleHint: function() {
        this._talkingAdi.setAnimation(0, 'idle-hint', false);  
    },

    adiJump: function() {
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'jump', false);  
    },

    adiIdling: function() {
        this._isAdiIdling = true;
        // cc.log("setidling: " + this._isAdiIdling);
        this._talkingAdi.setAnimation(0, 'idle', true);
    },

    adiSitdown: function() {
        // cc.log("adiSitdown");
        this._isAdiIdling = false;
        this._talkingAdi.setAnimation(0, 'sitdown', false);
    }
});
