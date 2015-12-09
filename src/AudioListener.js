var AudioListener = cc.Class.extend({
    _talkingAdi: null,

    setAdi: function(adi) {
        if (adi == undefined || adi == null)
            return;

        this._talkingAdi = adi;
        cc.log("adi: " + this._talkingAdi);
    },

    onStartedListening: function() {
        this._talkingAdi.setAnimation(0, 'ListeningFinish', false);
        this._talkingAdi.addAnimation(0, 'Idle', true, 1);
        cc.log("onStartedListening");
    },

    // fileName: str
    // playbackLength: int (second)
    onStoppedListening: function(fileName, playbackLength) {
        cc.log("onStoppedListening");
        if (playbackLength > 0)
            this._talkingAdi.setAnimation(0, 'Talking', true);
        else 
            this._talkingAdi.setAnimation(0, 'Idle', true);
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