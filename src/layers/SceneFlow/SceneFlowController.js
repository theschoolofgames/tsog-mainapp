var SceneFlowController = cc.Class.extend({
    _preloopScenes: [],
    _loopScenes: [],
    _currentSceneData: null,

    _currentLoopSceneName: null,
    _previousSceneName: null,

    _currentStepIndex: null,
    _currentStepData: null,

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

    setSceneGoAfterRewardScene: function(sceneName) {
        KVDatabase.getInstance().set("sceneGoAfterRewardScene", sceneName);
    },

    getSceneGoAfterRewardScene: function() {
        return KVDatabase.getInstance().getString("sceneGoAfterRewardScene", "");
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
        cc.log("getNextSceneName data : %s", JSON.stringify(data));

        this._currentStepIndex = data.currentStepIndex || 0;
        this._currentLoopSceneName = data.currentLoopSceneName || "";
        this._currentSceneData = data.currentSceneData || [];
        this._currentLoopSceneIdx = data.currentLoopSceneIdx || 0;
        var scenePool = this._currentSceneData;
        var scenePoolKeys = Object.keys(scenePool);

        var sceneName;
        for (var i = 0; i < scenePoolKeys.length; i++) {
            var sceneData = scenePool[scenePoolKeys[i]];
            if (sceneData.name == this._currentLoopSceneName){
                if (scenePool[scenePoolKeys[i+1]]) {
                    sceneName = scenePool[scenePoolKeys[i+1]].name;

                    this._currentLoopSceneName = sceneName;
                    delete this._currentSceneData[scenePoolKeys[i]];
                    this.cacheData(this._currentStepIndex, this._currentLoopSceneIdx, this._currentLoopSceneName, this._currentSceneData);
                    break;
                }
                else
                    sceneName = null;
            }
        }

        return sceneName;
    },

    getNextSceneData: function() {
        var scenePoolKeys = Object.keys(this._currentSceneData);
        return this._currentSceneData[scenePoolKeys[0]].data;
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

    getCurrentStepData: function() {
        var dataArray = [];
        var gameIds = Object.keys(this._currentStepData);
        var firstGameName = this._currentStepData[gameIds[0]].name;

        if (firstGameName.indexOf("fruiddition") > -1) {
            var fruidditionData = this._currentStepData[gameIds[0]]["data"]["data"][0];
            // debugLog("fruidditionData -> " + JSON.stringify(fruidditionData));
            var totalOperation = fruidditionData["first"].length;
            for (var k = 0; k < totalOperation; k++) {
                var firstOpe = (fruidditionData["firstOperation"][k] == "plus") ? "+" : "-" ;
                var operationId = fruidditionData["first"][k] 
                                    + firstOpe
                                    + fruidditionData["second"][k]
                                    + "="
                                    + fruidditionData["third"][k];
                // debugLog("operationId -> " + operationId);
                dataArray.push(operationId);
            }
        } else 
            for (var i = 0; i < gameIds.length; i++) {
                var data = this._currentStepData[gameIds[i]].data;
                if (!cc.isObject(data[0])) // workaround
                    dataArray.push.apply(dataArray, data);
            }

        
        return dataArray;
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

    setStepData: function(stepData) {
        this._currentStepData = stepData;
    },

    resetFlow: function() {
        this._currentLoopSceneIdx = this._currentPreLoopSceneIdx = 0;
    },

    cacheData: function(stepIdx, sceneIdx, sceneName, sceneData) {
        this._currentStepIndex = stepIdx;
        this._currentLoopSceneIdx = sceneIdx;
        this._currentLoopSceneName = sceneName;

        KVDatabase.getInstance().set("sceneFlowCache", JSON.stringify({
            currentStepIndex: stepIdx,
            currentLoopSceneIdx: sceneIdx,
            currentLoopSceneName: sceneName,
            currentSceneData: sceneData
        }));
    },

    populateData: function() {
        var data = KVDatabase.getInstance().getString("sceneFlowCache");
        if (data == null || data == "")
            return;

        data = JSON.parse(data);

        this._currentPreLoopSceneIdx = data.currentPreLoopSceneIdx || 0;
        this._currentLoopSceneIdx = data.currentLoopSceneIdx || 0;
        this._currentSceneData = data.currentSceneData || 0;
    },

    clearData: function() {
        KVDatabase.getInstance().remove("sceneFlowCache");
        this._lastedStepPressed = this._currentStepIndex;
        this._currentStepIndex = 0;
        this._currentLoopSceneIdx = 0;
        this._currentLoopSceneName = "";
        this._currentSceneData = [];
        this._currentStepData = null;
    },

    clearLastedStepPressed: function() {
        this._lastedStepPressed = null;
    },

    moveToNextScene: function(sceneName, data, timeForScene, sceneOption) {
        cc.log("moveToNextScene -> data -> " + JSON.stringify(data));
        var option = null;
        var sceneNumber = KVDatabase.getInstance().getInt("scene_number");
        KVDatabase.getInstance().set("scene_number", sceneNumber + 1);
        cc.log("moveToNextScene: " + sceneName);
        switch(sceneName) {
            case "room":
                cc.director.runScene(new RoomScene(data, timeForScene));
                break;
            case "listening":
                cc.director.runScene(new ListeningTestScene(data, timeForScene));
                break;
            case "listening-fruiddition":
                cc.director.runScene(new ListeningTestForFruidditionScene(data, timeForScene));
                break;
            case "listening-buildingblocks":
                cc.director.runScene(new ListeningTestForBuildingBLocksScene(data, timeForScene));
                break;
            case "speaking":
                cc.director.runScene(new SpeakingTestScene(data, timeForScene));
                break;
            case "speaking-fruiddition":
                cc.director.runScene(new SpeakingTestForFruidditionScene(data, timeForScene));
                break;
            case "speaking-buildingblocks":
                cc.director.runScene(new SpeakingTestForBuildingBlocksScene(data, timeForScene));
                break;
            case "shadow":
                cc.director.runScene(new ShadowGameScene(data, timeForScene));
                break;
            case "writing":
                cc.director.runScene(new WritingTestScene(data, null, null, timeForScene));
                break;
            case "writing-fruiddition":
                cc.director.runScene(new WritingTestForFruidditionScene(data, null, null, timeForScene));
                break;
            case "writing-buildingblocks":
                cc.director.runScene(new WritingTestForBuildingBlocksScene(data, null, null, timeForScene));
                break;
            case "forest":
                cc.director.runScene(new ForestScene(data, timeForScene));
                break;
            case "gofigure":
                if (Array.isArray(data[0])) {
                    option = data[0].option;
                    data = data[0].data;
                } else {
                    option = null;
                    data = data;
                }

                if (Array.isArray(sceneOption))
                    option = sceneOption;

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
            case "spelling":
                cc.director.runScene(new SpellingGameScene(data, option, timeForScene));
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
                cc.director.runScene(new FreeColorScene(data, timeForScene));
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
