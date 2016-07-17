var PayWallDialog = cc.LayerColor.extend({
    _dialogBg: null,
    _redirectLink: null,
    _callback: null,

    ctor: function(callback, hideLaterButton) {
        this._super(cc.color(0, 0, 0, 200));

        this._addDialogBg();
        this._addText();
        this._addSubscribeButton();
        this._addRestorePurchaseButton();
        this._addRedirectLink();

        this._callback = callback;
        if (!hideLaterButton) {
            this._addLaterButton();
        }

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan
        }, this);
    },

    _addDialogBg: function() {
        this._dialogBg = new cc.Sprite("#setting-dialog-bg.png");
        this._dialogBg.x = cc.winSize.width/2;
        this._dialogBg.y = cc.winSize.height/2;
        this.addChild(this._dialogBg);
    },

    _addText: function() {
        var text = "Subscribe to keep playing and support a child in need";
        var contentLabel = new cc.LabelTTF(text, "Arial", 24);
        contentLabel.color = cc.color.BLACK;
        contentLabel.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        contentLabel.boundingWidth = this._dialogBg.width* 0.75;
        contentLabel.x = this._dialogBg.width/2;
        contentLabel.y = this._dialogBg.height/2;
        this._dialogBg.addChild(contentLabel);
    },

    _addSubscribeButton: function() {
        var subscribeBtn = new ccui.Button();
        subscribeBtn.loadTextures("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        subscribeBtn.x = this._dialogBg.width/2 - subscribeBtn.width/2;
        subscribeBtn.y = 20;
        this._dialogBg.addChild(subscribeBtn);

        var self = this;
        subscribeBtn.addClickEventListener(function() {
        });

        var text = "Subscribe";
        var title;
        title = new cc.LabelTTF(text, "Arial", 16);
        title.boundingWidth = subscribeBtn.width-20;
        title.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        title.setPosition(cc.p(subscribeBtn.width/2, subscribeBtn.height/2));
        subscribeBtn.getVirtualRenderer().addChild(title);
    },

    _addRestorePurchaseButton: function() {
        var restorePurchase = new ccui.Button();
        restorePurchase.loadTextures("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        restorePurchase.x = this._dialogBg.width/2 + restorePurchase.width/2 + 10;
        restorePurchase.y = 20;
        this._dialogBg.addChild(restorePurchase);

        var self = this;
        restorePurchase.addClickEventListener(function() {
            self.removeFromParent();
            self._callback();
        });

        var text = "Restore Purchase";
        var title = new cc.LabelTTF(text, "Arial", 15);
        title.boundingWidth = restorePurchase.width-20;
        title.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        title.setPosition(cc.p(restorePurchase.width/2, restorePurchase.height/2));
        restorePurchase.getVirtualRenderer().addChild(title);
    },

    _addLaterButton: function() {
        var laterBtn = new ccui.Button();
        laterBtn.loadTextures("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        laterBtn.x = this._dialogBg.width/2;
        laterBtn.y = -laterBtn.height/2;
        this._dialogBg.addChild(laterBtn);

        var self = this;
        laterBtn.addClickEventListener(function() {
            self.removeFromParent();
            self._callback();
        });

        var text = "Later";
        var title = new cc.LabelTTF(text, "Arial", 20);
        title.boundingWidth = laterBtn.width-20;
        title.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        title.setPosition(cc.p(laterBtn.width/2, laterBtn.height/2 + 5));
        laterBtn.getVirtualRenderer().addChild(title);
    },

    _addRedirectLink: function() {
        var text = "For more information visit http://theschoolofgames.org";
        var redirectLink = new cc.LabelTTF(text, "Arial", 24);
        redirectLink.color = cc.color.WHITE;
        redirectLink.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        redirectLink.x = cc.winSize.width/2;
        redirectLink.y = 50;
        this.addChild(redirectLink);

        this._redirectLink = redirectLink;
    },

    onTouchBegan: function(touch, event) { 
        var self = event.getCurrentTarget();
        var touchLocation = touch.getLocation();
        var linkBBox = self._redirectLink.getBoundingBox();
        if (cc.rectContainsPoint(linkBBox, touchLocation)) {
            NativeHelper.callNative("openUrlWith", ["http://theschoolofgames.org"]);
        }

        return true; 
    },
});