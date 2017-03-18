var SpeechRecognitionListener = cc.Class.extend({
    _speakingLayer: null,

    ctor: function() {
        var excludeWords;

        cc.loader.loadJson("config/exclude_words.json", function(error, data) {
            excludeWords = data[currentLanguage];
        })

        var itemArray = FOREST_ITEMS.concat(BEDROOM_ITEMS).concat(NUMBER_CONFIG_ITEMS).concat(COLOR_CONFIG_ITEMS).map(function(obj) {
            if (obj.imageName.indexOf("btn") > -1) {
                // cc.log("obj.value: " + obj.value);
                return obj.value;
            }

            return obj.imageName;
        });

        itemArray = itemArray.map(function(obj) {
            cc.log(obj + " " + languagesForWriting[currentLanguage][obj]);
            return languagesForWriting[currentLanguage][obj];
        }).filter(function(obj) {
            var words = obj.split(" ");
            for (var i = 0; i < words.length; i++) {
                var w = words[i].toLowerCase();
                if (excludeWords.indexOf(w) >= 0)
                    return false;
            }
            return true;
        }).map(function(obj) {
            if (obj == "toytrain")
                return "toy train";

            return obj;
        })

        // cc.log("SpeechRecognitionListener:" + JSON.stringify(itemArray));

        NativeHelper.callNative("changeSpeechLanguageArray", [currentLanguage, JSON.stringify(itemArray)]);
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
        cc.log("currentObjectName: " + this._speakingLayer.currentObjectName.toUpperCase());

        // NUMBER_CONFIG_ITEMS.forEach(function(obj) {
        //     if (obj.value == text) {
        //         text = obj.imageName;
        //         return;
        //     }
        // });

        cc.log("after filter: " + text);
        text = text.toUpperCase();

        this._speakingLayer.resultText = text;

        var expectedAnswer = languagesForWriting[currentLanguage][this._speakingLayer.currentObjectName.toLowerCase()].toUpperCase();

        EkStepHelper.sendAssessEvent(expectedAnswer, text == expectedAnswer, text);

        if (expectedAnswer == text) {
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