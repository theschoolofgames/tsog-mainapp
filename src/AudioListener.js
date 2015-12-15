var AudioListener = cc.Class.extend({
    _talkingAdi: null,
    _playbackLength: 0,

    setListener: function(adi) {
        if (adi == undefined || adi == null)
            return;

        this._talkingAdi = adi;
        cc.log("adi: " + this._talkingAdi);
    },

    removeListener: function() {
        this._talkingAdi = null;
    },

    onStartedListening: function() {
        if (!this._talkingAdi)
            return;

        this._talkingAdi.onStartedListening();
    },

    // fileName: str
    // playbackLength: long (second)
    onStoppedListening: function(fileName, playbackLength) {
        if (!this._talkingAdi)
            return;

        cc.log("onStoppedListening: " + fileName + " " + playbackLength);
        this._playbackLength = playbackLength;

        cc.eventManager.dispatchCustomEvent("chipmunkify");
    },

    onAudioChipmunkified: function(fileName) {
        if (!this._talkingAdi)
            return;

        var self = this;
        cc.log("onAudioChipmunkified: " + fileName);

        cc.audioEngine.setEffectsVolume(1);

        cc.director.getRunningScene().runAction(cc.sequence(
            cc.delayTime(0),
            cc.callFunc(function() {
                if (self._playbackLength > 0) {
                    cc.log("_playbackLength: " + self._playbackLength);
                    cc.audioEngine.unloadEffect(fileName);
                    var audio = cc.audioEngine.playEffect(fileName);
                    self._talkingAdi.adiTalk();
                }
                else {
                    self._talkingAdi.onStoppedListening();
                    self._talkingAdi.adiIdling();
                }
            }),
            cc.delayTime(self._playbackLength),
            cc.callFunc(function() {
                NativeHelper.callNative("startBackgroundSoundDetecting");
                self._talkingAdi.adiIdling();
            })));
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