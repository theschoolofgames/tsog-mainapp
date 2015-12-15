var SpeechRecognitionListener = cc.Class.extend({
    _speakingLayer: null,

    setSpeakingLayer: function(layer) {
        this._speakingLayer = layer;
    },

    onSetupComplete: function(succeed, message) {
        cc.log("onSetupComplete: " + succeed + " " + message);
    },

    onResult: function(text) {
        text = text.replace(/ /g,'')
        cc.log("onResult: " + text);
        cc.log("currentObjectName." + this._speakingLayer.currentObjectName.toUpperCase());

        if (this._speakingLayer.currentObjectName.toUpperCase() == text) {
            cc.log("success");
            this._speakingLayer.correctAction();
        } else {
            this._speakingLayer.correctAction();
            // this._speakingLayer.incorrectAction();
        }
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