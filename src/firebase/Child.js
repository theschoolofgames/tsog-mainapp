var Child = BaseFirebaseModel.extend({
   _className: "Child",

    ctor: function(id, initCallback) {
        this.setDefaultValues({
            "coin": COIN_START_GAME,
            "diamond": DIAMOND_START_GAME
        });
        
        this._super("/children/" + id, id, ["coin", "diamond"], initCallback);

        debugLog("TEST getCoin: " + this.getCoin());
    },
});