// var GameObjectsProgress = cc.Class.extend({
//     _data: null,

//     ctor: function() {
//         this._data = {};
//         var data = KVDatabase.getInstance().getString(GAME_OBJECTS_PROGRESS, "");
//         if (data != "")
//             this._data = JSON.parse(data);
//         // else {
//         //     cc.loader.loadJson("res/config/progresstracker.json", function(err, loadedData) {
//         //         if (!err)
//         //             this._data = loadedData;
//         //     }.bind(this));
//         // }
//         cc.log("load data" + JSON.stringify(this._data));
//     },

//     _saveProgress: function() {
//         debugLog("_saveProgress -> " +  JSON.stringify(this._data));
//         KVDatabase.getInstance().set(GAME_OBJECTS_PROGRESS, JSON.stringify(this._data));
//     },

//     _checkProgress: function() {
//         debugLog(JSON.stringify(this._data));
//     },

//     countCompleted: function(gameObjectId) {
//         if(!this._data[gameObjectId] || !this._data[gameObjectId]["completedLevelIds"])
//             return 0;
//         var completedLevelIds = Object.keys(this._data[gameObjectId]["completedLevelIds"]);
//         return completedLevelIds.length;
//     },

//     setCompleted: function(gameObjectId, levelId) {
//         if (!this._data[gameObjectId]) {
//             this._data[gameObjectId] = {};
//             this._data[gameObjectId]["completedLevelIds"] = {};
//         }
//         this._data[gameObjectId]["completedLevelIds"][levelId] = true;
//         this._saveProgress();
//     },

//     getGameObjectsLearned: function() {
//         var gameObjectsLearnedArray = [];
//         var objectIdArray = Object.keys(this._data);
//         for (var i = 0; i < objectIdArray.length; i++) {
//             debugLog("getGameObjectsLearned -> objectIdArray -> " + objectIdArray[i]);
//             var count = this.countCompleted(objectIdArray[i]);
//             if (count > 0)
//                 gameObjectsLearnedArray.push(objectIdArray[i]);
//         }

//         return gameObjectsLearnedArray;
//     },
// });

// GameObjectsProgress._instance = null;

// GameObjectsProgress.getInstance = function() {
//     return GameObjectsProgress._instance || GameObjectsProgress.setupInstance();
// };

// GameObjectsProgress.setupInstance = function() {
//     GameObjectsProgress._instance = new GameObjectsProgress();
//     return GameObjectsProgress._instance;
// };
var GameObjectsProgress = BaseFirebaseModel.extend({
    _className: "GameObjectsProgress",

    ctor: function(id, initCallback) {
        this.fixCocosBugs();
        this.setDefaultValues({
            "completedGameObjects": {}
        });
        this._super("/gameObjectsProgress/" + id, id, ["completedGameObjects"], initCallback);
    },

    countCompleted: function(gameObjectId) {
        var completedGameObjects = this.getCompletedGameObjects();
        if (!completedGameObjects[gameObjectId] || !completedGameObjects[gameObjectId]["completedLevelIds"]) {
            return 0;
        }
        return Object.keys(completedGameObjects[gameObjectId]["completedLevelIds"]).length;
    },

    setCompleted: function(gameObjectId, levelId) {
        var completedGameObjects = this.getCompletedGameObjects();
        if (!completedGameObjects[gameObjectId]) {
            completedGameObjects[gameObjectId] = {};
            completedGameObjects[gameObjectId]["completedLevelIds"] = {};
        }
        completedGameObjects[gameObjectId]["completedLevelIds"][levelId] = true;
        this.setCompletedGameObjects(completedGameObjects);
    },

    getGameObjectsLearned: function() {
        var completedGameObjects = this.getCompletedGameObjects();
        var gameObjectsLearnedArray = [];
        var objectIdArray = Object.keys(completedGameObjects);
        for (var i = 0; i < objectIdArray.length; i++) {
            var count = this.countCompleted(objectIdArray[i]);
            if (count > 0) {
                gameObjectsLearnedArray.push(objectIdArray[i]);
            }
        }

        return gameObjectsLearnedArray;
    },

    setGameObjectsProgress: function(gameObjectIdArray, levelId) {
        for (var i = 0; i < gameObjectIdArray.length; i++) {
            this.setCompleted(gameObjectIdArray[i], levelId);
        }
    }
});
