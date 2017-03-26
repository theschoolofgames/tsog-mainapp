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

    getFireBaseAuthInfo: function() {
        var data = NativeHelper.callNative("getUserInfo");
        debugLog("getFireBaseAuthInfo: " + data);
        return data;
    },

    authenticate: function(finishCallback) {
        debugLog("FirebaseManager.authenticate");
        var data = {};
        var isLinked = NativeHelper.callNative("isLoggedIn");
        var isNewAccount = false;
        var authenticateUID = KVDatabase.getInstance().getString("authenticateUID", "");
        if (authenticateUID != "" && isLinked) {
            data = this.getFireBaseAuthInfo();
        } else {
            if (!authenticateUID) {
                isNewAccount = true;
                authenticateUID = this.createChildAutoId("users");
                KVDatabase.getInstance().set("authenticateUID", authenticateUID);
            }
            data = {
                "email": "",
                "photoUrl": "",
                "uid": authenticateUID,
                "name": ""
            };
            data = JSON.stringify(data);
        }

        debugLog("authenticate data " + data);
        User.setCurrentUser(data, function(found) {
            debugLog("setCurrentUser found: " + found);
            var user = User.getCurrentUser();
            
            user.fetchDependencies(function() {
                debugLog("Loadded current user's dependencies");

                debugLog("user: " + JSON.stringify(user));
                if (user.getChildren().length == 0) {
                    user.createChild();
                }
                user.selectChild(user.getChildrenIds()[0], function() {
                    finishCallback(true, isLinked);
                });

                var inviteeId = user.getId();
                var inviterId = KVDatabase.getInstance().getString("inviterId");

                if (inviteeId && inviterId && inviterId != inviteeId) {
                    KVDatabase.getInstance().remove("inviterId");
                    var path = "invitations/" + inviteeId;
                    FirebaseManager.getInstance().fetchData(path, function(key, data, isNull, fullPath) {
                        if (key == inviteeId && isNull) {
                            Invitation.create(inviteeId, inviterId);
                        }
                    });
                }

                var dynamicLink = user.getDynamicLink();
                var postedData = {
                    "longDynamicLink": cc.formatStr(DYNAMIC_LINK, inviteeId)
                };
                if (!dynamicLink) {
                    RequestHelper.post(LINK_SHORTEN_API, JSON.stringify(postedData), function(succeed, responseText) {
                        if (succeed) {
                            var data = JSON.parse(responseText);
                            data && user.setDynamicLink(data["shortLink"]);
                        } else {
                            var longLink = cc.formatStr(DYNAMIC_LINK, inviteeId);
                            user.setDynamicLink(longLink);
                        }
                    });
                } else {
                    if (dynamicLink.indexOf("?link=") > -1) {
                        RequestHelper.post(LINK_SHORTEN_API, JSON.stringify(postedData), function(succeed, responseText) {
                            if (succeed) {
                                var data = JSON.parse(responseText);
                                data && user.setDynamicLink(data["shortLink"]);
                            }
                        });
                    }
                }
            });
        });
        if (isNewAccount)
            User.getCurrentUser().create();

        FirebaseManager.getInstance().fetchConfig(0, function(succeed, data) {
            this._setRemoteConstantsValue(data);
        }.bind(this));

    },

    link: function(finishCallback) {
        var linkedAccountInfo = this.getFireBaseAuthInfo();
        debugLog("linkedAccountInfo -> " + linkedAccountInfo);
        var linkedId = linkedAccountInfo.uid;
        var oldUser = User.getCurrentUser();

        User.setCurrentUser(linkedAccountInfo, function(found) {
            debugLog("setCurrentUser found: " + found);
            var user = User.getCurrentUser();
            if (!found) {
                user.create();
                user.setChildrenIds(oldUser.getChildrenIds());
            }
            user.fetchDependencies(function() {
                debugLog("Loaded current user's dependencies");

                debugLog("user: " + JSON.stringify(user));
                if (user.getChildren().length == 0) {
                    user.createChild();
                }
                user.selectChild(user.getChildrenIds()[0], function() {
                    finishCallback(true);
                });
                var inviteeId = linkedAccountInfo.uid;
                var dynamicLink = user.getDynamicLink();
                var postedData = {
                    "longDynamicLink": cc.formatStr(DYNAMIC_LINK, inviteeId)
                };
                if (!dynamicLink) {
                    RequestHelper.post(LINK_SHORTEN_API, JSON.stringify(postedData), function(succeed, responseText) {
                        if (succeed) {
                            var data = JSON.parse(responseText);
                            data && user.setDynamicLink(data["shortLink"]);
                        } else {
                            var longLink = cc.formatStr(DYNAMIC_LINK, inviteeId);
                            user.setDynamicLink(longLink);
                        }
                    });
                } else {
                    if (dynamicLink.indexOf("?link=") > -1) {
                        RequestHelper.post(LINK_SHORTEN_API, JSON.stringify(postedData), function(succeed, responseText) {
                            if (succeed) {
                                var data = JSON.parse(responseText);
                                data && user.setDynamicLink(data["shortLink"]);
                            }
                        });
                    }
                }
            });
        });
    },

    _setRemoteConstantsValue: function(data) {
        var config = JSON.parse(data);
        OBJECT_TOTAL_COMPLETED_COUNT = config["object_total_completed_count"] || OBJECT_TOTAL_COMPLETED_COUNT;

        SET_SMALL_COINS = config["set_1_coins"] || SET_SMALL_COINS;
        SET_SMALL_DIAMONDS = config["set_1_diamonds"] || SET_SMALL_DIAMONDS;

        SET_MEDIUM_COINS = config["set_2_coins"] || SET_MEDIUM_COINS;
        SET_MEDIUM_DIAMONDS = config["set_2_diamonds"] || SET_MEDIUM_DIAMONDS;

        SET_BIG_COINS = config["set_3_coins"] || SET_BIG_COINS;
        SET_BIG_DIAMONDS = config["set_3_diamonds"] || SET_BIG_DIAMONDS;

        NEW_LEVEL_UNLOCKING_STAR_RATIO = config["new_level_unlocking_star_ratio"] || NEW_LEVEL_UNLOCKING_STAR_RATIO;

        KVDatabase.getInstance().set(NEWEST_VERSION_IOS_TAG, config["app_version_ios"]);
        KVDatabase.getInstance().set(NEWEST_VERSION_ANDROID_TAG, config["app_version_android"]);

        debugLog("_setRemoteConstantsValue -> " + config["app_version_ios"])
        for (var key in config) {
            if (key.indexOf("sharing_option_") == 0) {
                var countryCode = key.substring(key.lastIndexOf("_") + 1);
                SHARING_OPTIONS[countryCode] = config[key];
            }
        }
    },

    setData: function(path, value) {
        var data = value;
        if (value instanceof Array || value instanceof Object)
            data = JSON.stringify(value);

        var method = "setData";
        if (typeof data === "number") {
            if (data % 1 === 0) {
                method = "setInteger";
            } else {
                method = "setFloat";
            }
        }
        NativeHelper.callNative(method, [path, data]);
    },

    fetchData: function(path, cb) {
        debugLog("fetchData: " + path);
        this._cbs.fetchData = this._cbs.fetchData || {};
        this._cbs.fetchData[path] = cb;
        NativeHelper.callNative("fetchData", [path]);
    },

    updateChildValues: function(path, data) {
        cc.assert(data instanceof Object, "data must be an object of key-value pairs");

        data = JSON.stringify(data);
        NativeHelper.callNative("updateChildValues", [path, data]);
    },

    fetchConfig: function(duration, cb) {
        duration = duration + "";
        debugLog("fetchConfigWithDuration: " + duration);
        this._cbs.fetchConfig = cb;
        NativeHelper.callNative("fetchConfig", [duration]);
    },

    createChildAutoId: function(path) {
        return NativeHelper.callNative("createChildAutoId", [path]);    
    },

    // callbacks
    onLoggedIn: function(succeed, msg) {
        var cb = this._cbs.login;
        delete this._cbs.login;

        if (succeed) {
            this.link(cb);
            AnalyticsManager.getInstance().logCustomEvent(EVENT_LOGIN_SUCCESS);
        } else {
            cb && cb(succeed, msg);
            AnalyticsManager.getInstance().logCustomEvent(EVENT_LOGIN_CANCEL);
        }
    },
    
    onLoggedOut: function() {
        var cb = this._cbs.logout;
        delete this._cbs.logout;

        User.logout();

        cb && cb();
    },

    onFetchedData: function(key, dataString, isNull, fullPath) {
        var data;
        try {
            data = JSON.parse(dataString);
        } catch(e) {
            data = dataString;
        }
        var cb = this._cbs.fetchData[fullPath];
        // delete this._cbs.fetchData[fullPath];
        cb && cb(key, data, isNull, fullPath);
    },

    onFetchedConfig: function(succeed, dataString) {
        var data;

        try {
            data = JSON.parse(dataString);
        } catch (e) {
            data = dataString;
        }

        var cb = this._cbs.fetchConfig;
        delete this._cbs.fetchConfig;
        cb && cb(succeed, dataString);
    },

    onGameStartedFromDeeplink: function(inviterId) {
        debugLog("JS, onGameStartedFromDeeplink: " + inviterId);
        if (expectDynamicLink == true) {
            expectDynamicLink = false;
            KVDatabase.getInstance().set("inviterId", inviterId);
        } 
    },

    // private
    _updateDataModel: function(finishCallback) {
        debugLog("_updateDataModel");

        var self = this;

        var user = User.getCurrentUser();
        var waterfallPromises = [];

        // User
        waterfallPromises.push(function(cb) {
            var path = "users/" + user.uid;
            self.fetchData(path, function(key, data, isNull, fullPath) {
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
                        self.fetchData(path, function(key, data, isNull, fullPath) {
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

                            finishCallback(true);
                            
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