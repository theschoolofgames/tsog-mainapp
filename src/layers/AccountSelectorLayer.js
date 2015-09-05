var AccountSelectorLayer = cc.Layer.extend({
    _prlNode: null,
    _ground: null,
    _node: null,
    _mask: null,
    _avatarClicked: null,
    _passwordContainer: null,

    _isAvatarClicked: false,

    _passwordItems: [],

    ctor: function () {
        this._super();

        this.createBackground();
        this.createBackButton();
        this.createScrollView();
        this.createParallaxNode();
        this.createForeGround();
        this.createBush();
        this.createTree();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved
        }, this);
    },

    createAvatar: function(avatarID, parent) {
        var avatar;
        if (avatarID != -1)
            avatar = new cc.Sprite("#avatar-" + avatarID + ".png");
        else
            avatar = new cc.Sprite("#plus_button.png");
        avatar.setPosition(cc.p(parent.width/2, parent.height/2 + 10));
        parent.addChild(avatar);
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

        for ( var i = -1; i <= 1; i++) {
            bush = new cc.Sprite("#grass.png");
            bush.setAnchorPoint(0,0);
            bush.x = i * (bush.width - 3);
            bush.y = this._ground.y + bush.height - 20;
            bush.flippedX = i%2 == 0;
            this._node.addChild(bush, -1);
        }
        // node.width = bush.width*3;
        // node.height = bush.height;

        // this._prlNode.addChild(node, 1, cc.p(0.1, 0), cc.p(0,0));
    },

    createFlowerFrames: function(idx, x, y) {
        var fFrame = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        fFrame.setAnchorPoint(0.5, 0);
        fFrame.x = x;
        fFrame.y = y;

        if (idx != TREE_POSITIONS.length-1)
            this.createAvatar(idx % 3 + 1, fFrame);
        else
            this.createAvatar(-1, fFrame);

        return fFrame;
    },

    createForeGround: function() {
        var ground;
        var node = new cc.Node();

        for ( var i = -1; i <= 1; i++) {
            ground = new cc.Sprite("#ground.png");
            ground.setAnchorPoint(0,0);
            ground.x = i * (ground.width - 3);
            ground.y = -ground.height;
            ground.flippedX = i%2 == 0;

            node.addChild(ground, 2);
        }
        // node.width = ground.width;
        // node.height = ground.height;

        // this._prlNode.addChild(node, 4, cc.p(0.5, 0), cc.p(0,0));
        this._node = node;
        this._ground = ground;
    },

    createMaskLayer: function() {

    },

    createParallaxNode: function() {
        var prlNode = new cc.ParallaxNode();
        prlNode.width = cc.winSize.width*2;
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
        var tree, subNode;
        var self = this;
        for ( var i = 0; i < TREE_POSITIONS.length; i++) {
            tree = new cc.Sprite("#tree-" + (i+1) + ".png");
            tree.setAnchorPoint(0.5, 0);
            tree.x = TREE_POSITIONS[i].x;
            tree.y = this._ground.y + this._ground.height - 20;


            var fFrame = this.createFlowerFrames(i,
                                                tree.x + TREE_POSITIONS[i].flowerOffsetX,
                                                tree.y + tree.height + TREE_POSITIONS[i].flowerOffsetY);

            subNode = new cc.Node();

            subNode.addChild(tree, 1);
            subNode.addChild(fFrame, 2);
            subNode.tag = i;

            this._node.addChild(subNode, 1);

            fFrame.addClickEventListener(function() {
                var p = this.parent;
                if (!self._isAvatarClicked)
                    self.onAvatarClicked(p)
                else
                    self.onCancelChoosePassword()
            });
        }

        this._node.setAnchorPoint(0.35, 0);
        this._node.width = tree.width * TREE_POSITIONS.length;
        this._node.height = tree.height * 2;
        this._prlNode.addChild(this._node, 3, cc.p(0.8, 0.15), cc.p(0,0));
    },

    createScrollView: function(){

        var self = this;
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        var innerWidth = TREE_POSITIONS[TREE_POSITIONS.length-1].x + 100*2;
        var innerHeight = cc.winSize.height;

        scrollView.setBounceEnabled(true);
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this.addChild(scrollView);
        this._scrollView = scrollView;
    },

    createPasswordContainer: function() {
        cc.log(this._avatarClicked.tag);
        var containerObj = TREE_POSITIONS[this._avatarClicked.tag];
        var pwContainer = new cc.Sprite("#password_holder-"
                            + containerObj.hintImageId
                            + ".png");
        pwContainer.x = containerObj.x + containerObj.hintOffsetX;
        pwContainer.y = containerObj.hintOffsetY;

        this._node.addChild(pwContainer, 3);
        this._passwordContainer = pwContainer;
    },

    createPassWordImage: function() {
        var self = this;
        var ids = shuffle([1, 2, 3, 4, 5, 6]);
        this._passwordItems = [];
        for ( var i = 0; i < 6; i++) {
            var pwImage = new ccui.Button("icon-" + ids[i] + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            pwImage.x = (cc.winSize.width / 6) * i + cc.winSize.width/12;
            pwImage.y = -pwImage.height/2 - 20;

            this._node.addChild(pwImage, 3);
            this._passwordItems.push(pwImage);

            var pos = this.convertToNodeSpace(this._passwordContainer.getPosition());
            cc.log(JSON.stringify(pos));

            pwImage.addClickEventListener(function() {
                var move = cc.moveTo(1, cc.p(pos.x + 35, pos.y));
                var move_ease = move.easing(cc.easeElasticInOut(0.8));

                this.runAction(cc.sequence(
                    move_ease,
                    cc.callFunc(function(){
                        cc.director.replaceScene(new WelcomeScene());
                    })
                ));

            });

        }

    },

    onAvatarClicked: function(avatar) {
        // create mask
        this._isAvatarClicked = true;

        this._prlNode.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, 450))
        ));

        var mask = new cc.LayerColor(cc.color(0, 0, 0, 200));
        mask.width = this.width *2;
        mask.x = - mask.width/3;
        mask.y = -10;
        this._node.addChild(mask, 2);

        this._mask = mask;

        // reset avatar clicked zOrder
        avatar.setLocalZOrder(3);
        this._avatarClicked = avatar;

        this.createPasswordContainer();
        this.createPassWordImage();
    },

    onCancelChoosePassword: function() {
        this._mask.removeFromParent();
        this._passwordContainer.removeFromParent();
        this._isAvatarClicked = false;

        for(var i = 0; i < this._passwordItems.length; i++)
            this._passwordItems[i].removeFromParent();
        this._passwordItems = [];

        this._prlNode.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, -450))
        ));
        this._avatarClicked.setLocalZOrder(1);
    },

    onTouchBegan: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());

        if (touchedPos.y > 90 && targetNode._isAvatarClicked)
            targetNode.onCancelChoosePassword();

        return true;
    },

});

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
