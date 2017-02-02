var FirebaseManager = cc.Class.extend({

    _cbs: null,

    ctor: function () {
        cc.assert(FirebaseManager._instance == null, "can be instantiated once only");
    },
    
    init: function() {
        NativeHelper.setListener("Firebase", this);
        this._cbs = {};
    },

    isLoggedIn: function() {
        return NativeHelper.callNative("isLoggedIn");
    },

    login: function(callback) {
        this._cbs.login = callback;
        NativeHelper.callNative("login");
    },

    logout: function(callback) {
        this._cbs.logout = callback;
        NativeHelper.callNative("logout");
    },

    getUserInfo: function() {
        var data = NativeHelper.callNative("getUserInfo");
        debugLog("getUserInfo: " + data);
        return data;
    },

    authenticate: function() {
        debugLog("FirebaseManager.authenticate");
        if (! NativeHelper.callNative("isLoggedIn")) {
            return false;
        }

        User.setCurrentUser(this.getUserInfo());
        this._updateDataModel();
        return true;
    },

    setData: function(path, value) {
        var data = value;
        if (value instanceof Array || value instanceof Object)
            data = JSON.stringify(value);

        var method = "setData";
        if (typeof data === "number") {
            method = "setNumber";
        }
        NativeHelper.callNative(method, [path, data]);
    },

    fetchData: function(path, cb) {
        debugLog("fetchData: " + path);
        this._cbs.fetchData = cb;
        NativeHelper.callNative("fetchData", [path]);
    },

    createChildAutoId: function(path) {
        return NativeHelper.callNative("createChildAutoId", [path]);    
    },

    // callbacks
    onLoggedIn: function(succeed, msg) {
        var cb = this._cbs.login;
        delete this._cbs.login;

        this.authenticate();

        cb && cb(succeed, msg);
    },
    
    onLoggedOut: function() {
        var cb = this._cbs.logout;
        delete this._cbs.logout;

        User.logout();

        cb && cb();
    },

    onFetchedData: function(key, dataString) {
        var data;
        try {
            data = JSON.parse(dataString);
        } catch(e) {
            data = dataString;
        }
        var cb = this._cbs.fetchData;
        delete this._cbs.fetchData;
        cb && cb(key, data);
    },

    // private
    _updateDataModel: function() {
        debugLog("_updateDataModel");

        var self = this;

        var user = User.getCurrentUser();
        var waterfallPromises = [];

        // User
        waterfallPromises.push(function(cb) {
            var path = "users/" + user.uid;
            self.fetchData(path, function(key, data) {
                var nextPaths = [];

                if (!(data instanceof Object)) {
                    self.setData(path, {});
                    data = {};
                }

                if (!data.hasOwnProperty("children")) {
                    var childId = self.createChildAutoId("children");
                    data.children = [childId];
                    self.setData(path + "/children", data.children);

                    var childPath = "children/" + childId;
                    nextPaths.push(childPath);
                } else {
                    nextPaths = nextPaths.concat(data.children.map(function(cId) { return "children/" + cId; }));
                }

                user.populateFirebaseData(data);

                cb(null, nextPaths);
            });
        });

        // Children
        waterfallPromises.push(function(nextPaths, cb) {
            var parallelPromises = [];

            for (var i = 0; i < nextPaths.length; i++) {
                var path = nextPaths[i];

                if (path.startsWith("children")) {
                    parallelPromises.push(function(callback) {
                        self.fetchData(path, function(key, data) {
                            var shouldUpdate = false;

                            if (!(data instanceof Object)) {
                                data = {};
                                shouldUpdate = true;
                            }

                            if (!data.hasOwnProperty("coin")) {
                                data.coin = COIN_START_GAME;
                                shouldUpdate = true;
                            }

                            if (!data.hasOwnProperty("diamond")) {
                                data.diamond = DIAMOND_START_GAME;
                                shouldUpdate = true;
                            }

                            if (shouldUpdate)
                                self.setData(path, data);

                            var child = user.findChild(key);
                            cc.assert(child, "child with id " + key + " is null");
                            child.populateFirebaseData(data);
                            
                            callback(null);
                        })
                    })
                }
            }

            cc.async.parallel(parallelPromises, function(err, data) {
                cb(null);
            })
        });

        cc.async.waterfall(waterfallPromises, function(err, data) {
            
        })
    },
});

FirebaseManager._instance = null;

FirebaseManager.getInstance = function () {
  return FirebaseManager._instance || FirebaseManager.setupInstance();
};

FirebaseManager.setupInstance = function () {
    FirebaseManager._instance = new FirebaseManager();
    FirebaseManager._instance.init();
    return FirebaseManager._instance;
}