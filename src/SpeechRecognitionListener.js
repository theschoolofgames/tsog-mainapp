var SpeechRecognitionListener = cc.Class.extend({
    _speakingLayer: null,

    ctor: function() {
        // cc.log(JSON.stringify(FOREST_ITEMS.concat(BEDROOM_ITEMS)));
        cc.log(JSON.stringify(NUMBER_ITEMS));

        var itemArray = FOREST_ITEMS.concat(BEDROOM_ITEMS).concat(NUMBER_ITEMS).map(function(obj) {
            return obj.imageName;
        });

        itemArray = itemArray.map(function(obj) {
            if (obj == "toytrain")
                return "toy train";
            return obj;
        });

        // cc.log("SpeechRecognitionListener:" + JSON.stringify(itemArray));

        NativeHelper.callNative("changeSpeechLanguageArray", [JSON.stringify(itemArray)]);
    },

    setSpeakingLayer: function(layer) {
        this._speakingLayer = layer;
    },

    onSetupComplete: function(succeed, message) {
        cc.log("onSetupComplete: " + succeed + " " + message);
    },

    onResult: function(text) {
        text = text.replace(/ /g,'');
        cc.log("onResult: " + text);
        cc.log("currentObjectName." + this._speakingLayer.currentObjectName.toUpperCase());

        NUMBER_ITEMS.map(function(obj) {
            if (obj.value == text) {
                text = obj.imageName;
                return;
            }

        });

        this._speakingLayer.resultText = text.toUpperCase();
        if (this._speakingLayer.currentObjectName.toUpperCase() == text) {
            cc.log("success");
            this._speakingLayer.correctAction();
        } else {
            // this._speakingLayer.correctAction();
            this._speakingLayer.incorrectAction();
        }
        // this._speakingLayer.addResultText(this._speakingLayer.resultText);
    },

    onError: function(message) {
        cc.log("onError: " + message);
    },

    // For Android only
    onPartialResult: function(text) {
        text = text.replace(/ /g,'');
        if (this._speakingLayer.currentObjectName.toUpperCase() == text) {
            NativeHelper.callNative("stopSpeechRecognition");
        }
    },
});

SpeechRecognitionListener._instance = null;

SpeechRecognitionListener.getInstance = function () {
  return SpeechRecognitionListener._instance || SpeechRecognitionListener.setupInstance();
};

SpeechRecognitionListener.setupInstance = function () {
    SpeechRecognitionListener._instance = new SpeechRecognitionListener();
    return SpeechRecognitionListener._instance;
}