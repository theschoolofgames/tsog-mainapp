var SceneFlowController = cc.Class.extend({
    _preloopScenes: [],
    _loopScenes: [],
    _currentScenePool: [],

    _currentLoopSceneName: null,
    _previousSceneName: null,

    _currentPreLoopSceneIdx: 0,
    _currentLoopSceneIdx: 0,

    ctor: function() {

        var sceneFlow = GAME_CONFIG.sceneFlow || UPDATED_CONFIG.sceneFlow;
        this._preloopScenes = sceneFlow.preLoopScreens;
        this._loopScenes = sceneFlow.loopScreens;
    },

    getNextSceneName: function() {
        var data = KVDatabase.getInstance().getString("sceneFlowCache");
        if (data == null || data == "")
            return;
        cc.log("SceneFlowController: " + data);
        data = JSON.parse(data);

        this._currentLevelIndex = data.currentLevelIndex || 0;
        this._currentLoopSceneName = data.currentLoopSceneName || "";
        this._currentScenePool = data.currentScenePool || [];
        var scenePool = this._currentScenePool;
        var scenePoolKeys = Object.keys(scenePool);
        cc.log("scenePool: " + JSON.stringify(scenePool));
        cc.log("_currentScenePool: " + this._currentScenePool);
        cc.log("this._currentLoopSceneName: " + this._currentLoopSceneName);
        var sceneName;
        for (var i = 0; i < scenePoolKeys.length; i++) {
            var sceneData = scenePool[scenePoolKeys[i]];
            // cc.log("scenePoolKeys.length : " + scenePoolKeys.length);
            cc.log("scene name: " + sceneData.name);
            if (sceneData.name == this._currentLoopSceneName){
                // cc.log("this._currentLoopSceneName: " + this._currentLoopSceneName);
                if (scenePool[scenePoolKeys[i+1]]) {
                    sceneName = scenePool[scenePoolKeys[i+1]].name;

                    this._currentLoopSceneName = sceneName;
                    delete this._currentScenePool[scenePoolKeys[i]];
                    this.cacheData(this._currentLevelIndex, this._currentLoopSceneName, this._currentScenePool);
                    break;
                }
                else
                    sceneName = null;
            }
        }
        // cc.log("this._currentLevelIndex: " + this._currentLevelIndex);
        // cc.log("this._currentLoopSceneName: " + this._currentLoopSceneName);
        // cc.log("this._currentScenePool: " + JSON.stringify(this._currentScenePool));
        cc.log("getNextSceneName: " + sceneName);
        return sceneName;
    },

    getPreviousSceneName: function() {
        return this._previousSceneName;
    },

    getNextRoomOrForestScene: function() {
        var sceneName = this.getNextSceneName();
        while(sceneName != "RoomScene" && sceneName != "ForestScene")
            sceneName = this.getNextSceneName();

        return sceneName;
    },

    resetFlow: function() {
        this._currentLoopSceneIdx = this._currentPreLoopSceneIdx = 0;
    },

    cacheData: function(levelIdx, sceneName, scenePool) {
        cc.log("levelIdx - sceneName - scenePool " + levelIdx + sceneName + JSON.stringify(scenePool));
        KVDatabase.getInstance().set("sceneFlowCache", JSON.stringify({
            currentLevelIndex: levelIdx,
            currentLoopSceneName: sceneName,
            currentScenePool: scenePool
        }));
    },

    populateData: function() {
        var data = KVDatabase.getInstance().getString("sceneFlowCache");
        if (data == null || data == "")
            return;
        cc.log("SceneFlowController: " + data);
        data = JSON.parse(data);

        this._currentPreLoopSceneIdx = data.currentPreLoopSceneIdx || 0;
        this._currentLoopSceneIdx = data.currentLoopSceneIdx || 0;
    },

    clearData: function() {
        KVDatabase.getInstance().remove("sceneFlowCache");
        this._currentLevelIndex = 0;
        this._currentLoopSceneName = "";
        this._currentScenePool = [];
        cc.log("clear cache data: " + JSON.stringify(KVDatabase.getInstance().getString("sceneFlowCache")))
    },

    moveToNextScene: function(sceneName, data) {
        switch(sceneName) {
            case "room":
                cc.director.runScene(new RoomScene(data));
                break;
            case "listening":
                cc.director.runScene(new ListeningTestScene(data));
                break;
            case "speaking":
                cc.director.runScene(new SpeakingTestScene(data));
                break;
            case "shadow":
                cc.director.runScene(new ShadowGameScene(data));
                break;
            case "writing":
                cc.director.runScene(new WritingTestScene(data));
                break;
            case "forest":
                cc.director.runScene(new ForestScene(data));
                break;
            case "gofigure":
                cc.director.runScene(new GoFigureTestScene(data));
                break;
            case "card":
                cc.director.runScene(new CardGameScene(data));
                break;
            case "train":
                cc.director.runScene(new FormTheTrainScene(data));
                break;
            case "tree":
                cc.director.runScene(new TreeGameScene(data));
                break;
            case "balloon":
                cc.director.runScene(new BalloonGameScene(data));
                break;
            case "storytime":
                cc.director.runScene(new StoryMainScene(data));
                break;
            default:
                break;
        }
    },
});

SceneFlowController._instance = null;

SceneFlowController.getInstance = function () {
    return SceneFlowController._instance || SceneFlowController.setupInstance();
};

SceneFlowController.setupInstance = function () {
    SceneFlowController._instance = new SceneFlowController();
    return SceneFlowController._instance;
};
