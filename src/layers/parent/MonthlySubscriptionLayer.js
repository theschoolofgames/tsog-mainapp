var MONTHLY_SUBSCRIPTION_IAP_NAME = "monthlysub";
var MonthlySubscriptionLayer = cc.LayerColor.extend({
    _loggedIn: false,

    _contentTextScale: 0.35,
    _contentTextOffSetY: 5,

    _buttonOffSetY: 10,

    _backgroundZOrder: 1,
    _childrenZOrder: 3,
    _cloudZOrder: 2,

    _childrenOffSetY: 0,

    _childrenImg: null,

    _restoredSubscriptionWithPayload: null,

    ctor: function() {
        this._super(cc.color.WHITE);

        // this._childrenOffSetY = 50;

        this._createTalkingAdi();
        this._addButtons();
        this._addRestorePurchasesText();
        this._addTOSandPrivacyPolicyText();
        this._addWelcomeText();
        // this._addPriceText();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        }, this);
        // AnalyticsManager.getInstance().logCustomEvent("EVENT_MISSION_PAGE_1");
    },


    _addButtons: function() {
        var b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width * 0.6;
        b.y = cc.winSize.height/4 + 30;
        this.addChild(b);

        var self = this;
        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            var dialog = new GrownUpCheckDialog(self._addIAPDetailDialog.bind(self));
            self.addChild(dialog, 999999);
        });
        
        var lb = new cc.LabelBMFont("Start 7-day free trial", res.HomeFont_fnt);
        lb.scale = 0.35;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 6;
        b.addChild(lb);

        // Debug bypass purchase
        b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "debug bypass";
        b.scale = 0.6;
        b.x = cc.winSize.width/4;
        b.y = cc.winSize.height/5 - b.height * b.scale;
        

        b.addClickEventListener(this._bypassBtnPressed.bind(this));

        lb = new cc.LabelBMFont("Debug Skip", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 6;
        b.addChild(lb);
        if (TSOG_DEBUG) {
            this.addChild(b);
        }
    },

    _addPriceText: function() {
        var str = "Full Game Access\n\n$2.99/Month, will be charged to iTunes Account.\n\nCancel Anytime by going to the Account Settings.";
        var config = {
            "color": "#b56421",
            "fontSize": 16 * 2,
            "outlineSize": 2,
        };

        var text = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                config.fontSize, 
                                                cc.color(config.color), 
                                                config.outlineSize,
                                                localizeForWriting(str));
        
        // var text = cc.LabelBMFont("$9.99/Month. Cancel Anytime.", res.HomeFont_fnt);
        text.x = cc.winSize.width*0.6;
        text.y = cc.winSize.height/4 + 110;
        text.scale = 0.5;

        this.addChild(text);
    },

    _authenticateUser: function(receiptCipheredPayload) {
        FirebaseManager.getInstance().authenticate(function(authenticated, isLinked) {
            if (authenticated) {
                User.getCurrentUser().setSubscription(receiptCipheredPayload);
                cc.director.runScene(new WelcomeScene());
            };
            LoadingIndicator.hide();
        });
    },

    _payBtnPressed: function() {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        LoadingIndicator.show();

        IAPManager.getInstance().purchase(MONTHLY_SUBSCRIPTION_IAP_NAME, function(succeed, product) {
            if (succeed && product.name == MONTHLY_SUBSCRIPTION_IAP_NAME) {
                this._authenticateUser(product.receiptCipheredPayload);
            } else {
                LoadingIndicator.hide();
            }
        }.bind(this));
    },

    _addIAPDetailDialog: function() {
        var dialog = new MessageDialog("#level_dialog_frame.png");

        var titleLabel = new cc.LabelBMFont("$2.99/month for Full Game Access", res.Grown_Up_fnt);
        titleLabel.scale = 0.4;
        titleLabel.x = dialog.background.width/2;
        titleLabel.y = dialog.background.height/2 + 170;
        dialog.addComponent(titleLabel);

        var str = "• Payment will be charged to iTunes Account.\n\
• Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.\n\
• Account will be charged for renewal within 24-hours prior to the end of the current period, and identify the cost of the renewal.\n\
• Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.\n";
        var contentLabel = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                        18, 
                                        cc.color.WHITE, 
                                        0,
                                        localizeForWriting(str));
        contentLabel.x = dialog.background.width/2 + 10;
        contentLabel.y = dialog.background.height/2 + 10;
        contentLabel.setLineHeight(22);
        contentLabel.setDimensions(dialog.background.width - 50, 0);
        contentLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        dialog.addComponent(contentLabel);

        var btn = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btn.x = dialog.background.width/2;
        btn.y = 80;
        btn.addClickEventListener(function(){
            this._payBtnPressed();
        }.bind(this));
        var lb = new cc.LabelBMFont("Start 7-day free trial", res.HomeFont_fnt);
        lb.scale = 0.35;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = btn.width/2;
        lb.y = btn.height/2 + 6;
        btn.addChild(lb);

        dialog.addComponent(btn);

        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        closeButton.x = dialog.background.width - 25;
        closeButton.y = dialog.background.height - 25;
        closeButton.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            dialog.removeFromParent();
        });
        dialog.addComponent(closeButton);

        this.addChild(dialog, 2);
    },

    _bypassBtnPressed: function() {
        LoadingIndicator.show();
        FirebaseManager.getInstance().authenticate(function(authenticated, isLinked) {
            if (authenticated) {
                User.getCurrentUser().setSubscription("debug-bypass");
                LoadingIndicator.hide();
                cc.director.runScene(new WelcomeScene());
            }
        }.bind(this));
    },

    _addRestorePurchasesText: function() {
        var str = "Restore purchases"; 
        var config = {
            "color": "#46478c",
            "fontSize": 18 * 2,
            "outlineSize": 2,
        };

        var text = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                config.fontSize, 
                                                cc.color(config.color), 
                                                config.outlineSize,
                                                localizeForWriting(str));

        text.x = cc.winSize.width*0.6;
        text.y = cc.winSize.height/4 - 30;
        text.scale = 0.5;

        this.addChild(text);

        this._restorePurchasesLink = text;

        var underline = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], config.fontSize, cc.color("#ffffff"), config.outlineSize/2, "____________________");
        underline.setColor(cc.color(config.color));
        underline.anchorX = 1;
        underline.x = text.width;
        underline.y = text.height/2 - 5;

        text.addChild(underline);
    },

    _addTOSandPrivacyPolicyText: function() {
        var str = "By proceeding you agree to our Terms of Service and Privacy Policy"; 
        var config = {
            "color": "#46478c",
            "fontSize": 15 * 2,
            "outlineSize": 1 * 2,
        };

        var text = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                config.fontSize, 
                                                cc.color(config.color), 
                                                config.outlineSize,
                                                localizeForWriting(str));

        text.x = cc.winSize.width/2;
        text.y = cc.winSize.height/4 - 100;
        text.scale = 0.5;

        this.addChild(text);

        // term of services link
        var underline = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], config.fontSize, cc.color("#ffffff"), config.outlineSize/2,"__________________");
        underline.setColor(cc.color(config.color));
        underline.anchorX = 1;
        underline.x = text.width - 300;
        underline.y = text.height/2 - 5;

        this._tosLink = underline;

        text.addChild(underline);

        // privacy policy link
        underline = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], config.fontSize, cc.color("#ffffff"), config.outlineSize/2,"_______________");
        underline.setColor(cc.color(config.color));
        underline.anchorX = 1;
        underline.x = text.width;
        underline.y = text.height/2 - 5;

        this._privacyPolicyLink = underline;

        text.addChild(underline);
    },

    _restorePurchasePressed: function() {
        var self = this;
        LoadingIndicator.show();
        IAPManager.getInstance().restore(function(success, data) {
            log("restore callback: " + success + ", '" + JSON.stringify(data) + "'");
            if (!success) {
                showNativeMessage("Restore failed!", "Could not restore your purchases. Please try again later!");
                LoadingIndicator.hide();
                return;
            }

            if (data == '') {
                // restore completed
                LoadingIndicator.hide();

                if (self._restoredSubscriptionWithPayload != null) {
                    self._authenticateUser(self._restoredSubscriptionWithPayload);
                } else {
                    showNativeMessage("Subscription not found", "Your subscription couldn not be found or has been expried.");
                }
            } else {
                cc.log("  -> restored product: '%s'", data.name);
                if (data.name == MONTHLY_SUBSCRIPTION_IAP_NAME) {
                    cc.log("  -> is %s", MONTHLY_SUBSCRIPTION_IAP_NAME)
                    self._restoredSubscriptionWithPayload = "restored purchase";
                }
            }
        })
    },

    onTouchBegan: function(touch, event) {
        var touchLoc = touch.getLocation();
        var touchRect = cc.rect(touchLoc.x - 4, touchLoc.y - 4, 8, 8);
        var self = event.getCurrentTarget();

        cc.log("self._restorePurchasesLink.getBoundingBoxToWorld(): ", self._restorePurchasesLink.getBoundingBoxToWorld().x, self._restorePurchasesLink.getBoundingBoxToWorld().y, self._restorePurchasesLink.getBoundingBoxToWorld().width, self._restorePurchasesLink.getBoundingBoxToWorld().height);

        if (cc.rectIntersectsRect(self._restorePurchasesLink.getBoundingBoxToWorld(), touchRect)) {
            cc.log(" -> tapping on restore purchases");
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            var dialog = new GrownUpCheckDialog(self._restorePurchasePressed.bind(self));
            self.addChild(dialog, 999999);
        } else if (cc.rectIntersectsRect(self._tosLink.getBoundingBoxToWorld(), touchRect)) {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            var dialog = new GrownUpCheckDialog(function() {
                var link = "http://www.theschoolofgames.org/terms-of-service/";
                cc.sys.openURL(link);
            });
            self.addChild(dialog, 999999);
        } else if (cc.rectIntersectsRect(self._privacyPolicyLink.getBoundingBoxToWorld(), touchRect)) {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            var dialog = new GrownUpCheckDialog(function() {
                var link = "http://www.theschoolofgames.org/privacy-policy/";
                cc.sys.openURL(link);
            });
            self.addChild(dialog, 999999);
        }

        return true;
    },

    _createTalkingAdi: function() {
        var adidogNode = new AdiDogNode(true);
        adidogNode.setPosition(cc.p(cc.winSize.width / 4, cc.winSize.height / 5));
        this.addChild(adidogNode);
        this._talkingAdi = adidogNode;
    },

    _addWelcomeText: function() {
        var content = "School of Games AR:\nPreschool app for words, numbers and stories";
        var rContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        rContent.scale = this._contentTextScale;
        rContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        rContent.x = cc.winSize.width * 0.6;
        rContent.y = cc.winSize.height/2 + rContent.height/2;
        rContent.boundingWidth = cc.winSize.width;
        this.addChild(rContent);
    },
});

var MonthlySubscriptionScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        this.addChild(new MonthlySubscriptionLayer());
    }
});
