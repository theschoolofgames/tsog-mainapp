var SceneFlowController = cc.Class.extend({
    _preloopScenes: [],
    _loopScenes: [],
    _currentScenePool: [],

    _currentLoopSceneName: null,
    _previousSceneName: null,

    _currentPreLoopSceneIdx: 0,
    _currentLoopSceneIdx: 0,
    _totalSceneInStep: 0,
    _lastedStepPressed: null,
    _lastedStepUnlocked: null,

    ctor: function() {

        var sceneFlow = GAME_CONFIG.sceneFlow || UPDATED_CONFIG.sceneFlow;
        this._preloopScenes = sceneFlow.preLoopScreens;
        this._loopScenes = sceneFlow.loopScreens;
    },

    setLastedStepUnlocked: function(step) {
        this._lastedStepUnlocked = step || "";
        cc.log("this._lastedStepUnlocked: " + this._lastedStepUnlocked);
        KVDatabase.getInstance().set("lastedStepUnlocked", this._lastedStepUnlocked);
    },

    setTotalSceneInStep: function(totalSceneInStep) {
        this._totalSceneInStep = totalSceneInStep;
    },

    getNextSceneName: function() {
        var data = KVDatabase.getInstance().getString("sceneFlowCache");
        if (data == null || data == "")
            return;

        data = JSON.parse(data);

        this._currentStepIndex = data.currentStepIndex || 0;
        this._currentLoopSceneName = data.currentLoopSceneName || "";
        this._currentScenePool = data.currentScenePool || [];
        this._currentLoopSceneIdx = data.currentLoopSceneIdx || [];
        var scenePool = this._currentScenePool;
        var scenePoolKeys = Object.keys(scenePool);

        var sceneName;
        for (var i = 0; i < scenePoolKeys.length; i++) {
            var sceneData = scenePool[scenePoolKeys[i]];

            if (sceneData.name == this._currentLoopSceneName){
                if (scenePool[scenePoolKeys[i+1]]) {
                    sceneName = scenePool[scenePoolKeys[i+1]].name;

                    this._currentLoopSceneName = sceneName;
                    delete this._currentScenePool[scenePoolKeys[i]];
                    this.cacheData(this._currentStepIndex, this._currentLoopSceneIdx, this._currentLoopSceneName, this._currentScenePool);
                    break;
                }
                else
                    sceneName = null;
            }
        }

        cc.log("getNextSceneName: " + sceneName);
        return sceneName;
    },

    getLastedStepUnlocked: function() {
        return KVDatabase.getInstance().getString("lastedStepUnlocked", null);
    },

    getPreviousSceneName: function() {
        return this._previousSceneName;
    },

    getCurrentStep: function() {
        return this._currentStepIndex;
    },

    getLastedStepPressed: function() {
        return this._lastedStepPressed || "";
    },

    getCurrentSceneName: function() {
        return this._currentLoopSceneName;
    },

    getCurrentSceneIdx: function() {
        return this._currentLoopSceneIdx;
    },

    getTotalSceneInStep: function() {
        return this._totalSceneInStep;
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

    cacheData: function(stepIdx, sceneIdx, sceneName, scenePool) {
        // cc.log("stepIdx - sceneName - scenePool " + stepIdx + " - " + sceneName + " - " + JSON.stringify(scenePool));
        this._currentStepIndex = stepIdx;
        this._currentLoopSceneIdx = sceneIdx;
        this._currentLoopSceneName = sceneName;

        // var totalSceneInStep = Object.keys(scenePool).length;
        // this.setTotalSceneInStep(totalSceneInStep);

        KVDatabase.getInstance().set("sceneFlowCache", JSON.stringify({
            currentStepIndex: stepIdx,
            currentLoopSceneIdx: sceneIdx,
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
        this._lastedStepPressed = this._currentStepIndex;
        this._currentStepIndex = 0;
        this._currentLoopSceneIdx = 0;
        this._currentLoopSceneName = "";
        this._currentScenePool = [];
        // cc.log("clear cache data: " + JSON.stringify(KVDatabase.getInstance().getString("sceneFlowCache")))
    },

    clearLastedStepPressed: function() {
        this._lastedStepPressed = null;
    },

    moveToNextScene: function(sceneName, data, timeForScene) {
        var option = null;
        // if (data[0].option){
        //     data = data[0].data;
        //     option = data[0].option;
        // }
        // if (cc.director.getRunningScene().name == "balloon") {
        //     Utils.updateStepData();
        //     SceneFlowController.getInstance().clearData();
        //     cc.director.runScene(new MapScene());
        //     return;
        // }
        cc.log("moveToNextScene: " + sceneName);
        switch(sceneName) {
            case "room":
                cc.director.runScene(new RoomScene(data, timeForScene));
                break;
            case "listening":
                cc.director.runScene(new ListeningTestScene(data, timeForScene));
                break;
            case "speaking":
                cc.director.runScene(new SpeakingTestScene(data, timeForScene));
                break;
            case "shadow":
                cc.director.runScene(new ShadowGameScene(data, timeForScene));
                break;
            case "writing":
                cc.director.runScene(new WritingTestScene(data, timeForScene));
                break;
            case "forest":
                cc.director.runScene(new ForestScene(data, timeForScene));
                break;
            case "gofigure":
                option = data[0].option;
                cc.director.runScene(new GoFigureTestScene(data, option, timeForScene));
                break;
            case "card":
                cc.director.runScene(new CardGameScene(data, timeForScene));
                break;
            case "train":
                cc.director.runScene(new FormTheTrainScene(data, timeForScene));
                break;
            case "tree":
                cc.director.runScene(new TreeGameScene(data, timeForScene));
                break;
            case "balloon":
                cc.director.runScene(new BalloonGameScene(data, timeForScene));
                break;
            case "storytime":
                option = data[0].option;
                // cc.log("option: " + option);
                cc.director.runScene(new StoryMainScene(data, option, timeForScene));
                break;
            case "alpharacing":
                cc.director.runScene(new AlphaRacingScene(data, option, timeForScene));
                break;
            case "alphabet":
                cc.director.runScene(new AlphabetGameScene(data, option, timeForScene));
                break;
            case "shoppingbasket":
                cc.director.runScene(new ShoppingBasketScene(data, timeForScene));
                break;
            case "fruiddition":
                cc.director.runScene(new FruidditionGameScene(data, timeForScene));
                break;
            case "buildingblocks":
                cc.director.runScene(new BuildingBlocksScene(data));
                break;
            case "freecolor":
                // remove after implement free color game
                // Utils.updateStepData();
                // SceneFlowController.getInstance().clearData();
                // cc.director.runScene(new MapScene());
                // remove upper code after implement free color game

                cc.director.runScene(new FreeColorScene(data));
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
