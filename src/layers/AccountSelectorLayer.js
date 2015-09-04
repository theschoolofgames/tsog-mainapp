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
        this.createTree();
        // this.createFlowerFrames();
    },

    createAvatar: function(avatarID, parent) {
        var avatar = new cc.Sprite("#avatar-" + avatarID + ".png");
        avatar.setAnchorPoint(0, 0);
        avatar.setPosition(parent.getPosition());
        parent.addChild(avatar);
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

        bb.x = bb.width ;
        bb.y = cc.winSize.height - bb.height/2;
        bb.addClickEventListener(function() {
            cc.director.replaceScene(new SchoolSelectorScene());
        });
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

        this._prlNode.addChild(node, 1, cc.p(0.1, 0), cc.p(0,0));
    },

    createFlowerFrames: function(x, y) {
        cc.log("x: " + x);
        cc.log("y: " + y);
        var fFrame = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        fFrame.setAnchorPoint(0, 0);
        fFrame.x = x;
        fFrame.y = y;
        this.createAvatar(1, fFrame);

        return fFrame;
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

        this._prlNode.addChild(node, 2, cc.p(0.5, 0), cc.p(0,0));

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

    createTree: function() {
        var node = new cc.Node();
        var tree;
        for ( var i = 0; i < TREE_POSITIONS.length; i++) {
            tree = new cc.Sprite("#tree-" + (i+1) + ".png");
            tree.setAnchorPoint(0, 0);
            tree.x = TREE_POSITIONS[i].x;
            tree.y = this._ground.y + this._ground.height / 2;

            var fFrame = this.createFlowerFrames(tree.x, tree.y + tree.height);

            node.addChild(tree);
            node.addChild(fFrame);

        }
        node.setAnchorPoint(0.8, 0);
        node.width = tree.width* TREE_POSITIONS.length;
        node.height = tree.height*2;
        this._prlNode.addChild(node, 3, cc.p(0.8, 0.15), cc.p(0,0));
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
