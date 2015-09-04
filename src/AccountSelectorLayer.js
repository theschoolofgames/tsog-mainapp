var AccountSelectorLayer = cc.Layer.extend({

    ctor: function () {
        this._super();

        this.createBackground();
        this.createBackButton();
        this.createParallaxNode();
    },

    createAccountButton: function (){

    },

    createAccountContainer: function(){

    },

    createBackground: function() {
        var bg = new cc.Sprite("bg-account.png");
        var scale = cc.winSize.height / bg.height;
        bg.setScale(scale);

        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createBackButton: function() {
        var bb = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);

        bb.x = bb.width*1.5 ;
        bb.y = bb.height*1.5;
        this.addChild(bb);
    },

    createFlowerFrames: function() {

    },

    createGround: function() {

    },

    createMaskLayer: function() {

    },

    createParallaxNode: function() {

    },

    createPlusButton:function (){

    },

    createScrollView: function(){

    }

});

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
