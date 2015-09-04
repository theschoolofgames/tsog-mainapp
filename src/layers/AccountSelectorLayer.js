var AccountSelectorLayer = cc.Layer.extend({
    _prlNode: null,
    _ground: null,

    ctor: function () {
        this._super();

        this.createBackground();
        this.createBackButton();
        this.createScrollView();
        this.createParallaxNode();
        this.createForeGround();
        this.createBush();
    },

    createAccountButton: function (){

    },

    createAccountContainer: function(){

    },

    createBackground: function() {
        var bg = new cc.Sprite(res.Bg_account_jpg);
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
        bb.y = cc.winSize.height - bb.height/2;
        this.addChild(bb);
    },

    createBush: function() {
        var bush;
        var node = new cc.Node();

        for ( var i = -1; i <= 1; i++) {
            bush = new cc.Sprite("#grass.png");
            bush.setAnchorPoint(0,0);
            bush.x = i * (bush.width - 3);
            bush.y = this._ground.y + bush.height/2;
            bush.flippedX = i%2 == 0;
            node.addChild(bush);
        }
        node.width = bush.width*3;
        node.height = bush.height;

        this._prlNode.addChild(node, 1, cc.p(0.5, 0), cc.p(0,0))
    },

    createFlowerFrames: function() {

    },

    createForeGround: function() {
        var ground;
        var node = new cc.Node();

        for ( var i = -1; i <= 1; i++) {
            ground = new cc.Sprite("#ground.png");
            ground.setAnchorPoint(0,0);
            ground.x = i * (ground.width - 3);
            ground.y = -ground.height/2;
            ground.flippedX = i%2 == 0;
            node.addChild(ground);
        }
        node.width = ground.width*3;
        node.height = ground.height;

        this._prlNode.addChild(node, 2, cc.p(1, 0), cc.p(0,0));

        this._ground = ground;
    },

    createMaskLayer: function() {

    },

    createParallaxNode: function() {
        var prlNode = new cc.ParallaxNode();
        prlNode.width = cc.winSize.width;
        prlNode.height = cc.winSize.height;
        prlNode.x = this._scrollView.width / 2;
        prlNode.y = this._scrollView.height / 2;

        this._scrollView.addChild(prlNode);

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

        var innerWidth = cc.winSize.width*1.5;
        var innerHeight = cc.winSize.height;

        scrollView.setBounceEnabled(true);
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this.addChild(scrollView);
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
