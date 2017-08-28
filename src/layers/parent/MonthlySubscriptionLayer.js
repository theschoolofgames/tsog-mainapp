var MonthlySubscriptionLayer = cc.LayerColor.extend({
    _loggedIn: false,

    _contentTextScale: 0.35,
    _contentTextOffSetY: 5,

    _buttonOffSetY: 10,

    _backgroundZOrder: 1,
    _childrenZOrder: 3,
    _cloudZOrder: 2,
    _grownupCheckDialogZOrder: 5,

    _childrenOffSetY: 0,

    _childrenImg: null,

    ctor: function() {
        this._super(cc.color.WHITE);

        // this._childrenOffSetY = 50;

        // this._addBackground();
        // this._addMissionContent();
        this._createTalkingAdi();
        this._addButtons();
        this._addRestorePurchasesText();
        this._addWelcomeText();
        // AnalyticsManager.getInstance().logCustomEvent("EVENT_MISSION_PAGE_1");
    },

    _addBackground: function() {
        var background = new cc.Sprite(res.Mission_Page_bg);
        background.x = cc.winSize.width/2;
        background.y = cc.winSize.height/2;
        this.addChild(background);

        var children = new cc.Sprite("#children.png");
        children.scale = 0.9;
        children.x = cc.winSize.width/2;
        children.y = cc.winSize.height/2 + this._childrenOffSetY;
        this.addChild(children, this._childrenZOrder);
        this._childrenImg = children;
    },

    _addButtons: function() {
        var b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width * 0.6;
        b.y = cc.winSize.height/4 - 20;
        b.scaleX = 1.2;
        this.addChild(b);

        b.addClickEventListener(this._payBtnPressed.bind(this));

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

    _addMissionContent: function() {
        var lCloud = new cc.Sprite("#left_cloud.png");
        lCloud.setAnchorPoint(0, 1);
        lCloud.y = cc.winSize.height;
        this.addChild(lCloud, this._cloudZOrder);

        var content = "Equal education for every child";
        var lContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        lContent.scale = this._contentTextScale + 0.1;
        lContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lContent.x = lCloud.width/2;
        lContent.y = lCloud.height/2 + this._contentTextOffSetY + 10;
        lContent.boundingWidth = lCloud.width * 2;
        lCloud.addChild(lContent);

        var rCloud = new cc.Sprite("#right_cloud.png");
        rCloud.setAnchorPoint(1, 1);
        rCloud.x = cc.winSize.width;
        rCloud.y = cc.winSize.height;
        this.addChild(rCloud, this._cloudZOrder);

        content = "When you pay what's in your       we educate a child in need";
        var rContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        rContent.scale = this._contentTextScale;
        rContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        rContent.x = rCloud.width/2 - 4;
        rContent.y = rCloud.height/2 + this._contentTextOffSetY + 10;
        rContent.boundingWidth = rCloud.width * 2.3;
        rCloud.addChild(rContent);

        var iconHeart = new cc.Sprite("#icon_heart.png");
        iconHeart.scale = 0.6;
        iconHeart.x = rCloud.width * 0.33;
        iconHeart.y = rCloud.height * 0.59;
        rCloud.addChild(iconHeart);
    },

    _grownUpCheckCallback: function() {
        SceneFlowController.getInstance().setSceneGoAfterRewardScene("welcome");
        AnalyticsManager.getInstance().logCustomEvent(EVENT_PAY_PAGE_1);
        cc.director.replaceScene(new PayScene(function() {
            cc.director.replaceScene(new MonthlySubscriptionLayerScene());
        }));
    },

    _payBtnPressed: function() {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        LoadingIndicator.show();

        IAPManager.getInstance().purchase("monthlysub", function(succeed, product) {
            if (succeed) {
                FirebaseManager.getInstance().authenticate(function(authenticated, isLinked) {
                    if (authenticated) {
                        User.getCurrentUser().setSubscription(product.receiptCipheredPayload);
                        cc.director.runScene(new WelcomeScene());
                    };
                    LoadingIndicator.hide();
                }.bind(this));
            } else {
                LoadingIndicator.hide();
            }
        }.bind(this));
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
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        }, this);
        
        var str = "Restore purchases"; 
        var config = {
            "color": "#292A68",
            "shadowColor": [167, 90, 0, 127],
            "shadowSize": 0,
            "shadowRadius": 6,
            "fontSize": 18,
            "outlineSize": 1,
            "boundingWidthRatio": 1,
            "boundingHeightRatio": 0.3
        };

        var text = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                config.fontSize, 
                                                cc.color(config.color), 
                                                config.outlineSize,
                                                localizeForWriting(str));
        text.enableShadow(cc.color(config.shadowColor[0], 
                                config.shadowColor[1],
                                config.shadowColor[2],
                                config.shadowColor[3]
                            ),
                            cc.size(0, -config.shadowSize)
        );
        text.x = cc.winSize.width*0.6;
        text.y = cc.winSize.height/4 + 50;

        this.addChild(text);

        this._restorePurchasesLink = text;

        var underline = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 18, cc.color("#ffffff"), 1,"_____________________");
        underline.setColor(cc.color("#ffc73a"));
        underline.anchorX = 1;
        underline.x = text.width;
        underline.y = text.height/2 - 5;

        text.addChild(underline);
    },

    onTouchBegan: function(touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        var restorePurchasesLinkBBox = self._restorePurchasesLink.getBoundingBox();
        restorePurchasesLinkBBox = cc.rect(restorePurchasesLinkBBox.x, restorePurchasesLinkBBox.y, restorePurchasesLinkBBox.width +20, restorePurchasesLinkBBox.height+20);

        if (cc.rectContainsPoint(restorePurchasesLinkBBox, touchLoc)) {
            // TODO login before restore purchases
            cc.log("tapping on restore purchases");
            IAPManager.getInstance().restore(function(success, data) {
                cc.log("restore result: %s, %s", success ? "true" : "false", JSON.stringify(data));
            })
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
        var content = "Welcome to The School Of Games";
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
