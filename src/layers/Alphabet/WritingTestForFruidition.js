var WRITINGTEST_OPERATION_TAG = 99;
var WritingTestForFruidition = WritingTestLayer.extend({

    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);
    },

    _displayWord: function() {
        this._super();

        // this._characterNodes[0].x += this._characterNodes[0].width/2;
        this._addOperation(this._characterNodes[0]);
    },

    _addOperation: function(char) {
        this.removeChildByTag(WRITINGTEST_OPERATION_TAG);
        var ope = new cc.Layer();
        ope.tag = WRITINGTEST_OPERATION_TAG;
        ope.y = char.y;
        var lbFirst = new cc.LabelBMFont(this._data["first"][this._nameIdx], res.CustomFont_fnt);
        ope.addChild(lbFirst);

        var string = "+";
        if (this._data["firstOperation"][this._nameIdx] == "plus")
            string = "+";
        else
            string = "-";

        var lbFirstOperation = new cc.LabelBMFont(string, res.CustomFont_fnt);
        lbFirstOperation.x = lbFirst.x + lbFirst.width * lbFirst.scale + 15;
        ope.addChild(lbFirstOperation);

        var lbSecond = new cc.LabelBMFont(this._data["second"][this._nameIdx], res.CustomFont_fnt);
        lbSecond.x = lbFirstOperation.x + lbFirstOperation.width * lbFirstOperation.scale + 15;
        ope.addChild(lbSecond);

        var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
        secondOperation.x = lbSecond.x + lbSecond.width * lbSecond.scale + 15;
        ope.addChild(secondOperation);
        
        ope.width = lbFirst.width + lbFirstOperation.width + lbSecond.width + secondOperation.width;
        ope.height = lbFirst.height;
        ope.x = cc.rectGetMaxX(this._adiDog.getBoundingBox()) + ope.width/2 + 20;
        this.addChild(ope);
    },

    _fetchObjectData: function(data) {
        
        this._names = data["third"];
        this._data = data;

        this.setData(this._data);
        this._writingWords = this._names;
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