var AudioListener = cc.Class.extend({
    onStartedListening: function() {
        cc.log("onStartedListening");
    },

    // fileName: str
    // playbackLength: int (second)
    onStoppedListening: function(fileName, playbackLength) {
        cc.log("onStoppedListening");
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