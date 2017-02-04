var GameObjectsProgress = cc.Class.extend({
    _data: null,

    ctor: function() {
        this._data = {};
        var data = KVDatabase.getInstance().getString(GAME_OBJECTS_PROGRESS, "");
        if (data != "")
            this._data = JSON.parse(data);
        else {
            cc.loader.loadJson("res/config/progresstracker.json", function(err, loadedData) {
                if (!err)
                    this._data = loadedData;
            }.bind(this));
        }
        cc.log("load data" + JSON.stringify(this._data));
    },

    _saveProgress: function() {
        KVDatabase.getInstance().set(GAME_OBJECTS_PROGRESS, JSON.stringify(this._data));
    },

    _checkProgress: function() {
        debugLog(JSON.stringify(this._data));
    },

    countCompleted: function(gameObjectId) {
        cc.log("gameObjectId: " + gameObjectId);
        if(!this._data[gameObjectId] || !this._data[gameObjectId]["completedLevelIds"])
            return 0;
        cc.log("this._data[gameObjectId]: " + JSON.stringify(this._data[gameObjectId]));
        var completedLevelIds = Object.keys(this._data[gameObjectId]["completedLevelIds"]);
        debugLog("completedLevelIds -> " + completedLevelIds);
        return completedLevelIds.length;
    },

    setCompleted: function(gameObjectId, levelId) {
        debugLog("setCompleted -> " + gameObjectId);
        if (!this._data[gameObjectId]) {
            this._data[gameObjectId] = {};
            this._data[gameObjectId]["completedLevelIds"] = {};
        }
        this._data[gameObjectId]["completedLevelIds"][levelId] = true;
        this._saveProgress();
    },

    getGameObjectsLearned: function() {
        var gameObjectsLearnedArray = [];
        var objectIdArray = Object.keys(this._data);
        for (var i = 0; i < objectIdArray.length; i++) {
            // debugLog("objectIdArray -> " + objectIdArray[i]);
            var count = this.countCompleted(objectIdArray[i]);
            if (count > 0)
                gameObjectsLearnedArray.push(objectIdArray[i]);
        }

        return gameObjectsLearnedArray;
    },
});

GameObjectsProgress._instance = null;

GameObjectsProgress.getInstance = function() {
    return GameObjectsProgress._instance || GameObjectsProgress.setupInstance();
};

GameObjectsProgress.setupInstance = function() {
    GameObjectsProgress._instance = new GameObjectsProgress();
    return GameObjectsProgress._instance;
};

GameObjectsProgress.setGameObjectsProgress = function(gameObjectIdArray, levelId) {
    for (var i = 0; i < gameObjectIdArray.length; i++)
        GameObjectsProgress._instance.setCompleted(gameObjectIdArray[i], levelId);

    GameObjectsProgress._instance._checkProgress();
    debugLog("getGameObjectsLearned -> " + GameObjectsProgress._instance.getGameObjectsLearned());

};

