var AccountSelectorLayer = cc.Layer.extend({
    _prlNode: null,

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
        var bg = new cc.Sprite(res.Bg_account_png);
        var scale = cc.winSize.width / bg.width;
        bg.setScaleX(scale);

        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    createBackButton: function() {
        var bb = new ccui.Button("back.png",
                                 "back-pressed.png",
                                 "",
                                 ccui.Widget.PLIST_TEXTURE);

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
        var prlNode = new cc.ParallaxNode();
        prlNode.width = cc.winSize.width;
        prlNode.height = cc.winSize.height;
        this.addChild(prlNode);

        this._prlNode = prlNode;
    },

    createPlusButton:function (){

    },

    createScrollView: function(){

        var self = this;
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        this.addChild(this._scrollView);

        var innerWidth = cc.winSize.width*2;
        var innerHeight = cc.winSize.height;

        scrollView.setBounceEnabled(true);
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this._scrollView = scrollView;
    }

});

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
