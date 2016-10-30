var WRITINGTEST_OPERATION_TAG = 99;
var WritingTestForBuildingBlocks = WritingTestForFruidition.extend({

    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);
    },

    _fetchObjectData: function(data) {
        
        this._names = data["third"];
        this._data = data;

        this.setData(this._data);
        this._writingWords = this._names;
    },

});

var WritingTestForBuildingBlocksScene = cc.Scene.extend({
    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);

        WritingTestLayer.prepareData();
        var l = new WritingTestForBuildingBlocks(data, oldSceneName, isTestScene, timeForScene);
        this.addChild(l);
    },
});