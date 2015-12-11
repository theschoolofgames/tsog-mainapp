var AudioListener = cc.Class.extend({
    _talkingAdi: null,
    _playbackLength: 0,

    setAdi: function(adi) {
        if (adi == undefined || adi == null)
            return;

        this._talkingAdi = adi;
        cc.log("adi: " + this._talkingAdi);
    },

    onStartedListening: function() {
        cc.log("onStartedListening");
        this._talkingAdi.setAnimation(0, 'adidog-listeningstart', false);
        this._talkingAdi.addAnimation(0, 'adidog-listeningloop', true, 1);
    },

    // fileName: str
    // playbackLength: long (milisecond)
    onStoppedListening: function(fileName, playbackLength) {
        cc.log("onStoppedListening: " + fileName + " " + playbackLength);
        this._playbackLength = playbackLength;

        cc.eventManager.dispatchCustomEvent("chipmunkify");
    },

    onAudioChipmunkified: function(fileName) {
        cc.log("onAudioChipmunkified: " + fileName);

        var self = this;

        cc.audioEngine.setEffectsVolume(1);

        cc.director.getRunningScene().runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(function() {
                cc.audioEngine.unloadEffect(fileName);
                cc.audioEngine.playEffect(fileName);

                if (self._playbackLength > 0) {
                    self._talkingAdi.setAnimation(0, 'adidog-talking', true);
                    self._talkingAdi.addAnimation(0, 'adidog-idle', true, self._playbackLength);
                }

                else {
                    self._talkingAdi.setAnimation(0, 'adidog-listeningfinish', false);
                    self._talkingAdi.addAnimation(0, 'adidog-idle', true, 1);
                }
            }),
            cc.delayTime(self._playbackLength),
            cc.callFunc(function() {
                NativeHelper.callNative("startBackgroundSoundDetecting");
                self._talkingAdi.setAnimation(0, 'adidog-idle', true);
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