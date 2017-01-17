var DataManager = cc.Class.extend({
    _schoolData: null,
    _accountData: {},
    _studentData: {},
    _gameData: {},

    ctor: function() {
        cc.assert(DataManager._instance == null, "can be instantiated once only");

        var schoolDataString = KVDatabase.getInstance().getString(STRING_SCHOOL_DATA);
        if (schoolDataString != "")
            this._schoolData = JSON.parse(schoolDataString);
        else {
            cc.loader.loadJson("config/default_school.json", function(err, data) {
                this._schoolData = data;
            });
        }

        // Account currently is Student
        // var accountDataString = KVDatabase.getInstance().getString(STRING_ACCOUNT_DATA);
        // cc.log("DataManager accountDataString: " + JSON.stringify(accountDataString));
        // if (accountDataString != "")
        //     this._accountData = JSON.parse(accountDataString);

        var studentDataString = KVDatabase.getInstance().getString(STRING_STUDENT_DATA);
        // cc.log("DataManager studentDataString: " + JSON.stringify(studentDataString));
        if (studentDataString != "")
            this._studentData = JSON.parse(studentDataString);

        var gameDataString = KVDatabase.getInstance().getString(STRING_GAME_DATA);
        if (gameDataString != "")
            this._gameData = JSON.parse(gameDataString);
        // else
        //     this._gameData = GAME_INFO;
    },

    getSchoolData: function() {
        return this._schoolData;
    },

    setSchoolData: function(data) {
        this._schoolData = data;
        KVDatabase.getInstance().set(STRING_SCHOOL_DATA, JSON.stringify(data));
    },

    getSchoolConfig: function(schoolId) {
        var schoolData = this.getSchoolData();
        var schoolConfig = "";
        for (var i = 0; i < schoolData.length; i++) {
            if (schoolData[i].school_id == schoolId)
                schoolConfig = schoolData[i];
        }

        return schoolConfig;
    },

    getAccountData: function(schoolId) {
        return this._accountData[schoolId];
    },

    setAccountData: function(schoolId, data) {
        this._accountData[schoolId] = data;
        KVDatabase.getInstance().set(STRING_ACCOUNT_DATA, JSON.stringify(this._accountData));
    },

    getStudentData: function(userId) {
        return this._studentData[userId];
    },

    setStudentData: function(userId, data) {
        this._studentData[userId] = data;
        KVDatabase.getInstance().set(STRING_STUDENT_DATA, JSON.stringify(this._studentData));
    },

    getGameData: function(userId) {
        return this._gameData[userId];
    },

    setGameData: function(userId, data) {
        this._gameData[userId] = data;
        KVDatabase.getInstance().set(STRING_GAME_DATA, JSON.stringify(this._gameData));  
    },
    setDataAlpharacing: function(data) {
        var currentData = JSON.parse(KVDatabase.getInstance().getString(STRING_GAME_ALPHARACING, "[]"));
        if (currentData.length == 0)
            currentData = ["GAME"];

        if (data.value)
            if (currentData.indexOf(data.value) >= 0)
                return;

        if (data.value && data.value.length > 1) {
            if (data.value.indexOf("color") > -1 || data.value.indexOf("btn") > -1) {
                data.value = data.value.substr(data.value.indexOf("_") + 1, data.value.length-1);
            };
            currentData.push(data.value.toUpperCase());
        }

        KVDatabase.getInstance().set(STRING_GAME_ALPHARACING, JSON.stringify(currentData));

        // if(currentData.length == 0)
        //     currentData = 
        //         [
        //             {
        //               "value": "A",
        //               "amount" : 20
        //             }
        //         ];
        // if(data.value) {
        //     for(var i = 0; i < currentData.length; i++ ) {
        //         if(currentData[i].value == data.value)
        //             return;
        //     }
        // };
        // if(data.value &&  (data.value.length == 1)){
        //     currentData.push({
        //         "value": data.value,
        //         "amount": 20
        //     })
        // };
        // KVDatabase.getInstance().set(STRING_GAME_ALPHARACING, JSON.stringify(currentData))
    },
    getDataAlpharacing: function(){
        var currentData = JSON.parse(KVDatabase.getInstance().getString(STRING_GAME_ALPHARACING, "[]"));

        currentData = currentData.map(d => {
            if (d instanceof Object)
                return d.value;
            return d;
        })

        if (currentData.length == 0)
            currentData = ["GAME"];

        // cc.log("currentData == []: " + (currentData == []));
        // if(currentData.length == 0)
        //     currentData = 
        //         [
        //             {
        //               "value": "A",
        //               "amount" : 20
        //             }
        //         ];
        return currentData.map(d => {
            return {
                value: d,
                amount: 20
            }
        });
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