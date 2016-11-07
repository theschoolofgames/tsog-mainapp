var CurrencyManager = cc.Class.extend({

    KEY_COIN: "CurrencyManager:KEY_COIN",
    KEY_DIAMOND: "CurrencyManager:KEY_DIAMOND",

    ctor: function () {
        cc.assert(CurrencyManager._instance == null, "can be instantiated once only");
    },

    getCoin: function() {
        return KVDatabase.getInstance().getInt(this.KEY_COIN);
    },

    getDiamond: function() {
        return KVDatabase.getInstance().getInt(this.KEY_DIAMOND);
    },

    incCoin: function(c) {
        if (c > 0) {
            KVDatabase.getInstance().set(this.KEY_COIN, this.getCoin() + c);
            return true;
        }

        return false;
    },

    incDiamond: function(d) {
        if (d > 0) {
            KVDatabase.getInstance().set(this.KEY_DIAMOND, this.getDiamond() + d);
            return true;
        }

        return false;
    },

    decrCoin: function(c) {
        if (c > 0 && c <= this.getCoin()) {
            KVDatabase.getInstance().set(this.KEY_COIN, this.getCoin() - c); 
            return true;
        }

        return false;
    },

    decrDiamond: function(d) {
        if (d > 0 && d <= this.getDiamond()) {
            KVDatabase.getInstance().set(this.KEY_DIAMOND, this.getDiamond() - d);
            return true;
        }

        return false;
    },

    reset: function() {
        KVDatabase.getInstance().remove(this.KEY_COIN);
        KVDatabase.getInstance().remove(this.KEY_DIAMOND);
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