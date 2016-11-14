var UserStorage = cc.Class.extend({

    KEY_AR_HS: "UserStorage:KEY_AR_HS",

    _arhs: 0,

    ctor: function () {
        cc.assert(UserStorage._instance == null, "can be instantiated once only");

        this._arhs = KVDatabase.getInstance().getInt(this.KEY_AR_HS);
    },

    setARHighscore: function(hs) {
        if (this._arhs < hs) {
            this._arhs = hs;
            KVDatabase.getInstance().set(this.KEY_AR_HS, this._arhs);
        }
    },

    getARHighscore: function() {
        return this._arhs;
    }
});

UserStorage._instance = null;

UserStorage.getInstance = function () {
  return UserStorage._instance || UserStorage.setupInstance();
};

UserStorage.setupInstance = function () {
    UserStorage._instance = new UserStorage();
    return UserStorage._instance;
}