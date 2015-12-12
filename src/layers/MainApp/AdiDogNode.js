var AdiDogNode = cc.Node.extend({
    _adiDogSpine: null,

    ctor: function() {
        this._super();

        this._createTalkingAdi();
    },

    _createTalkingAdi: function() {
        cc.log("before creating adi");
        this._adiDogSpine = new sp.SkeletonAnimation("adidog/adidog.json", "adidog/adidog.atlas", 0.3);
        // this._adiDogSpine.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));

        this._adiDogSpine.setMix('adidog-listeningloop', 'adidog-listeningfinish', 0.2);
        this._adiDogSpine.setMix('adidog-talking', 'adidog-idle', 0.2);
        this._adiDogSpine.addAnimation(0, 'adidog-idle', true);

        this.addChild(this._adiDogSpine, 4);

        AudioListener.getInstance().setAdi(this._adiDogSpine);
    },

    onStartedListening: function() {
        this._adiDogSpine.setAnimation(0, 'adidog-listeningstart', false);
        this._adiDogSpine.addAnimation(0, 'adidog-listeningloop', true, 1);
    },

    onStoppedListening: function() {
        this._adiDogSpine.setAnimation(0, 'adidog-listeningfinish', false);
        this._adiDogSpine.addAnimation(0, 'adidog-talking', true, 0.2);
    },

    adiTalk: function() {
        this._adiDogSpine.setAnimation(0, 'adidog-listeningfinish', false);
        this._adiDogSpine.addAnimation(0, 'adidog-idle', true, 1);
    },

    adiIdling: function() {
        this._adiDogSpine.setAnimation(0, 'adidog-idle', true);
    }
});
