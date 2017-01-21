var User = cc.Class.extend({
    _name: null,
    _email: null,
    _photoUrl: null,
    _uid: null,

    ctor: function() {
        
    },

    updateUserInfo: function(stringData) {
        var data;
        try {
            data = JSON.parse(stringData);
        } catch(e) {
            return;
        }

        this._name = data.name;
        this._email = data.email;
        this._photoUrl = data.photoUrl;
        this._uid = data.uid;

        return this;
    },

    getName: function() {
        return this._name;
    },

    setName: function(name) {
        this._name = name;
    },

    getEmail: function() {
        return this._email;
    },

    setEmail: function(email) {
        this._email = email;
    },

    getPhotoUrl: function() {
        return this._photoUrl;
    },

    setPhotoUrl: function(photoUrl) {
        this._photoUrl = photoUrl;
    },

    getUid: function() {
        return this._uid;
    }
});

var _p = User.prototype;

cc.defineGetterSetter(_p, "name", _p.getName, _p.setName);
cc.defineGetterSetter(_p, "email", _p.getEmail, _p.setEmail);
cc.defineGetterSetter(_p, "photoUrl", _p.getPhotoUrl, _p.setPhotoUrl);
cc.defineGetterSetter(_p, "uid", _p.getUid);

p = null;

User._instance = null;

User.getInstance = function () {
  return User._instance || User.setupInstance();
};

User.setupInstance = function () {
    User._instance = new User();
    return User._instance;
}