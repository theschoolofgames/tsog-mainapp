var TREES_BATCH_SIZE = 6;
var TREES_PADDING = 150;
var TREE_DISTANCE = 125;

var AccountSelectorLayer = cc.Layer.extend({
    _schoolId: null,
    _accountData: [],
    _parallaxNode: null,
    _ground: null,
    _treesContainer: null,
    _lastTree: null,
    _mask: null,
    _maskListener: null,
    _avatarClicked: null,
    _passwordContainer: null,
    _startTouchPosition: null,
    _currentTouchPos: null,

    _isTouchMoved: false,
    _isAvatarJustClicked: false,
    _isActionRunning: false,

    _passwordItems: [],

    _batchFirstItemXs: [],

    _selectedUserData: null,

    ctor: function () {
        this._super();

        this.tag = 1;
        this.playBackgroundMusic();
        this.createBackground();
        this.createBackButton();

        this._schoolId = KVDatabase.getInstance().getString(STRING_SCHOOL_ID);
        this._accountData = DataManager.getInstance().getAccountData(this._schoolId);
        this._accountData = this._accountData || [];
        cc.log("school_id: " + JSON.stringify(this._schoolId));
        cc.log("ctor _accountData: " + this._accountData.length);
       
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved
        }, this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        var self = this;

        // If school has been choosen before and has account data in localstorage
        if (this._accountData != null && this._accountData.length > 0) {
            cc.log("onEnterTransitionDidFinish accountData : " + this._accountData.length);
            self.initObjects();  

            // Check if this School data has been loaded
            if (AccountSelectorLayer.loadedDataIds.indexOf(self._schoolId) == -1) {
                var loadingLayer = Utils.addLoadingIndicatorLayer(false);
                loadingLayer.setIndicactorPosition(cc.winSize.width - 40, 40);

                RequestsManager.getInstance().getAccounts(self._schoolId, function(succeed, data) {
                    Utils.removeLoadingIndicatorLayer();
                    if (succeed) {
                        AccountSelectorLayer.loadedDataIds.push(self._schoolId);
                        if (JSON.stringify(self._accountData) === JSON.stringify(data.accounts))
                            return;

                        self._scrollView.removeFromParent();

                        DataManager.getInstance().setAccountData(self._schoolId, data.accounts);
                        self.initObjects();

                    }
                });
            }
        }
        // This school is choosen the first time
        else {
            Utils.addLoadingIndicatorLayer(true);
            RequestsManager.getInstance().getAccounts(self._schoolId, function(succeed, data) {
                cc.log("succeed? : " + succeed);
                cc.log("data: " + JSON.stringify(data));
                Utils.removeLoadingIndicatorLayer();
                if (succeed) {
                    self._accountData = data.accounts;
                    DataManager.getInstance().setAccountData(self._schoolId, data.accounts);
                    self.initObjects();
                } else {
                    showNativeMessage("TSOG", "Cannot connect to server\nPlease try again");
                    cc.director.replaceScene(new SchoolSelectorScene());
                }
            });
        }
    },

    initObjects: function() {
        cc.log("initObjects");
        this.createScrollView();
        this.createParallaxNode();
        this.createForeGround();
        this.createBush();
        this.createTrees();
        this.createMaskLayer();

        // if have new account
        // var scrollToX = 0;
        // if (this._lastTree)
        //     scrollToX = -this._lastTree.x + cc.winSize.width/2;
        // delay i * DELTA_DELAY_TIME
        // this._scrollView.setContentOffsetInDuration(cc.p(scrollToX, 0), 0.25);
    },

    addAccountLabelName: function(account, name) {
        var accountLabelName = new cc.Sprite("#table-name.png");
        accountLabelName.x = account.width / 2;
        accountLabelName.y = accountLabelName.height/2 - 5;
        //add name to label
        this.addAccountName(accountLabelName, name);
        account.addChild(accountLabelName);
    },

    addAccountName: function(accountLabelName, name) {

        var accountNameFontDef = new cc.FontDefinition();
        accountNameFontDef.fontName = "Arial Rounded MT Bold";
        accountNameFontDef.fontSize = 16;
        accountNameFontDef.fillStyle = cc.color("#fffcae");
        accountNameFontDef.boundingWidth = accountLabelName.width - 20;
        accountNameFontDef.boundingHeight = accountLabelName.height - 10;
        accountNameFontDef.shadowEnabled = true;
        accountNameFontDef.shadowOffsetX = 0;
        accountNameFontDef.shadowOffsetY = -2;
        accountNameFontDef.shadowBlur = 1;
        accountNameFontDef.shadowOpacity = 0.2;

        var accountName = new cc.LabelTTF(name, accountNameFontDef);

        fontDimensions = cc.size(accountName.width * 0.75, accountName.height);
        accountName.setDimensions(fontDimensions);
        accountName.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        accountName.x = accountLabelName.width/2;
        accountName.y = accountLabelName.height/2 - 2;

        accountLabelName.addChild(accountName);
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
            KVDatabase.getInstance().remove(STRING_SCHOOL_ID);
            KVDatabase.getInstance().remove(STRING_SCHOOL_NAME);
            cc.director.replaceScene(new SchoolSelectorScene());
        });
        this.addChild(bb);
    },

    createBush: function() {
        var bush, numberOfBushes;
        var node = new cc.Node();

        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);
        if (this._accountData.length > 5)
            numberOfBushes = Math.ceil(this._accountData.length/6) + 1;
        else
            numberOfBushes = 2;

        for ( var i = -1; i < numberOfBushes; i++) {
            bush = new cc.Sprite("#grass.png");
            bush.setAnchorPoint(0,0);
            bush.x = i * (bush.width - 3);
            bush.y = this._ground.y + bush.height - 20;
            bush.flippedX = i%2 == 0;
            node.addChild(bush, -1);
        }
        node.width = bush.width*3;
        node.height = bush.height;

        this._parallaxNode.addChild(node, 1, cc.p(0.4, 1), cc.p(0,0));
    },

    createAccountButton: function(userData, x, y) {
        var accountButton = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        accountButton.setAnchorPoint(0.5, 0);
        accountButton.x = x;
        accountButton.y = y;
        accountButton.setSwallowTouches(false);
        accountButton.userData = userData;

        this.createAvatar(userData.avatar, accountButton);

        var self = this;
        accountButton.addClickEventListener(function(sender) {
            if(self._isTouchMoved || self._mask.visible)
                return;

            self.onAvatarClicked(this);
            self._selectedUserData = sender.userData;
        });

        return accountButton;
    },

    createForeGround: function() {
        var ground, numberOfGround;
        var node = new cc.Node();

        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);
        if (this._accountData.length > 5)
            numberOfGround = Math.ceil(this._accountData.length/6) + 1;
        else 
            numberOfGround = 2;
        for ( var i = -1; i < numberOfGround; i++) {
            ground = new cc.Sprite("#Mainground.png");
            ground.setAnchorPoint(0, 0);
            ground.x = i * (ground.width - 5);
            ground.y = -ground.height/2;
            ground.flippedX = i%2 == 0;

            node.addChild(ground, 3);
        }

        this._parallaxNode.addChild(node, 4, cc.p(0.8, 1), cc.p(0,0));
        this._ground = ground;
    },

    createMaskLayer: function() {
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 200));
        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        mask.width = (this._accountData.length / 6 + 2) * cc.winSize.width;
        mask.height = this.height;
        mask.x = -mask.width/3;
        mask.y = 50;
        this._treesContainer.addChild(mask, 2);

        this._mask = mask;
        mask.visible = false;
    },

    createParallaxNode: function() {
        var parallaxNode = new cc.ParallaxNode();
        parallaxNode.x = 0;
        parallaxNode.y = 0;

        this._scrollView.setContainer(parallaxNode);

        this._parallaxNode = parallaxNode;
    },

    createTrees: function() {
        this._treesContainer = new cc.Node();
        var tree, subNode, index;
        var self = this;

        var firstTreeX = 0;
        var batchWidth = 0;
        var lastTree = null;
        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);

        if (this._accountData.length > 0) {
            for ( var i = 0; i < this._accountData.length; i++) {
                index = i%6;

                tree = new cc.Sprite("#tree" + (index+1) + ".png");
                tree.setAnchorPoint(0.5, 0);
                tree.x = i * TREE_DISTANCE + TREE_POSITIONS[index].x + TREES_PADDING;
                tree.y = this._ground.height/2 - 20;

                var accountButton = this.createAccountButton(this._accountData[i],
                                        tree.x + TREE_POSITIONS[index].flowerOffsetX,
                                        tree.y + tree.height + TREE_POSITIONS[index].flowerOffsetY);
                this.addAccountLabelName(accountButton, this._accountData[i].name);

                subNode = new cc.Node();

                subNode.addChild(tree, 1);
                subNode.addChild(accountButton, 2);
                subNode.tag = i;

                if (i % TREES_BATCH_SIZE == 0) {
                    this._batchFirstItemXs.push(tree.x);

                    if (i == 0)
                        firstTreeX = tree.x;
                    else if (i == TREES_BATCH_SIZE)
                        batchWidth = tree.getBoundingBox().x - firstTreeX;
                }

                var delayTime = i * DELTA_DELAY_TIME;
                this.addObjectAction(accountButton, delayTime, i, function(index){
                    if (index < 7)
                        cc.audioEngine.playEffect(res.rustle_sound_mp3);
                });

                this.addObjectAction(tree, delayTime);

                this._treesContainer.addChild(subNode, 1);
                lastTree = tree;
            }
        } else {
            this._addPlusSchoolButton();
        }

        this._treesContainer.setAnchorPoint(0, 0);

        this._parallaxNode.addChild(this._treesContainer, 3, cc.p(1, 1), cc.p(0,0));

        var innerWidth; 
        if (lastTree == undefined || lastTree == null)
            innerWidth = cc.winSize.width/2;
        else 
            innerWidth = lastTree.x - firstTreeX + cc.winSize.width/2;

        var innerHeight = cc.winSize.height;

        this._scrollView.setContentSize(cc.size(innerWidth, innerHeight));
        this._lastTree = lastTree;

        this._addPlusSchoolButton();
    },

    addObjectAction: function(object, delayTime, index, func) {
        object.scale = 0;
        object.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(function() { func && func(index); }),
                cc.scaleTo(0.4, 1).easing(cc.easeElasticOut(0.6))
            ));
    },

    createScrollView: function(){

        var self = this;
        var scrollView = new cc.ScrollView();
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        // scrollView.setSwallowTouches(false);
        scrollView.setViewSize(cc.size(cc.winSize.width, cc.winSize.height));
        scrollView.setClippingToBounds(false);
        scrollView.setBounceable(true);

        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);
        cc.log("this._accountData: " + this._accountData.length);
        var innerWidth = this._accountData.length / 6 * cc.winSize.width;
        var innerHeight = cc.winSize.height;

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

        var containerObj = TREE_POSITIONS[this._avatarClicked.tag % TREES_BATCH_SIZE];
        var pwContainer = new cc.Sprite("#password_holder-"
                            + pwContainerPos.hintId
                            + ".png");

        pwContainer.x = accountButton.width / 2
                        + (pwContainer.width
                        - pwContainerPos.pwContainerOffSetX)*pwContainerPos.pwContainerOffSetRatioX;
        pwContainer.y = accountButton.height / 2
                        + (pwContainer.height
                        - pwContainerPos.pwContainerOffSetY)*pwContainerPos.pwContainerOffSetRatioY;

        pwContainer.tag = hintId;

        accountButton.addChild(pwContainer, 3);
        this._passwordContainer = pwContainer;
    },

    createPasswordImage: function(passwordId) {
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

            pwImage.x = (cc.winSize.width / 6) * i + cc.winSize.width/12;
            pwImage.y = -this._ground.height/2 + pwImage.height/2 + 10;

            this.addChild(pwImage, 3);
            this._passwordItems.push(pwImage);

            pwImage.addClickEventListener(function() {
                self.onPasswordItemClicked(this, passwordIndex);
            });

            // scale the right password
            if (self._passwordItems[passwordIndex] === pwImage) {
                pwImage.runAction(cc.repeatForever(
                    cc.sequence(
                            cc.scaleTo(0.8, 0.8),
                            cc.scaleTo(0.8, 1.1)
                        )));
            }
        }
    },

    onPasswordItemClicked: function(pwItem, passwordIndex) {
        var self = this;

        if (this._passwordItems[passwordIndex] === pwItem) {
            // stop background music and play effect sound
            this.turnDownMusicVolume();
            cc.audioEngine.playEffect(res.right_password_mp3);

            this._isActionRunning = true;
            pwItem.cleanup();
            pwItem.setScale(1);

            //set logged in
            KVDatabase.getInstance().set("isLoggedIn", 1);

            var accountButtonParent = this._passwordContainer.parent;
            var pwContainerTag = this._passwordContainer.tag;

            var pos = accountButtonParent.convertToWorldSpace(this._passwordContainer.getPosition());
            var differentPos = cc.p(HINT_OFFSET[pwContainerTag].x, -54);
            var moveToPos = cc.pAdd(pos, differentPos);

            // move to welcome scene
            pwItem.runAction(cc.sequence(
                cc.moveTo(1, moveToPos).easing(cc.easeElasticInOut(0.9)),
                cc.callFunc(function(){
                    self.addChild(new ChooseLanguageLayer(function(){
                        var schoolConfig = DataManager.getInstance().getSchoolConfig(self._schoolId);

                        SegmentHelper.identity(
                            self._selectedUserData.user_id, 
                            self._selectedUserData.name, 
                            schoolConfig.school_id, 
                            schoolConfig.school_name);
                        
                        KVDatabase.getInstance().set(STRING_USER_ID, self._selectedUserData.user_id);
                        KVDatabase.getInstance().set(STRING_USER_NAME, self._selectedUserData.name);
                        cc.director.replaceScene(new WelcomeScene());
                    }), 9999);
                })
            ));
        } else {
            cc.audioEngine.playEffect(res.wrong_password_mp3);
            // shake password image if its not the right one
            pwItem.runAction(cc.sequence(
                    cc.moveBy(0.1, cc.p(10,0)),
                    cc.moveBy(0.1, cc.p(-20,0)),
                    cc.moveBy(0.1, cc.p(10,0))
                ));
        }
    },

    onAvatarClicked: function(accountButton) {
        // scroll to start of batch
        var accountContainer = accountButton.parent;
        cc.audioEngine.playEffect(res.rustle_sound_mp3);
        // check if clicked account is in left-right border of screen
        var safeWidth = 200;

        var currentTouchPosX = this._currentTouchPos.x;
        var scrollToX = -1;
        var currentScrollInnerX = this._scrollView.getContentOffset().x;

        if (currentTouchPosX < safeWidth)
            scrollToX = currentScrollInnerX + safeWidth;
        else if (currentTouchPosX > cc.winSize.width - safeWidth)
            scrollToX = currentScrollInnerX - safeWidth;

        if (scrollToX > 0) scrollToX = 0;

        if (scrollToX != -1)
            this._scrollView.setContentOffsetInDuration(cc.p(scrollToX, 0), 0.25);

        this._mask.visible = true;
        // set touch handler so that touch on mask quit select password mode
        var self = this;
        var maskListener = cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function(touch, event) {
                    return true;
                },
                onTouchEnded: function(touch, event) {
                    if (self._isActionRunning)
                        return;

                    var targetNode = event.getCurrentTarget();
                    var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
                    if (touchedPos.y >= 50)
                        self.onCancelChoosePassword();
                }
        }, this._mask);

        this.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, 55))
        ));
        // reset avatar clicked zOrder
        accountContainer.setLocalZOrder(3);
        this._avatarClicked = accountContainer;
        this._maskListener = maskListener;

        this.createPasswordContainer(accountButton);
        this.createPasswordImage(accountButton.userData.password);
    },

    onCancelChoosePassword: function() {
        this._mask.visible = false;
        this._passwordContainer.removeFromParent();

        cc.eventManager.removeListener(this._maskListener);

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

        if (targetNode._isActionRunning)
            return true;
        targetNode._startTouchPosition = touchedPos;
        targetNode._isTouchMoved = false;
        return true;
    },

    onTouchMoved: function(touch, event) {
        var targetNode = event.getCurrentTarget();
        var touchedPos = targetNode.convertToNodeSpace(touch.getLocation());
        var delta = cc.pSub(touchedPos, targetNode._startTouchPosition);
    
        if(cc.pLengthSQ(delta) > 10 * 10)
            targetNode._isTouchMoved = true;
    },

    playBackgroundMusic: function() {
        if (cc.audioEngine.isMusicPlaying())
            return
        // play background music
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
    },

    turnDownMusicVolume: function() {
        this.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function() {
                    cc.audioEngine.setMusicVolume(0);
                })
            ))
    },

    _addPlusSchoolButton: function() {
        var tree, subNode;
        // var accountData = DataManager.getInstance().getAccountData(this._schoolId);
        var index = this._accountData.length%6;

        tree = new cc.Sprite("#tree" + (index+1) + ".png");
        tree.setAnchorPoint(0.5, 0);
        tree.x = this._accountData.length * TREE_DISTANCE + TREE_POSITIONS[index].x + TREES_PADDING;
        tree.y = this._ground.height/2 - 20;

        var randBgIdx = index%2+1;
        var plusBtnHolder = new ccui.Button("flower-avatar.png", "", "", ccui.Widget.PLIST_TEXTURE);
        plusBtnHolder.setAnchorPoint(0.5, 0);
        plusBtnHolder.x = tree.x + TREE_POSITIONS[index].flowerOffsetX;
        plusBtnHolder.y = tree.y + tree.height + TREE_POSITIONS[index].flowerOffsetY;

        var plusImg = new cc.Sprite("#plus_button.png");
        plusImg.x = plusBtnHolder.width/2;
        plusImg.y = plusBtnHolder.height/2;
        plusBtnHolder.addChild(plusImg);

        subNode = new cc.Node();

        subNode.addChild(tree, 1);
        subNode.addChild(plusBtnHolder, 2);
        subNode.tag = index;

        this._treesContainer.addChild(subNode);
        plusBtnHolder.addClickEventListener(function() {
            cc.director.replaceScene(new NewAccountScene());
        });
    },

});

AccountSelectorLayer.loadedDataIds = [];

var AccountSelectorScene = cc.Scene.extend({
    ctor: function(isTesting) {
        this._super();

        var msLayer = new AccountSelectorLayer(isTesting);
        this.addChild(msLayer);
    }
});
