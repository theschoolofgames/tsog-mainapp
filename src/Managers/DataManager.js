var DataManager = cc.Class.extend({
    _schoolData: null,

    ctor: function() {
        cc.assert(DataManager._instance == null, "can be instantiated once only");

        var schoolDataString = KVDatabase.getInstance().getString(STRING_SCHOOL_DATA);
        if (schoolDataString != "")
            this._schoolData = JSON.parse(schoolDataString);
        else
            this._schoolData = SCHOOL_INFO;
    },

    getSchoolData: function() {
        return this._schoolData;
    }
});

DataManager._instance = null;

DataManager.getInstance = function () {
  return DataManager._instance || DataManager.setupInstance();
};

DataManager.setupInstance = function () {
  DataManager._instance = new DataManager();
  return DataManager._instance;
};