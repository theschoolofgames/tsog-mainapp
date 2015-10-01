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
        return request.status == 200 || request.readyState == 1 && request.status == 0
    },
    get: function (url, cb) {
        var request = cc.loader.getXMLHttpRequest();
        request.onreadystatechange = function () {
            if (RequestHelper.isSuccessHttpRequest(request)) {
                if (request.readyState == 4) cb && cb(true, request.responseText)
            } else {
                cb && cb(false, null)
            }
        };
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send();
    },
    post: function (url, data, cb) {
        var request = cc.loader.getXMLHttpRequest();
        request.onreadystatechange = function () {
            if (RequestHelper.isSuccessHttpRequest(request)) {
                if (request.readyState == 4) cb && cb(true, request.responseText)
            } else {
                cb && cb(false, null)
            }
        };
        request.open("POST", url);
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");

        request.send(data);
    }
};