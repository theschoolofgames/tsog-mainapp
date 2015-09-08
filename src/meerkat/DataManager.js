var DataManager = cc.Class.extend({
    _schoolData: null,
    _gameData: null,

    ctor: function() {
        cc.assert(DataManager._instance == null, "can be instantiated once only");

        var schoolDataString = KVDatabase.getInstance().getString(STRING_SCHOOL_DATA);
        if (schoolDataString != "")
            this._schoolData = JSON.parse(schoolDataString);
        // else
        //     this._schoolData = SCHOOL_INFO;

        var gameDataString = KVDatabase.getInstance().getString(STRING_GAME_DATA);
        if (gameDataString != "")
            this._gameData = JSON.parse(gameDataString);
        else
            this._gameData = GAME_INFO;
    },

    getSchoolData: function() {
        return this._schoolData;
    },

    setSchoolData: function(data) {
        this._schoolData = data;
        KVDatabase.getInstance().set(STRING_SCHOOL_DATA, JSON.stringify(data));
    },

    getGameData: function() {
        return this._gameData;
    },
});

DataManager._instance = null;

DataManager.getInstance = function () {
  return DataManager._instance || DataManager.setupInstance();
};

DataManager.setupInstance = function () {
  DataManager._instance = new DataManager();
  return DataManager._instance;
};