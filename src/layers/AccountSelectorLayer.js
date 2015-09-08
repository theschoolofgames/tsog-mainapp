var AccountSelectorLayer = cc.Layer.extend({
    _prlNode: null,
    _ground: null,
    _node: null,
    _mask: null,
    _avatarClicked: null,
    _passwordContainer: null,
    _startTouchPosition: null,

    _isTouchMoved: false,
    _isAvatarJustClicked: false,

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

        // create mask
        this.createMaskLayer();
    },

    createAvatar: function(avatarID, parent) {
        var avatar = new cc.Sprite("#avatar-" + avatarID + ".png");

        avatar.setPosition(cc.p(parent.width/2, parent.height/2 + 10));
        parent.addChild(avatar);
    },

    createBackground: function() {
        var bg = new cc.Sprite(res.Bg_account_jpg);

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
        bb.y = cc.winSize.height - bb.height*2/3;
        bb.addClickEventListener(function() {
            cc.director.replaceScene(new SchoolSelectorScene());
        });
        this.addChild(bb);
    },

    createBush: function() {
        var bush;
        var node = new cc.Node();
        for ( var i = -1; i < NUMBER_OF_TREES/6; i++) {
            bush = new cc.Sprite("#grass.png");
            bush.setAnchorPoint(0,0);
            bush.x = i * (bush.width - 3);
            bush.y = this._ground.y + bush.height - 20;
            bush.flippedX = i%2 == 0;
            node.addChild(bush, -1);
        }
        node.width = bush.width*3;
        node.height = bush.height;

        this._prlNode.addChild(node, 1, cc.p(0.4, 1), cc.p(0,0));
    },

    createFlowerFrames: function(idx, x, y) {
        var fFrame = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        fFrame.setAnchorPoint(0.5, 0);
        fFrame.x = x;
        fFrame.y = y;
        fFrame.setSwallowTouches(false);

        this.createAvatar(idx % 3 + 1, fFrame);

        var self = this;
        fFrame.addClickEventListener(function() {
            cc.log("onAvatarClicked");
            var parent = this.parent;
            if(self._isTouchMoved)
                return;
            if(self._mask.visible)
                return;

            self.onAvatarClicked(parent);
        });

        return fFrame;
    },

    createForeGround: function() {
        var ground;
        var node = new cc.Node();

        for ( var i = -1; i < NUMBER_OF_TREES/6; i++) {
            ground = new cc.Sprite("#ground.png");
            ground.setAnchorPoint(0, 0);
            ground.x = i * (ground.width - 3);
            ground.y = -ground.height/2;
            ground.flippedX = i%2 == 0;

            node.addChild(ground, 3);
        }

        this._prlNode.addChild(node, 4, cc.p(0.8, 1), cc.p(0,0));

        this._ground = ground;
    },

    createMaskLayer: function() {
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 200));
        mask.width = (NUMBER_OF_TREES / 6 + 1) * cc.winSize.width;
        mask.height = this.height;
        mask.x = - mask.width/3;
        mask.y = 50;
        this._node.addChild(mask, 2);

        this._mask = mask;
        mask.visible = false;
    },

    createParallaxNode: function() {
        var prlNode = new cc.ParallaxNode();
        prlNode.width = cc.winSize.width*2;
        prlNode.height = cc.winSize.height;
        prlNode.x = this._scrollView.width / 2;
        prlNode.y = 0;

        this._scrollView.addChild(prlNode);

        this._prlNode = prlNode;
    },

    createTree: function() {
        var node = new cc.Node();
        var tree, subNode, index;
        var offsetX = 0;
        var self = this;
        for ( var i = 0; i < NUMBER_OF_TREES; i++) {
            if (i >= 6) {
                index = i%6;
                if (index == 0) offsetX = -50
            }
            else {
                index = i;
            }
            cc.log("index: "+ index + " i: " + i);
            tree = new cc.Sprite("#tree-" + (index+1) + ".png");
            tree.setAnchorPoint(0.5, 0);
            tree.x = i * 125 + TREE_POSITIONS[index].x + 100 + offsetX;
            tree.y = this._ground.height/2 - 20;

            offsetX = 0;
            var fFrame = this.createFlowerFrames(index,
                                                tree.x + TREE_POSITIONS[index].flowerOffsetX,
                                                tree.y + tree.height + TREE_POSITIONS[index].flowerOffsetY);

            subNode = new cc.Node();

            subNode.addChild(tree, 1);
            subNode.addChild(fFrame, 2);
            subNode.tag = index;

            // this._node.addChild(subNode, 1);
            node.addChild(subNode, 1);

        }
        this._node = node;
        node.setAnchorPoint(0.35, 0);
        node.width = tree.width * TREE_POSITIONS.length;
        node.height = tree.height * 2;

        this._prlNode.addChild(node, 3, cc.p(0.8, 1), cc.p(0,0));
    },

    createScrollView: function(){

        var self = this;
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        scrollView.setClippingEnabled(false);

        var innerWidth = NUMBER_OF_TREES / 6 * cc.winSize.width;
        var innerHeight = cc.winSize.height;

        scrollView.setBounceEnabled(true);
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this.addChild(scrollView);
        this._scrollView = scrollView;
    },

    createPasswordContainer: function(avatarNode) {

        var containerObj = TREE_POSITIONS[this._avatarClicked.tag];
        var pwContainer = new cc.Sprite("#password_holder-"
                            + containerObj.hintImageId
                            + ".png");

        var avatarPos = this.convertToWorldSpace(avatarNode);
        pwContainer.x = avatarPos.x + containerObj.hintOffsetX;
        pwContainer.y = avatarPos.y + containerObj.hintOffsetY;

        this.addChild(pwContainer, 3);
        this._passwordContainer = pwContainer;
    },

    createPassWordImage: function() {
        var self = this;
        var ids = shuffle([1, 2, 3, 4, 5, 6]);
        this._passwordItems = [];
        var containerObj = TREE_POSITIONS[this._avatarClicked.tag];

        for ( var i = 0; i < 6; i++) {
            var pwImage = new ccui.Button("icon-" + ids[i] + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            cc.log(JSON.stringify(pwImage.getAnchorPoint()));

            pwImage.x = (cc.winSize.width / 6) * i + cc.winSize.width/12;
            pwImage.y = -this._ground.height/2 + pwImage.height/2 + 10;

            this.addChild(pwImage, 3);
            this._passwordItems.push(pwImage);

            pwImage.addClickEventListener(function() {
                if (self._passwordItems[0] === this) {
                    var pos = self.convertToNodeSpace(self._passwordContainer.getPosition());
                    cc.log(JSON.stringify(pos));

                    var move = cc.moveTo(1, cc.p(pos.x + containerObj.passwordOffsetX, pos.y +55));
                    var move_ease = move.easing(cc.easeElasticInOut(0.8));

                    this.runAction(cc.sequence(
                        move_ease,
                        cc.callFunc(function(){
                            if (cc.sys.isNative && (cc.sys.platform == sys.IPAD || cc.sys.platform == sys.IPHONE)) {
                                jsb.reflection.callStaticMethod("H102Wrapper",
                                                     "countlyRecordEvent:count:",
                                                     "select_account",
                                                     1);
                            }
                            cc.director.replaceScene(new WelcomeScene());
                        })
                    ));
                } else {
                    this.runAction(cc.sequence(
                            cc.moveBy(0.1, cc.p(10,0)),
                            cc.moveBy(0.1, cc.p(-20,0)),
                            cc.moveBy(0.1, cc.p(10,0))
                        ));
                }
            });

        }
    },

    onAvatarClicked: function(avatar, fFrame) {
        this._mask.visible = true;

        var self = this;
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) {
                    var targetNode = event.getCurrentTarget();
                    var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
                    if (touchedPos.y >= 55)
                        self.onCancelChoosePassword();
                    return true;
                }
        }, this._mask);

        this.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, 55))
        ));
        // reset avatar clicked zOrder
        avatar.setLocalZOrder(3);
        this._avatarClicked = avatar;

        this.createPasswordContainer(avatar);
        this.createPassWordImage();
    },

    onCancelChoosePassword: function(fFrame) {
        this._mask.visible = false;
        this._passwordContainer.removeFromParent();

        cc.eventManager.removeListener(this._mask);

        for(var i = 0; i < this._passwordItems.length; i++)
            this._passwordItems[i].removeFromParent();

        this._passwordItems = [];

        this.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, -55))
        ));
        this._avatarClicked.setLocalZOrder(1);
    },

    onTouchBegan: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());

        targetNode._startTouchPosition = touchedPos;
        targetNode._isTouchMoved = false;
        return true;
    },

    onTouchMoved: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
        var deltaX = touchedPos.x - targetNode._startTouchPosition.x;
        var deltaY = touchedPos.y - targetNode._startTouchPosition.y;
        var sqrDistance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);

        if(sqrDistance > 100)
            targetNode._isTouchMoved = true;

        return true;
    }

});

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
