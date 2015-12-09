var AudioListener = cc.Class.extend({
    _talkingAdi: null,

    setAdi: function(adi) {
        if (adi == undefined || adi == null)
            return;

        this._talkingAdi = adi;
        cc.log("adi: " + this._talkingAdi);
    },

    onStartedListening: function() {
        cc.log("onStartedListening");
        this._talkingAdi.setAnimation(0, 'ListeningStart', false);
        this._talkingAdi.addAnimation(0, 'ListeningLoop', true, 1);
    },

    // fileName: str
    // playbackLength: long (milisecond)
    onStoppedListening: function(fileName, playbackLength) {
        cc.log("onStoppedListening");

        if (playbackLength > 0)
            this._talkingAdi.setAnimation(0, 'Talking', true);
        else {
            this._talkingAdi.setAnimation(0, 'ListeningFinish', false);
            this._talkingAdi.addAnimation(0, 'Idle', true, 1);
        }

        cc.audioEngine.playEffect(fileName);
    }
});

AudioListener._instance = null;

AudioListener.getInstance = function () {
  return AudioListener._instance || AudioListener.setupInstance();
};

AudioListener.setupInstance = function () {
    AudioListener._instance = new AudioListener();
    return AudioListener._instance;
}