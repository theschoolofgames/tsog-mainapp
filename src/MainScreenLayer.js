var MainScreenLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        cc.log("main screen layer");
    }
});

var MainScreen = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});