var WRITINGTEST_OPERATION_TAG = 99;
var WritingTestForBuildingBlocks = WritingTestForFruidition.extend({

    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);
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