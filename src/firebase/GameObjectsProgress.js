var GameObjectsProgress = cc.Class.extend({
    _data: null,

    ctor: function() {

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

    countCompleted: function(gameObjectId) {
        var completedLevelIds = Object.keys(this._data[gameObjectId]["completedLevelIds"]);
        return completedLevelIds.length;
    },

    setCompleted: function(gameObjectId, levelId) {
        this._data[gameObjectId]["completedLevelIds"][levelId] = true;
        this._saveProgress();
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

var TEMP_DATA = {
    "word_a": {
        "completedLevelIds": {
            "1-1": true,
            "1-2": true,
            "1-3": true
        }
    },
    "word_b": {
        "completedLevelIds": {
            "2-1": true,
            "2-2": true
        }
    },
    "word_c": {
        "completedLevelIds": {
            "3-1": true
        }
    }
}