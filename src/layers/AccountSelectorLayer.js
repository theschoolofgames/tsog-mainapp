var TREES_BATCH_SIZE = 6;
var TREES_PADDING = 150;

var AccountSelectorLayer = cc.Layer.extend({
    _schoolId: null,

    _prlNode: null,
    _ground: null,
    _treesContainer: null,
    _lastTree: null,
    _mask: null,
    _avatarClicked: null,
    _passwordContainer: null,
    _startTouchPosition: null,
    _currentTouchPos: null,

    _isTouchMoved: false,
    _isAvatarJustClicked: false,

    _passwordItems: [],

    _batchFirstItemXs: [],

    _selectedUserId: null,

    ctor: function () {
        this._super();
        var self = this;

        this.createBackground();
        this.createBackButton();
        // this.createScrollView();
        // this.createParallaxNode();
        // this.createForeGround();
        // this.createBush();
        // this.createTrees();

        this._schoolId = KVDatabase.getInstance().getString(STRING_SCHOOL_ID);
        var accountData = DataManager.getInstance().getAccountData(this._schoolId);
        if (accountData != null) {
            this.createScrollView();
            this.createParallaxNode();
            this.createForeGround();
            this.createBush();
            this.createTrees();
            this.createMaskLayer();

            if (AccountSelectorLayer.loadedDataIds.indexOf(this._schoolId) >= 0) {
                this.runAction(cc.sequence(
                    cc.delayTime(0),
                    cc.callFunc(function() {
                        var loadingLayer = Utils.addLoadingIndicatorLayer(false);
                        loadingLayer.setIndicactorPosition(cc.winSize.width - 40, 40);

                        RequestsManager.getInstance().getAccounts(self._schoolId, function(succeed, data) {
                            Utils.removeLoadingIndicatorLayer();
                            if (succeed) {
                                DataManager.getInstance().setAccountData(self._schoolId, data.accounts);
                                self._scrollView.removeFromParent();
                                self.createScrollView();
                                self.createParallaxNode();
                                self.createForeGround();
                                self.createBush();
                                self.createTrees();
                                self.createMaskLayer();

                                AccountSelectorLayer.loadedDataIds.push(self._schoolId);
                            }
                        });
                    })));
            }
        }
        else {
            this.runAction(cc.sequence(
                cc.delayTime(0),
                cc.callFunc(function() {
                    Utils.addLoadingIndicatorLayer(true);
                    RequestsManager.getInstance().getAccounts(self._schoolId, function(succeed, data) {
                        Utils.removeLoadingIndicatorLayer();
                        if (succeed) {
                            DataManager.getInstance().setAccountData(self._schoolId, data.accounts);
                            self.createScrollView();
                            self.createParallaxNode();
                            self.createForeGround();
                            self.createBush();
                            self.createTrees();
                            self.createMaskLayer();
                        }
                    });
                })));
        }

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved
        }, this);
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

        var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        for ( var i = -1; i < accountData.length/6; i++) {
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

    createAccountButton: function(userData, x, y) {
        var fFrame = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        fFrame.setAnchorPoint(0.5, 0);
        fFrame.x = x;
        fFrame.y = y;
        fFrame.setSwallowTouches(false);
        fFrame.userData = userData;
        this.createAvatar(userData.avatar.hair_id % 3 + 1, fFrame);

        var self = this;
        fFrame.addClickEventListener(function(sender) {
            cc.log("onAvatarClicked");

            if(self._isTouchMoved)
                return;
            if(self._mask.visible)
                return;

            self.onAvatarClicked(this);
            self._selectedUserId = sender.userData.user_id;
        });

        return fFrame;
    },

    createForeGround: function() {
        var ground;
        var node = new cc.Node();

        var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        for ( var i = -1; i < accountData.length/6; i++) {
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
        var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        mask.width = (accountData.length / 6 + 2) * cc.winSize.width;
        mask.height = this.height;
        mask.x = - mask.width/3;
        mask.y = 50;
        this._treesContainer.addChild(mask, 2);

        this._mask = mask;
        mask.visible = false;
    },

    createParallaxNode: function() {
        var prlNode = new cc.ParallaxNode();
        prlNode.x = 0;
        prlNode.y = 0;

        this._scrollView.addChild(prlNode);

        this._prlNode = prlNode;
    },

    createTrees: function() {
        var treesContainer = new cc.Node();
        var tree, subNode, index;
        var self = this;

        var treeDistance = 125;

        var firstTreeX = 0;
        var batchWidth = 0;
        var lastTree = null;
        var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        for ( var i = 0; i < accountData.length; i++) {
            index = i%6;

            // cc.log("index: "+ index + " i: " + i);
            tree = new cc.Sprite("#tree-" + (index+1) + ".png");
            tree.setAnchorPoint(0.5, 0);
            tree.x = i * treeDistance + TREE_POSITIONS[index].x + TREES_PADDING;
            tree.y = this._ground.height/2 - 20;

            var fFrame = this.createAccountButton(accountData[i],
                                                tree.x + TREE_POSITIONS[index].flowerOffsetX,
                                                tree.y + tree.height + TREE_POSITIONS[index].flowerOffsetY);

            subNode = new cc.Node();

            subNode.addChild(tree, 1);
            subNode.addChild(fFrame, 2);
            subNode.tag = i;

            if (i % TREES_BATCH_SIZE == 0) {
                // cc.log("Tree #%d x: %d", i, tree.x);
                this._batchFirstItemXs.push(tree.x);

                if (i == 0)
                    firstTreeX = tree.x;
                else if (i == TREES_BATCH_SIZE)
                    batchWidth = tree.getBoundingBox().x - firstTreeX;
            }

            treesContainer.addChild(subNode, 1);
            lastTree = tree;
        }
        this._treesContainer = treesContainer;
        treesContainer.setAnchorPoint(0, 0);

        // cc.log("batchWidth: %d", batchWidth);

        this._prlNode.addChild(treesContainer, 3, cc.p(1, 1), cc.p(0,0));

        var innerWidth = lastTree.x - firstTreeX + cc.winSize.width/2;
        var innerHeight = cc.winSize.height;
        cc.log("innerWidth: " + innerWidth);
        this._scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        this._lastTree = lastTree;
    },

    createScrollView: function(){

        var self = this;
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setSwallowTouches(false);
        scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));

        scrollView.setClippingEnabled(false);

        var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        var innerWidth = accountData.length / 6 * cc.winSize.width;
        var innerHeight = cc.winSize.height;

        scrollView.setBounceEnabled(true);

        this.addChild(scrollView);
        this._scrollView = scrollView;
    },

    createPasswordContainer: function(accountButton) {
        // handle passwordContainer position
        var treeTag = accountButton.parent.tag;
        var isTop = TREE_POSITIONS[treeTag % TREES_BATCH_SIZE].isTopRow;
        var isLeft = this._currentTouchPos.x <= cc.winSize.width/2;

        var hValue = isLeft ? 0 : 1;
        var vValue = isTop ? 0 : 1;
        var hintId =hValue*2 + vValue;

        var pwContainerPos = {
            hintId: hintId,
            pwContainerOffSetRatioX: isLeft ? 1 : -1,
            pwContainerOffSetRatioY: isTop ? -1 : 1,
            pwContainerOffSetX: 50,
            pwContainerOffSetY: 50
        };

        cc.log(pwContainerPos.pwContainerOffSetRatioX + " : " + pwContainerPos.pwContainerOffSetRatioY);
        var containerObj = TREE_POSITIONS[this._avatarClicked.tag % TREES_BATCH_SIZE];
        var pwContainer = new cc.Sprite("#password_holder-"
                            + pwContainerPos.hintId
                            + ".png");

        pwContainer.x = accountButton.width / 2
                        + (pwContainer.width - pwContainerPos.pwContainerOffSetX)*pwContainerPos.pwContainerOffSetRatioX;
        pwContainer.y = accountButton.height / 2
                        + (pwContainer.height - pwContainerPos.pwContainerOffSetY)*pwContainerPos.pwContainerOffSetRatioY;

        pwContainer.tag = hintId;

        accountButton.addChild(pwContainer, 3);
        this._passwordContainer = pwContainer;
    },

    createPassWordImage: function(passwordId) {
        var self = this;

        var availablePasswords = [1, 2, 3, 4, 5, 6];
        var ids = [passwordId];
        var currentPassIndex = availablePasswords.indexOf(passwordId);
        if (currentPassIndex >= 0)
            availablePasswords.splice(currentPassIndex, 1);

        ids = shuffle(ids.concat(shuffle(availablePasswords).slice(0, 5)));
        var passwordIndex = ids.indexOf(passwordId);

        this._passwordItems = [];
        var containerObj = TREE_POSITIONS[this._avatarClicked.tag % TREES_BATCH_SIZE];

        for ( var i = 0; i < 6; i++) {
            var pwImage = new ccui.Button("icon-" + ids[i] + ".png", "", "", ccui.Widget.PLIST_TEXTURE);
            cc.log(JSON.stringify(pwImage.getAnchorPoint()));

            pwImage.x = (cc.winSize.width / 6) * i + cc.winSize.width/12;
            pwImage.y = -this._ground.height/2 + pwImage.height/2 + 10;

            this.addChild(pwImage, 3);
            this._passwordItems.push(pwImage);

            // var accountButtonParent = this._passwordContainer.parent;
            // var pwContainerTag = this._passwordContainer.tag;

            pwImage.addClickEventListener(function() {
                if (self._passwordItems[passwordIndex] === this) {
                //scale pwImage to fill the password container
                // this.setScale(1.2);
                    this.cleanup();
                    // this.stopAllActions();
                    var accountButtonParent = self._passwordContainer.parent;
                    var pwContainerTag = self._passwordContainer.tag;

                    var pos = accountButtonParent.convertToWorldSpace(self._passwordContainer.getPosition());
                    var differentPos = cc.p(HINT_OFFSET[pwContainerTag].x, -54);
                    var moveToPos = cc.pAdd(pos, differentPos);

                    var move = cc.moveTo(1, moveToPos);
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

                            KVDatabase.getInstance().set(STRING_USER_ID, self._selectedUserId);
                            // cc.director.replaceScene(new WelcomeScene());
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

            if (self._passwordItems[passwordIndex] === pwImage) {
                pwImage.runAction(cc.repeatForever(
                    cc.sequence(
                            cc.scaleTo(0.5, 0.5),
                            cc.scaleTo(0.5, 1.2)
                        )));
            }
        }
    },

    onAvatarClicked: function(accountButton) {
        // scroll to start of batch
        var accountContainer = accountButton.parent;

        cc.log("onAvatarClicked: #%d", accountContainer.tag);

        // //check if clicked account is in left-right border of screen

        var currentTouchPosX = this._currentTouchPos.x;
        var maxLeft = cc.winSize.width - accountButton.width;
        var maxRight = accountButton.width;

        var percent = ((accountButton.x) / this._lastTree.x)*100;
        cc.log("percent: " + percent);
        //left
        if (currentTouchPosX < maxRight || currentTouchPosX > maxLeft)
            this._scrollView.scrollToPercentHorizontal(percent, 0.5, true)

        this._mask.visible = true;
        // set touch handler so that touch on mask quit select password mode
        var self = this;
        var maskListener = cc.eventManager.addListener({
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
        accountContainer.setLocalZOrder(3);
        this._avatarClicked = accountContainer;

        this.createPasswordContainer(accountButton);
        this.createPassWordImage(accountButton.userData.password);
    },

    onCancelChoosePassword: function() {
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

        //save current touch position to set password container relative to accountButton
        targetNode._currentTouchPos = touch.getLocation();

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

AccountSelectorLayer.loadedDataIds = [];

var AccountSelectorScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new AccountSelectorLayer();
        this.addChild(msLayer);
    }
});
