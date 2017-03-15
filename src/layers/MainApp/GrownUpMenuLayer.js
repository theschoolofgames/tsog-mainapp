var GrownUpMenuLayer = cc.LayerColor.extend({
    _featuresLayer: null,
    _aboutUsLayer: null,
    _lbArray: [],
    _featuresBtnOffSetY: 25,

    _payBtn: null,
    _shareBtn: null,
    _progressTrackerBtn: null,

    ctor: function() {
        this._super(cc.color(255, 255, 255));
        this._lbArray = [];
        this._addBackground();
        this._addPageBorders();
        this._addTabs();
        this._addFeaturesBtn();
        this._addAboutUsBtn();
        this.addBackButton();
        this.addText();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
        }, this);

        if (!FirebaseManager.getInstance().isLoggedIn())
            this.addSaveProgressButton();
        else
            this.addUserIdLabel();
        this.addGetUpdatesBtn();
        debugLog("menu ctor");
    },

    touchEvent: function(sender,type) {
        var count = sender.getChildrenCount();
        cc.log("ChildCount = " + count);
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.log("TOUCH_BEGAN");
                for(var i  = 0; i < count; i++) {
                    var node = sender.getChildByTag(i);
                    if(node) {
                        node.setSpriteFrame(node.name + "-pressed.png");
                        cc.log("node.name: " + node.name);
                    };
                };
                // sender.setBright(false);
                break;

            case ccui.Widget.TOUCH_MOVED:
                cc.log("TOUCH_MOVED");
                for(var i  = 0; i < count; i++) {
                    var node = sender.getChildByTag(i);
                    if(node) {
                        node.setSpriteFrame(node.name + ".png");
                    };
                };
                // sender.setBright(false);
                break;

            case ccui.Widget.TOUCH_ENDED:
                cc.log("TOUCH_ENDED");
                for(var i  = 0; i < count; i++) {
                    var node = sender.getChildByTag(i);
                    if(node) {
                        node.setSpriteFrame(node.name + ".png");
                    };
                };
                // sender.setBright(true);
                break;

            case ccui.Widget.TOUCH_CANCELLED:
                cc.log("TOUCH_CANCELLED");
                for(var i  = 0; i < count; i++) {
                    var node = sender.getChildByTag(i);
                    if(node) {
                        node.setSpriteFrame(node.name + ".png");
                    };
                };
                // sender.setBright(true);
                break; 
            default:
                break;
        }
    },

    addText: function(){
        var text = new cc.LabelBMFont("MENU", res.Grown_Up_fnt);
        text.anchorY = 0;
        text.scale = 0.7;
        text.x = cc.winSize.width/2 - 265;
        text.y = cc.winSize.height/5 * 4 + 30;
        this.addChild(text);
    },

    onTouchBegan:function(touch, event) {
        var touchedPos = touch.getLocation();
        for(var i = 0; i < this._lbArray.length; i++) {
            var node = this._lbArray[i];
            boudingBox = node.getBoundingBox();
            if(node.name == "web")
                boudingBox = cc.rect(boudingBox.x - 5, boudingBox.y - 5, boudingBox.width + 10, boudingBox.height + 10);
            var isRectContainsPoint = cc.rectContainsPoint(boudingBox, touchedPos);
            if(isRectContainsPoint && this._aboutUsLayer.visible == true) {
                this._startTouchPosition = touchedPos;
                this._isTouching = true;
                this._handleTouchAction(node.name);
            };
        }
        return true;
    },

    onTouchMoved: function(touch, event) {

    },

    onTouchEnded: function(touch, event) {

    },

    _handleTouchAction: function(name){
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        switch(name) {
            case "privacy":
                cc.sys.openURL(PRIVACY_POLICY_URL)
                break;
            case "web":
                cc.sys.openURL(WEB_URL)
                break;
            case "email":
                // cc.sys.openURL("mailto:info@theschoolofgame.org");
                cc.sys.openURL("mailto:" + EMAIL_ADRESS_GAME);
                // NativeHelper.callNative("sendEmail", ["mailto:info@theschoolofgame.org"]);
                break;
            default:
                break;
        }
    },

    _addPageBorders: function() {
        var topBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
        topBorder.setAnchorPoint(0, 1);
        topBorder.x = 0;
        topBorder.y = cc.winSize.height;
        this.addChild(topBorder);

        var bottomBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
        bottomBorder.setScale(-1, -1);
        bottomBorder.x = cc.winSize.width;
        bottomBorder.y = 0;
        this.addChild(bottomBorder, 10);
    },

    _addBackground: function() {
        var topPageW = cc.winSize.width;
        var topPageH = cc.winSize.height / 5;

        var bottomPageW = cc.winSize.width;
        var bottomPageH = cc.winSize.height - topPageH;

        var topPage = new cc.LayerColor(cc.color(94, 63, 48, 255), topPageW, topPageH);
        topPage.setPosition(0, cc.winSize.height - topPageH);
        this.addChild(topPage);

        var bottomPage = new cc.LayerColor(cc.color(107, 76, 61, 255), bottomPageW, bottomPageH);
        bottomPage.setPosition(0, 0);
        this.addChild(bottomPage);

        var payBackground = RepeatingSpriteNode.create(res.Pay_background_png, cc.winSize.width, bottomPageH);
        payBackground.setAnchorPoint(0, 1);
        payBackground.x = 10;
        payBackground.y = bottomPageH - 10;
        this.addChild(payBackground);

        var pageBreakingLine = new cc.Sprite(res.Pay_breaking_line_png);
        pageBreakingLine.setAnchorPoint(0, 0.5);
        pageBreakingLine.setScale(cc.winSize.width / pageBreakingLine.width);
        pageBreakingLine.x = 0;
        pageBreakingLine.y = bottomPageH;
        this.addChild(pageBreakingLine);

        this._bottomPageH = bottomPageH;
    },

    _addTabs: function() {
        this._addTabBtn("Features", cc.winSize.width/2 + 1, cc.winSize.height - 75, -0.5);
        this._addTabBtn("About Us", cc.winSize.width/2 - 1, cc.winSize.height - 75, 0.5);
    },

    _addTabBtn: function(tabName, x, y, offsetX) {
        var _btn = new ccui.Button("res/SD/progresstracker/tab-normal.png", "res/SD/progresstracker/tab-normal.png", "");
        _btn.x = x + _btn.width*offsetX;
        _btn.y = y;
        _btn.name = tabName;
        _btn.addTouchEventListener(this.touchEvent, this);
        if(tabName == "Features"){
            _btn.setZOrder(10);
            this._currentButton = _btn;
            this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
            this._bgBtnChoose.x = _btn.width/2 + 1;
            this._bgBtnChoose.y = _btn.height/2 - 1;
            _btn.addChild(this._bgBtnChoose, 10);
            var lbChoose = new cc.LabelBMFont(localizeForWriting(tabName), "res/font/grownupcheckfont-export.fnt");
            lbChoose.scale = 0.4;
            lbChoose.x = this._bgBtnChoose.width/2;
            lbChoose.y = this._bgBtnChoose.height/2 + 10;
            lbChoose.tag = 1;
            this._bgBtnChoose.addChild(lbChoose);
        };
        var title = new cc.LabelBMFont(localizeForWriting(tabName), "res/font/progresstrackerfont-export.fnt");
        title.scale = 0.6;
        title.x = _btn.width/2;
        title.y = _btn.height/2 + 10;

        _btn.addChild(title);

        _btn.addClickEventListener(this._tabPressed.bind(this));
        // var btnTitle = this._createBtnTitle(localizeForWriting(tabName), _btn);
        // _btn.addChild(btnTitle);

        this.addChild(_btn);
    },

    _addFeaturesBtn: function() {
        var _progressTrackerBtn, _payBtn, _shareBtn;
        this._featuresLayer = new cc.Layer();
        this.addChild(this._featuresLayer);

        _progressTrackerBtn = new ccui.Button("btn_green_wide.png", "btn_green_wide_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        _progressTrackerBtn.name = "ProgressTracker";
        _progressTrackerBtn.anchorX = 0;
        _progressTrackerBtn.scale = 1.1;
        _progressTrackerBtn.x = 40 * Utils.getScaleFactorTo16And9();
        cc.log("SCALE: " + Utils.getScaleFactorTo16And9());
        _progressTrackerBtn.y = cc.winSize.height/2 + _progressTrackerBtn.height/2 + this._featuresBtnOffSetY;
        _progressTrackerBtn.addClickEventListener(this._btnPressed.bind(this));
        this._progressTrackerBtn = _progressTrackerBtn;

        var _progressTrackerBtnNormal = _progressTrackerBtn.getRendererNormal();
        var iconProgressTracker = new cc.Sprite("#icon-progress-tracker.png");
        iconProgressTracker.anchorX = 1;
        iconProgressTracker.x = _progressTrackerBtnNormal.width - 10;
        iconProgressTracker.y = _progressTrackerBtnNormal.height/2;
        iconProgressTracker.tag = 0;
        iconProgressTracker.name = "icon-progress-tracker";
        _progressTrackerBtnNormal.addChild(iconProgressTracker);

        var _progressTrackerBtnClick = _progressTrackerBtn.getRendererClicked();
        var iconProgressTrackerPressed = new cc.Sprite("#icon-progress-tracker-pressed.png");
        iconProgressTrackerPressed.anchorX = 1;
        iconProgressTrackerPressed.x = _progressTrackerBtnClick.width - 10;
        iconProgressTrackerPressed.y = _progressTrackerBtnClick.height/2;
        iconProgressTrackerPressed.tag = 0;
        iconProgressTrackerPressed.name = "icon-progress-tracker";
        _progressTrackerBtnClick.addChild(iconProgressTrackerPressed);
        // _progressTrackerBtn.addTouchEventListener(this.touchEvent, this);

        _shareBtn = new ccui.Button("btn_blue_wide.png", "btn_blue_wide_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        _shareBtn.name = "Share";
        _shareBtn.anchorX = 1;
        _shareBtn.scale = (_progressTrackerBtn.width + _shareBtn.width)>cc.winSize.width*0.8 ? 0.9 : 1.1;
        _shareBtn.x = cc.winSize.width - 40 * Utils.getScaleFactorTo16And9();
        _shareBtn.y = cc.winSize.height/2 + _progressTrackerBtn.height/2 + this._featuresBtnOffSetY;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));
        this._shareBtn = _shareBtn;
        _progressTrackerBtn.scale = _shareBtn.scale;

        var _shareBtnNormal = _shareBtn.getRendererNormal();
        var iconFaceChild = new cc.Sprite("#childrenface.png");
        iconFaceChild.anchorX = 1;
        iconFaceChild.tag = 0;
        iconFaceChild.name = "childrenface";
        iconFaceChild.x = _shareBtnNormal.width - 10;
        iconFaceChild.y = _shareBtnNormal.height/2;
        _shareBtnNormal.addChild(iconFaceChild);
        // _shareBtn.addTouchEventListener(this.touchEvent, this);

        var _shareBtnClick = _shareBtn.getRendererClicked();
        var iconFaceChildPressed = new cc.Sprite("#childrenface-pressed.png");
        iconFaceChildPressed.anchorX = 1;
        iconFaceChildPressed.tag = 0;
        iconFaceChildPressed.name = "childrenface";
        iconFaceChildPressed.x = _shareBtnClick.width - 10;
        iconFaceChildPressed.y = _shareBtnClick.height/2;
        _shareBtnClick.addChild(iconFaceChildPressed);

        _payBtn = new ccui.Button("button-yellow.png", "button-yellow-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        _payBtn.name = "Pay";
        _payBtn.anchorX = 0;
        _payBtn.anchorY = 0;
        _payBtn.x = 0;
        _payBtn.y = 0;
        _payBtn.addClickEventListener(this._btnPressed.bind(this));
        _payBtn.setContentSize(cc.size(cc.winSize.width, _payBtn.height));
        _payBtnTitle = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                30, 
                                                cc.color("#b15a10"), 
                                                3,
                                                localizeForWriting("Pay what's in your"));
        _payBtnTitle.x = cc.winSize.width/2;
        _payBtnTitle.y = _payBtn.height/2 + 10;
        _payBtn.addChild(_payBtnTitle);
        this._payBtn = _payBtn;
        
        var normalPay = _payBtn.getRendererNormal();
        var normalCoin = new cc.Sprite("#icon-coin.png");
        normalCoin.anchorX = 0;
        normalCoin.x = 35;
        normalCoin.y = normalPay.height + 20;
        normalPay.addChild(normalCoin);
        var normalAnimal = new cc.Sprite("#icon-shop.png");
        normalAnimal.anchorX = 1;
        normalAnimal.x = cc.winSize.width - 35;
        normalAnimal.y = normalPay.height + 30;
        normalPay.addChild(normalAnimal);
        var normalHeart = new cc.Sprite("#icon-heart.png");
        normalHeart.x = _payBtnTitle.x + _payBtnTitle.width/2 + 35;
        normalHeart.y = _payBtn.height/2;
        normalPay.addChild(normalHeart);

        var clickPay = _payBtn.getRendererClicked();
        var clickCoin = new cc.Sprite("#icon-coin-pressed.png");
        clickCoin.anchorX = 0;
        clickCoin.x = 35;
        clickCoin.y = clickPay.height + 20;
        clickPay.addChild(clickCoin);
        var clickAnimal = new cc.Sprite("#icon-shop-pressed.png");
        clickAnimal.anchorX = 1;
        clickAnimal.x = cc.winSize.width - 35;
        clickAnimal.y = clickPay.height + 30;
        clickPay.addChild(clickAnimal);
        var clickHeart = new cc.Sprite("#icon-heart-pressed.png");
        clickHeart.x = _payBtnTitle.x + _payBtnTitle.width/2 + 35;
        clickHeart.y = _payBtn.height/2;
        clickPay.addChild(clickHeart);

        _progressTrackerBtn.addChild(this._createBtnTitle(localizeForWriting("Progress Tracker"), _progressTrackerBtn));
        // _payBtn.addChild(this._createBtnTitle(localizeForWriting("Pay what's in your"), _payBtn, - 20));
        _shareBtn.addChild(this._createBtnTitle(localizeForWriting("Share the message"), _shareBtn));

        this._featuresLayer.addChild(_progressTrackerBtn);
        this._featuresLayer.addChild(_payBtn);
        this._featuresLayer.addChild(_shareBtn);
    },

    _addAboutUsBtn: function() {
        var _likeUsBtn, _followUsBtn, shareBtn;
        this._aboutUsLayer = new cc.Layer();
        this._aboutUsLayer.visible = false;
        this.addChild(this._aboutUsLayer);

        var lb = new cc.LabelBMFont(localizeForWriting(TEXT_AT_GROWNUP_1), "res/font/grownupcheckfont-export.fnt");
        lb.scale = 0.3;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/5 * 4 - 55;
        lb.setBoundingWidth(cc.winSize.width * 2);
        this._aboutUsLayer.addChild(lb);

        var buttonBg = new cc.Sprite("res/SD/aboutus/bg-aboutus.png");
        buttonBg.setAnchorPoint(0.5, 1);
        buttonBg.x = cc.winSize.width/2;
        buttonBg.y = lb.y - 50;
        this._aboutUsLayer.addChild(buttonBg);

        shareBtn = new ccui.Button("res/SD/aboutus/share-button-aboutus.png", "res/SD/aboutus/share-button-aboutus-pressed.png", "");
        shareBtn.name = "Share";
        shareBtn.anchorX = 0;
        shareBtn.x = 60;
        shareBtn.y = buttonBg.height/2;
        shareBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(shareBtn);

        _likeUsBtn = new ccui.Button(res.Button_facebook_normal_png, res.Button_facebook_pressed_png);
        _likeUsBtn.name = "LikeUs";
        _likeUsBtn.anchorY = 0;
        _likeUsBtn.x = shareBtn.x + shareBtn.width + _likeUsBtn.width/2 + 70;
        _likeUsBtn.y = shareBtn.y - shareBtn.height/2;
        _likeUsBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(_likeUsBtn);
        var lbLikeUs = new cc.LabelBMFont(localizeForWriting("Like us"), res.HomeFont_fnt);
        lbLikeUs.scale = 0.4;
        lbLikeUs.anchorY = 1;
        lbLikeUs.x = _likeUsBtn.width/2;
        lbLikeUs.y = - 6;
        _likeUsBtn.addChild(lbLikeUs);

        _followUsBtn = new ccui.Button("res/SD/aboutus/twitter.png", "res/SD/aboutus/twitter-pressed.png");
        _followUsBtn.name = "FollowUs";
        _followUsBtn.anchorY = 0;
        _followUsBtn.x = _likeUsBtn.x + _likeUsBtn.width + _followUsBtn.width/2 + 40;
        _followUsBtn.y = shareBtn.y - shareBtn.height/2;
        _followUsBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(_followUsBtn);
        var lbFollowUs = new cc.LabelBMFont(localizeForWriting("Follow us"), res.HomeFont_fnt);
        lbFollowUs.scale = 0.4;
        lbFollowUs.anchorY = 1;
        lbFollowUs.x = _followUsBtn.width/2;
        lbFollowUs.y = - 6;
        _followUsBtn.addChild(lbFollowUs);


        var lb2 = new cc.LabelBMFont(localizeForWriting(TEXT_AT_GROWNUP_2), "res/font/grownupcheckfont-export.fnt");
        lb2.scale = 0.4;
        lb2.anchorX = 0;
        lb2.anchorY = 1;
        lb2.x = - buttonBg.width/2 + buttonBg.x;
        lb2.y = buttonBg.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(lb2);
        lb2.setBoundingWidth(lb2.width/5 * 4);
        lb2.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        var lb3 = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 20, cc.color("#1679bd"), 1,localizeForWriting(TEXT_AT_GROWNUP_3));
        lb3.setColor(cc.color("#5ce9fd"));
        lb3.x = lb2.getBoundingBox().x + lb2.getBoundingBox().width/2;
        lb3.y = lb2.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(lb3);
        this._lbArray.push(lb3);
        lb3.name = "email";
        var textHolder = new cc.Sprite("#text-holder.png");
        textHolder.anchorX = 1;
        textHolder.anchorY = 1;
        textHolder.x = buttonBg.getBoundingBox().x + buttonBg.width;
        textHolder.y = buttonBg.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(textHolder);
        var lb4 = new cc.LabelBMFont(localizeForWriting(TEXT_AT_GROWNUP_4), "res/font/grownupcheckfont-export.fnt");
        lb4.setBoundingWidth(cc.winSize.width/2 + 150);
        lb4.scale = 0.3;
        lb4.x = textHolder.width/2;
        lb4.y = textHolder.height/2;
        textHolder.addChild(lb4);
        lb4.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._lbArray.push(textHolder);
        textHolder.name = "privacy";

        var lb5 = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 24, cc.color("#1679bd"), 1,localizeForWriting(TEXT_AT_GROWNUP_5));
        lb5.setColor(cc.color("#5ce9fd"));
        lb5.x = cc.winSize.width/2;
        lb5.y = 50;
        this._aboutUsLayer.addChild(lb5);
        var underLine = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 24, cc.color("#1679bd"), 1,"________________________");
        underLine.setColor(cc.color("#5ce9fd"))
        underLine.anchorX = 1;
        underLine.x = lb5.width;
        underLine.y = lb5.height/2 - 8;
        lb5.addChild(underLine);

        this._lbArray.push(lb5);
        lb5.name = "web";

    },

    _createBtnTitle: function (title, button, offsetX) {
        offsetX = offsetX || 0;
        var btnTitleConfig = labelConfig[button.name];
        // var btnTitle = new cc.LabelBMFont(title, res.HomeFont_fnt);
        var btnTitle = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                btnTitleConfig.fontSize, 
                                                cc.color(btnTitleConfig.color), 
                                                btnTitleConfig.outlineSize,
                                                localizeForWriting(title));

        // btnTitle.setDimensions(button.width * btnTitleConfig.boundingWidthRatio, button.height * btnTitleConfig.boundingHeightRatio);
        btnTitle.setLineHeight(btnTitle.getLineHeight() + 10);
        btnTitle.enableShadow(cc.color(btnTitleConfig.shadowColor[0], 
                                btnTitleConfig.shadowColor[1],
                                btnTitleConfig.shadowColor[2],
                                btnTitleConfig.shadowColor[3]
                            ),
                            cc.size(0, -btnTitleConfig.shadowSize)
        );
        btnTitle.anchorX = 0;
        btnTitle.x = 25 + offsetX;
        btnTitle.y = button.height/2;

        return btnTitle;
    },

    _tabPressed: function(button) {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        var tabName = button.name;
        this._bgBtnChoose.removeFromParent();
        this._currentButton.setZOrder(1);
        button.setZOrder(10);
        this._currentButton = button;
        this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
        this._bgBtnChoose.x = button.width/2 + 1;
        this._bgBtnChoose.y = button.height/2 - 1;
        var lbChoose = new cc.LabelBMFont(localizeForWriting(tabName), "res/font/grownupcheckfont-export.fnt");
        lbChoose.scale = 0.4;
        lbChoose.x = this._bgBtnChoose.width/2;
        lbChoose.y = this._bgBtnChoose.height/2 + 10;
        lbChoose.tag = 1;
        this._bgBtnChoose.addChild(lbChoose);
        button.addChild(this._bgBtnChoose)
        switch(tabName) {
            case "Features":
                this._showFeatures();
                break;
            case "About Us":
                this._showAboutUs();
                break;
            default:
                this._showFeatures();
                break;
        }
    },

    _btnPressed: function(button) {
        debugLog("pressed button " + button.name);
        var btnName = button.name;
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        switch(btnName) {
            case "Share":
                AnalyticsManager.getInstance().logCustomEvent(EVENT_SHARE_START);
                var tabName = this._aboutUsLayer.visible ? "About_page" : "Features_page";
                var layer = new ShareDialog(tabName);
                this.addChild(layer, 999999);
                break;
            case "LikeUs":
                cc.sys.openURL(FACEBOOK_FAN_PAGE)
                break;
            case "FollowUs":
                cc.sys.openURL(TWITTER_FAN_PAGE)
                break;
            case "ProgressTracker":
                AnalyticsManager.getInstance().logCustomEvent(EVENT_PROGRESS_CHECK);
                var layer = new ProgressTrackerLayer();
                this.addChild(layer, 999999);
                break;
            case "Pay":
                AnalyticsManager.getInstance().logCustomEvent(EVENT_PAY_PAGE_2);
                AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
                SceneFlowController.getInstance().setSceneGoAfterRewardScene("growupmenu");
                cc.director.replaceScene(new PayScene(function() {
                    cc.director.replaceScene(new GrownUpMenuScene());
                }));
                break;
            default:
                break;
        }
    },

    _showFeatures: function() {
        this._aboutUsLayer.visible = false;
        this._featuresLayer.visible = true;
    },

    _showAboutUs: function() {
        this._featuresLayer.visible = false;
        this._aboutUsLayer.visible = true;
    },

    addBackButton: function(){
        var self = this;
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = 50;
        button.y = cc.winSize.height - 70;
        this.addChild(button);
        button.addClickEventListener(function(){
            AudioManager.getInstance().play(res.back_sound_mp3, false, null);
            cc.director.replaceScene(new HomeScene());
        });
    },

    addSaveProgressButton: function(){
        var button = new ccui.Button("btn_save_progress.png", "btn_save_progress_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.anchorX = 0;
        button.scale = this._progressTrackerBtn.scale;
        button.x = 40 * Utils.getScaleFactorTo16And9();
        button.name = "Save";
        button.y = cc.rectGetMinY(this._progressTrackerBtn.getBoundingBox()) - button.height/2 *button.scale - this._featuresBtnOffSetY;
        this._featuresLayer.addChild(button);
        var self = this;
        button.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
            if (!FirebaseManager.getInstance().isLoggedIn()) {
                LoadingIndicator.show();
                FirebaseManager.getInstance().login(function(succeed, msg) {
                    LoadingIndicator.hide();
                    // debugLog("login succeed -> " + succeed);
                    // debugLog("child info -> " + JSON.stringify(User.getCurrentUser().getCurrentChild()));
                    cc.director.replaceScene(new WelcomeScene());
                });
            }
        });
        
        button.addChild(this._createBtnTitle(localizeForWriting("Save Progress"), button, button.width/4 - 35));
    },

    addUserIdLabel: function() {
        var userIdLabel = new cc.LabelBMFont("User ID: " + User.getCurrentUser().getId(), "res/font/grownupcheckfont-export.fnt");
        userIdLabel.scale = 0.4;
        userIdLabel.x = cc.winSize.width/2;
        // userIdLabel.anchorX = 0;
        userIdLabel.y = cc.rectGetMaxY(this._shareBtn.getBoundingBox()) + userIdLabel.height * userIdLabel.scale;
        this._featuresLayer.addChild(userIdLabel);
    },

    addGetUpdatesBtn: function() {
        startNewDailyLocalNotif();
        var hasGrantPermission = false; 
        if (cc.sys.os === cc.sys.OS_IOS) 
            hasGrantPermission = NativeHelper.callNative("hasGrantPermission", ["ACCESS_NOTIFICATION_POLICY"]) && KVDatabase.getInstance().getString("get_notifications", "");
        else if (cc.sys.os === cc.sys.OS_ANDROID) {
            hasGrantPermission = KVDatabase.getInstance().getString("get_notifications", "");
        }

        var b = new ccui.Button("btn_get_updates.png", "btn_get_updates_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        b.scale = this._shareBtn.scale;
        b.visible = (hasGrantPermission) ? false : true;
        b.setAnchorPoint(1, 0.5);
        b.x = this._shareBtn.x;
        b.y = cc.rectGetMinY(this._shareBtn.getBoundingBox()) - b.height/2 * b.scale - this._featuresBtnOffSetY;

        b.addClickEventListener(function() {
            if (cc.sys.os === cc.sys.OS_IOS)
                NativeHelper.callNative("requestPermission", ["ACCESS_NOTIFICATION_POLICY"]);
            else {
                // hasGrantPermission is always true on Android for The versions below API 19
                b.visible = false;
                KVDatabase.getInstance().set("get_notifications", true);
                startNewDailyLocalNotif();
                startNewTwoDaysLocalNotif();
                NativeHelper.callNative("showMessage", ["The School Of Games", "We'll keep you posted on learning progress"]);
            }
        }.bind(this));

        this.addChild(b, 99);

        var btnTitleConfig = {
            "color": "#ffffff",
            "shadowColor": [183, 188, 255, 127],
            "shadowSize": 1,
            "shadowRadius": 1,
            "fontSize": 26,
            "outlineSize": 0.5,
            "boundingWidthRatio": -1,
            "boundingHeightRatio": 1
        };
        var btnTitle = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 
                                                btnTitleConfig.fontSize, 
                                                cc.color(btnTitleConfig.color), 
                                                btnTitleConfig.outlineSize,
                                                localizeForWriting("Get Progress Updates"));

        btnTitle.setLineHeight(btnTitle.getLineHeight() + 10);
        btnTitle.enableShadow(cc.color(btnTitleConfig.shadowColor[0], 
                                btnTitleConfig.shadowColor[1],
                                btnTitleConfig.shadowColor[2],
                                btnTitleConfig.shadowColor[3]
                            ),
                            cc.size(0, -btnTitleConfig.shadowSize)
        );
        btnTitle.x = b.width/2 - 3;
        btnTitle.y = b.height/2;
        b.addChild(btnTitle);

        this.getUpdatesBtn = b;

        // this.schedule(this.setUpdatesButtonOnOrOff, 0.5);
    },

    setUpdatesButtonOnOrOff: function() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            var hasGrantPermission = NativeHelper.callNative("hasGrantPermission", ["ACCESS_NOTIFICATION_POLICY"]) && KVDatabase.getInstance().getString("get_notifications", "");
            this.getUpdatesBtn.visible = (hasGrantPermission) ? false : true;
            this.getUpdatesBtn.setEnabled(!hasGrantPermission);
        }

    },

});

var labelConfig = {
    "Share": {
        "color": "#2287c5",
        "shadowColor": [34, 135, 197, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 20,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.3
    },
    "Pay": {
        "color": "#b15a10",
        "shadowColor": [167, 90, 0, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 18,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.3
    },
    "ProgressTracker": {
        "color": "#18a401",
        "shadowColor": [17, 160, 0, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 22,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.3
    },
    "Save": {
        "color": "#b15a10",
        "shadowColor": [167, 90, 0, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 22,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.3
    }
};

var GrownUpMenuScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.addChild(new GrownUpMenuLayer());
    }
});