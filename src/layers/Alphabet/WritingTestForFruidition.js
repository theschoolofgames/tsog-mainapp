var WRITINGTEST_OPERATION_TAG = 99;
var WritingTestForFruidition = WritingTestLayer.extend({

    _currentOperation: [],

    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);
    },

    _displayWord: function() {
        this._super();

        // this._characterNodes[0].x += this._characterNodes[0].width/2;
        this._addOperation(this._characterNodes[0]);
    },

    _playObjSound: function(name, cb) {
        var localizedName = localize(name.toLowerCase());
        var soundPath = "res/sounds/sentences/" + currentLanguage + "/" 
                            + this._currentOperation[0] 
                            + "_" + this._data["firstOperation"][this._nameIdx] +"_" 
                            + this._currentOperation[1]
                            + "-writing" + ".mp3";

        cc.log("WritingTestForFruidition soundPath: --> " + soundPath);

        if (jsb.fileUtils.isFileExist(soundPath)) {
            var audioId = jsb.AudioEngine.play2d(soundPath, false);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                cb && cb();
            });
        } else {
            cb && cb();
        }
        
    },

    _addOperation: function(char) {
        this._currentOperation = [];
        this.removeChildByTag(WRITINGTEST_OPERATION_TAG);
        var ope = new cc.Layer();
        ope.anchorX = 0;
        ope.tag = WRITINGTEST_OPERATION_TAG;
        ope.y = char.y;

        var firstVal = this._data["first"][this._nameIdx];
        var rdmIdx = -1;
        if (Array.isArray(firstVal)) {
            rdmIdx = Math.floor(Math.random() * firstVal.length);
            firstVal = firstVal[rdmIdx];
        }

        var lbFirst = new cc.LabelBMFont(firstVal, res.CustomFont_fnt);
        ope.addChild(lbFirst);

        var string = "+";
        if (this._data["firstOperation"][this._nameIdx] == "plus")
            string = "+";
        else
            string = "-";

        var lbFirstOperation = new cc.LabelBMFont(string, res.CustomFont_fnt);
        lbFirstOperation.x = lbFirst.x + lbFirst.width * lbFirst.scale + 15;
        ope.addChild(lbFirstOperation);

        var secondVal = this._data["second"][this._nameIdx];
        if (rdmIdx > -1)
            secondVal = secondVal[rdmIdx];
        var lbSecond = new cc.LabelBMFont(secondVal, res.CustomFont_fnt);
        lbSecond.x = lbFirstOperation.x + lbFirstOperation.width * lbFirstOperation.scale + 15;
        ope.addChild(lbSecond);

        var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
        secondOperation.x = lbSecond.x + lbSecond.width * lbSecond.scale + 15;
        ope.addChild(secondOperation);
        

        this._currentOperation.push(firstVal);
        this._currentOperation.push(secondVal);
        ope.x = cc.rectGetMaxX(this._adiDog.getBoundingBox()) + 100 * Utils.screenRatioTo43();
        this.addChild(ope);
    },

    _fetchObjectData: function(data) {
        // cc.log("WritingTestForFruidition \t _fetchObjectData \t " + JSON.stringify(data));
        this._names = data[0]["third"];
        this._data = data[0];

        this._names = this._names.map(function(o) {
            return Utils.getValueOfObjectById(o);
        });

        this._data["first"] = this._data["first"].map(function(o) {
            return Utils.getValueOfObjectById(o);
        });

        this._data["second"] = this._data["second"].map(function(o) {
            return Utils.getValueOfObjectById(o);
        });
        // this.setData(this._data);
        this._writingWords = this._names;
        // cc.log("WritingTestForFruidition this._writingWords: " + this._writingWords);
        // cc.log("WritingTestForFruidition this._names: " + this._names);
    },

});

var WritingTestForFruidditionScene = cc.Scene.extend({
    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);

        WritingTestLayer.prepareData();
        var l = new WritingTestForFruidition(data, oldSceneName, isTestScene, timeForScene);
        this.addChild(l);
    },
});