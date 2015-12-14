var SpeechRecognitionListener = cc.Class.extend({
    _speakingLayer: null,

    setSpeakingLayer: function(layer) {
        this._speakingLayer = layer;
    },

    onSetupComplete: function(succeed, message) {
        cc.log("onSetupComplete: " + succeed + " " + message);
    },

    onResult: function(text) {
        cc.log("onResult: " + text);
        cc.log("currentObjectName." + this._speakingLayer.currentObjectName.toUpperCase());

        if (this._speakingLayer.currentObjectName.toUpperCase() == text) {
            cc.log("success");
            this._speakingLayer.showNextObject();
        } else {
            var self = this;
            if (this._speakingLayer.checkTimeUp()) {    
                this._speakingLayer.timeUp();
                this._speakingLayer.runAction(
                    cc.sequence(
                        cc.delayTime(3),
                        cc.callFunc(function() {
                            cc.log("inside callFunc");
                            self._speakingLayer.showNextObject();
                        })        
                    )
                );
                
            }
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