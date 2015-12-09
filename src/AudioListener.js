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
        cc.log("onStoppedListening: " + fileName + " " + playbackLength);

        cc.director.getRunningScene().runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(function() {
                cc.audioEngine.unloadEffect(fileName);
                cc.audioEngine.playEffect(fileName);

                if (playbackLength > 0)
                    this._talkingAdi.setAnimation(0, 'Idle', true);
                else {
                    this._talkingAdi.setAnimation(0, 'ListeningFinish', false);
                    this._talkingAdi.addAnimation(0, 'Idle', true, 1);
                }
            }),
            cc.delayTime(playbackLength/1000),
            cc.callFunc(function() {
                NativeHelper.callNative("startBackgroundSoundDetecting");
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