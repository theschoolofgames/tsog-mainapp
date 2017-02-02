var Child = cc.Class.extend({
    _id: null,

    _coin: 0,
    _diamond: 0,

    ctor: function(id) {
        this._id = id;
    },

    populateFirebaseData: function(data) {
        this._coin = data.coin;
        this._diamond = data.diamond;
    },

    getId: function() {
        return this._id;
    },

    getCoin: function() {
        return this._coin;
    },

    setCoin: function(g) {
        this._coin = g;
        FirebaseManager.getInstance().setData("children/" + this._id + "/coin", this._coin);
    },

    getDiamond: function() {
        return this._diamond;
    },

    setDiamond: function(d) {
        this._diamond = d;
        FirebaseManager.getInstance().setData("children/" + this._id + "/diamond", this._diamond);
    }
});

var _p = Child.prototype;

cc.defineGetterSetter(_p, "coin", _p.getCoint, _p.setCoint);
cc.defineGetterSetter(_p, "diamond", _p.getDiamond, _p.setDiamond);

p = null;