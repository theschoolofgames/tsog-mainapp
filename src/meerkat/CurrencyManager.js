var CurrencyManager = cc.Class.extend({
    ctor: function () {
        cc.assert(CurrencyManager._instance == null, "can be instantiated once only");
    },

    getCoin: function() {
        return User.getCurrentChild().getCoin();
    },

    getDiamond: function() {
        return User.getCurrentChild().getDiamond();
    },

    incCoin: function(c) {
        User.getCurrentChild().setCoin(this.getCoin() + c);
    },

    incDiamond: function(d) {
        User.getCurrentChild().setDiamond(this.getDiamond() + d);
    },

    decrCoin: function(c) {
        return this.incCoin(-c);
    },

    decrDiamond: function(d) {
        return this.incDiamond(-d);
    }
});

CurrencyManager._instance = null;

CurrencyManager.getInstance = function () {
  return CurrencyManager._instance || CurrencyManager.setupInstance();
};

CurrencyManager.setupInstance = function () {
    CurrencyManager._instance = new CurrencyManager();
    return CurrencyManager._instance;
}