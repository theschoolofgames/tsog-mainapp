var RequestsManager = cc.Class.extend({
    _encode: true,
    _encryption: false,
    ctor: function () {
        cc.assert(RequestsManager._instance == null, "can be instantiated once only");
    },

    getSchools: function(callback) {
        var url = BACKEND_ADDRESS + "api/schools";

        RequestHelper.get(url, function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
               callback && callback(false, null);
        });
    },

    createSchool: function(name, callback) {
        var url = BACKEND_ADDRESS + "api/schools";

        var self = this;

        var data = {
            name: name
        };

        // cc.log(JSON.stringify(data));

        RequestHelper.post(url, JSON.stringify(data), function(succeed, responseText) {
            var data = JSON.parse(responseText);
            callback && callback(succeed, data);
        });
    },

    createStudent: function(name, userId, avatar, password, callback) {
        var url = BACKEND_ADDRESS + "api/students";

        var self = this;

        var data = {
            name: name,
            userId: userId,
            avatar: avatar,
            password: password
        };

        // console.log(JSON.stringify(data));

        RequestHelper.post(url, JSON.stringify(data), function(succeed, responseText) {
            var data = JSON.parse(responseText);
            callback && callback(succeed, data);
        });
    },

    createAccount: function(username, password, callback) {
        var url = BACKEND_ADDRESS + "api/register";

        var data = {
            username: username,
            password: password
        };

        RequestHelper.post(url, JSON.stringify(data), function(succeed, responseText) {
            var data = JSON.parse(responseText);
            if (succeed) {
                KVDatabase.getInstance().set(STRING_USER_ACCESS_TOKEN, data["access_token"]);
                KVDatabase.getInstance().set(STRING_USER_NAME, data["user_name"]);
                KVDatabase.getInstance().set(STRING_USER_ID, data["user_id"]);
                KVDatabase.getInstance().set("isLoggedIn", 1);                
            }
            callback && callback(succeed, data);
        });
    },

    login: function(username, password, callback) {
        var url = BACKEND_ADDRESS + "api/login";

        var data = {
            username: username,
            password: password
        }

        RequestHelper.post(url, JSON.stringify(data), function(succeed, responseText) {
            var data = JSON.parse(responseText);
            if (succeed) {
                KVDatabase.getInstance().set(STRING_USER_ACCESS_TOKEN, data["access_token"]);
                KVDatabase.getInstance().set(STRING_USER_NAME, data["user_name"]);
                KVDatabase.getInstance().set(STRING_USER_ID, data["user_id"]);
                KVDatabase.getInstance().set("isLoggedIn", 1);
            }
            callback && callback(succeed, data);
        });        
    },

    getUserInfo: function(userId, callback) {
        var url = BACKEND_ADDRESS + "api/user?user_id=" + userId;

        RequestHelper.get(url, function(succeed, responseText) {
            console.log("getUserInfo -> " + JSON.stringify(responseText));
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
                callback && callback(false, null);
        });
    },
    
    getAccounts: function(schoolId, callback) {
        var url = BACKEND_ADDRESS + "api/accounts?school_id=" + schoolId;

        RequestHelper.get(url, function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
                callback && callback(false, null);
        });
    },

    getStudents: function(userId, callback) {
        var url = BACKEND_ADDRESS + "api/students?user_id=" + userId;

        RequestHelper.get(url, function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
                callback && callback(false, null);
        });
    },

    getGames: function(userId, callback) {
        var url = BACKEND_ADDRESS + "api/games?user_id=" + userId;

        RequestHelper.get(url, function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
                callback && callback(false, null);
        });
    },

    getGame: function(gameId, callback) {
        var url = BACKEND_ADDRESS + "api/game?game_id=" + gameId;

        RequestHelper.get(url, function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            }
            else
                callback && callback(false, null);
        });
    },

    postGameProgress: function(userId, gameId, star, timeTaken, callback) {
        var url = BACKEND_ADDRESS + "api/gameProgress";
        var self = this;

        var data = {
            user_id: userId,
            game_id: gameId,
            data: {
                star: star,
                time_taken: timeTaken
            }
        };

        RequestHelper.post(url, JSON.stringify(data), function(succeed, responseText) {
            if (succeed) {
                var data = JSON.parse(responseText);
                callback && callback(true, data);
            } else
                callback && callback(false, null);
        });
    }    
});

RequestsManager._instance = null;

RequestsManager.getInstance = function () {
    return RequestsManager._instance || RequestsManager.setupInstance();
};

RequestsManager.setupInstance = function () {
    RequestsManager._instance = new RequestsManager();
    return RequestsManager._instance;
};

var RequestHelper = {
    isSuccessHttpRequest: function (request) {
        return request.status == 200 && request.readyState == 4
    },
    get: function (url, cb) {
        var request = cc.loader.getXMLHttpRequest();
        request.onreadystatechange = function () {
            if (RequestHelper.isSuccessHttpRequest(request)) {
                cb && cb(true, request.responseText)
            } else {
                cb && cb(false, request.responseText)
            }
        };
        request.onerror = function() {
            cb && cb(false, null)
        };
        request.ontimeout = function() {
            cb && cb(false, null)  
        };
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send();
    },
    post: function (url, data, cb, authName, authPass) {
        var request = cc.loader.getXMLHttpRequest();
        request.onreadystatechange = function () {
            if (RequestHelper.isSuccessHttpRequest(request)) {
                cb && cb(true, request.responseText)
            } else {
                cb && cb(false, request.responseText)
            }
        };
        request.onerror = function() {
            cb && cb(false, null)
        };
        request.ontimeout = function() {
            cb && cb(false, null)  
        };
        request.open("POST", url);
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        if (authName != null && authPass != null)
            request.setRequestHeader("Authorization", "Basic " + Base64.encode(authName + ":" + authPass)); 

        request.send(data);
    }
};