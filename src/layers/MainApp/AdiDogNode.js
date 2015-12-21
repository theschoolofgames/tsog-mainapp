
var ADI_HEAD = "bone4";
var ADI_NOSE = "mui2";
var ADI_HAND_LEFT = "hand L 2";
var ADI_HAND_RIGHT = "hand R2";
var ADI_BELLY = "body2";
var ADI_SLOTS = [ADI_HEAD, ADI_NOSE, ADI_HAND_LEFT, ADI_HAND_RIGHT, ADI_BELLY];

var AdiDogNode = cc.Node.extend({
    _talkingAdi: null,
    _slots: [],

    listener: null,

    ctor: function(setActive) {
        this._super();

        this._createTalkingAdi();

        for( var i = 0; i < ADI_SLOTS.length; i++) {
            var slot = this._talkingAdi.findSlot(ADI_SLOTS[i]); 
            cc.log("slot: " + JSON.stringify(slot));

            this._slots.push();
        }

        if(setActive)
            this._addTouchEvent();
    },

    _addTouchEvent: function() {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                var self = event.getCurrentTarget();


                return true;
            }
        }, this);
    },

    _createTalkingAdi: function() {
        cc.log("before creating adi");
        this._talkingAdi = new sp.SkeletonAnimation("adidog/adidog.json", "adidog/adidog.atlas", 0.3);
        // this._talkingAdi.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));

        this._talkingAdi.setMix('adidog-idle', 'adidog-listeningstart', 0.2);
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
        this._talkingAdi.setAnimation(0, 'adidog-idle', true);

        this.addChild(this._talkingAdi, 4);

        AudioListener.getInstance().setListener(this);
    },

    onStartedListening: function() {
        cc.log("onStartedListening");
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
        this._talkingAdi.setAnimation(0, 'adidog-shake', false);  
    },

    adiSneeze: function() {
        this._talkingAdi.setAnimation(0, 'adidog-hatxi', false);  
    },

    adiHifi: function() {
        this._talkingAdi.setAnimation(0, 'adidog-hifi', false);  
    },

    adiIdleHint: function() {
        this._talkingAdi.setAnimation(0, 'adidog-idle-hint', false);  
    },

    adiJump: function() {
        this._talkingAdi.setAnimation(0, 'adidog-jump', false);  
    },

    adiIdling: function() {
        this._talkingAdi.setAnimation(0, 'adidog-idle', true);
    }
});
