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
        if (!data)
            return null;

        return new User(data);
    },

    // callback
    onLoggedIn: function(succeed, msg) {
        this._cbs.login(succeed, msg);
        delete this._cbs.login;
    },
    
    onLoggedOut: function() {
        this._cbs.logout();
        delete this._cbs.logout;
    }
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