var Child = cc.Class.extend({
    _id: null,

    _gold: 0,
    _diamond: 0,

    ctor: function(id) {
        this._id = id;
    },

    populateFirebaseData: function(data) {
        this._gold = data.gold;
        this._diamond = data.diamond;
    },

    getId: function() {
        return this._id;
    },

    getGold: function() {
        return this._gold;
    },

    setGold: function(g) {
        this._gold = g;
        FirebaseManager.getInstance().setData("children/" + this._id, this._gold);
    },

    getDiamond: function() {
        return this._diamond;
    },

    setDiamond: function(d) {
        this._diamond = d;
        FirebaseManager.getInstance().setData("children/" + this._id, this._diamond);
    }
});

var _p = Child.prototype;

cc.defineGetterSetter(_p, "gold", _p.getGold, _p.setGold);
cc.defineGetterSetter(_p, "diamond", _p.getDiamond, _p.setDiamond);

p = null;