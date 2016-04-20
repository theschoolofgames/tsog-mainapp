var SceneFlowController = cc.Class.extend({
    _preloopScenes: [],
    _loopScenes: [],

    _currentPreLoopSceneIdx: 0,
    _currentLoopSceneIdx: 0,

    ctor: function() {

        var sceneFlow = GAME_CONFIG.sceneFlow || UPDATED_CONFIG.sceneFlow;
        this._preloopScenes = sceneFlow.preLoopScreens;
        this._loopScenes = sceneFlow.loopScreens;
    },

    getNextSceneName: function() {
        if (this._currentPreLoopSceneIdx < this._preloopScenes.length) {
            var sceneName = this._preloopScenes[this._currentPreLoopSceneIdx];
            this._currentPreLoopSceneIdx++;
            return sceneName;
        }

        var sceneName = this._loopScenes[this._currentLoopSceneIdx % this._loopScenes.length];
        this._currentLoopSceneIdx++;

        if (SpeakingTestLayer.shouldSkipTest && sceneName == "SpeakingTestScene")
            return this.getNextSceneName();

        return sceneName;
    },

    resetFlow: function() {
        this._currentLoopSceneIdx = this._currentPreLoopSceneIdx = 0;
    }
});

SceneFlowController._instance = null;

SceneFlowController.getInstance = function () {
    return SceneFlowController._instance || SceneFlowController.setupInstance();
};

SceneFlowController.setupInstance = function () {
    SceneFlowController._instance = new SceneFlowController();
    return SceneFlowController._instance;
};
