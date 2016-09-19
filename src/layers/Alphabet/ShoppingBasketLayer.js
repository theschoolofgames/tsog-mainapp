var ShoppingBasketLayer = TestLayer.extend({
    ctor: function() {
        this._super();
    }
});

var ShoppingBasketScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var l = new ShoppingBasketLayer();
        this.addChild(l);
    }
});