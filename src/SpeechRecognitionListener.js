var SpeechRecognitionListener = cc.Class.extend({

    onSetupComplete: function(succeed, message) {
        cc.log("onSetupComplete: " + succeed + " " + message);
    },

    onResult: function(text) {
        cc.log("onResult: " + text);
    },

    onError: function(message) {
        cc.log("onError: " + message);
    }
});

SpeechRecognitionListener._instance = null;

SpeechRecognitionListener.getInstance = function () {
  return SpeechRecognitionListener._instance || SpeechRecognitionListener.setupInstance();
};

SpeechRecognitionListener.setupInstance = function () {
    SpeechRecognitionListener._instance = new SpeechRecognitionListener();
    return SpeechRecognitionListener._instance;
}