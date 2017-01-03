var WRITINGTEST_OPERATION_TAG = 99;
var WritingTestForBuildingBlocks = WritingTestForFruidition.extend({

    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);
    },

    // _fetchObjectData: function(data) {
    //     cc.log("WritingTestForBuildingBlocks \t _fetchObjectData \t " + JSON.stringify(data));
    //     this._names = data[0]["third"];
    //     this._data = data[0];

    //     cc.each(this._names, function(o) {
    //         o = Utils.getValueOfObjectById(o);
    //     });

    //     this.setData(this._data);
    //     this._writingWords = this._names;
    // },

});

var WritingTestForBuildingBlocksScene = cc.Scene.extend({
    ctor: function(data, oldSceneName, isTestScene, timeForScene) {
        this._super(data, oldSceneName, isTestScene, timeForScene);

        WritingTestLayer.prepareData();
        var l = new WritingTestForBuildingBlocks(data, oldSceneName, isTestScene, timeForScene);
        this.addChild(l);
    },
});