var GrownUpMenuLayer = cc.LayerColor.extend({
    _featuresLayer: null,
    _aboutUsLayer: null,
    _lbArray: [],
    _featuresBtnOffSetY: 50,

    ctor: function() {
        this._super(cc.color(255, 255, 255));
        this._lbArray = [];
        this._addBackground();
        this._addPageBorders();
        this._addTabs();
        this._addFeaturesBtn();
        this._addAboutUsBtn();
        this.addBackButton();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
        }, this);
    },

    onTouchBegan:function(touch, event) {
        var touchedPos = touch.getLocation();
        for(var i = 0; i < this._lbArray.length; i++) {
            var node = this._lbArray[i];
            var isRectContainsPoint = cc.rectContainsPoint(node.getBoundingBox(), touchedPos);
            if(isRectContainsPoint) {
                this._startTouchPosition = touchedPos;
                this._isTouching = true;
                cc.log("TOUCHING TEXT: " + node.name);
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
        this.addChild(bottomBorder);
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
        this._addTabBtn("About us", cc.winSize.width/2 - 1, cc.winSize.height - 75, 0.5);
    },

    _addTabBtn: function(tabName, x, y, offsetX) {
        var _btn = new ccui.Button("res/SD/progresstracker/tab-normal.png", "res/SD/progresstracker/tab-normal.png", "");
        _btn.x = x + _btn.width*offsetX;
        _btn.y = y;
        _btn.name = tabName;
        if(tabName == "Features"){
            _btn.setZOrder(10);
            this._currentButton = _btn;
            this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
            this._bgBtnChoose.x = _btn.width/2 + 1;
            this._bgBtnChoose.y = _btn.height/2 - 1;
            _btn.addChild(this._bgBtnChoose, 10);
            var lbChoose = new cc.LabelBMFont(tabName, "res/font/grownupcheckfont-export.fnt");
            lbChoose.scale = 0.4;
            lbChoose.x = this._bgBtnChoose.width/2;
            lbChoose.y = this._bgBtnChoose.height/2 + 10;
            lbChoose.tag = 1;
            this._bgBtnChoose.addChild(lbChoose);
        };
        var title = new cc.LabelBMFont(tabName, "res/font/progresstrackerfont-export.fnt");
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
        _progressTrackerBtn.scale = 1.1;
        _progressTrackerBtn.x = cc.winSize.width/2;
        _progressTrackerBtn.y = cc.winSize.height/2 + _progressTrackerBtn.height/2 + this._featuresBtnOffSetY;
        _progressTrackerBtn.addClickEventListener(this._btnPressed.bind(this));

        _shareBtn = new ccui.Button("btn_blue_wide.png", "btn_blue_wide_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        _shareBtn.name = "Share";
        _shareBtn.scale = 1.1;
        _shareBtn.x = cc.winSize.width/2;
        _shareBtn.y = _progressTrackerBtn.y - _shareBtn.height - this._featuresBtnOffSetY;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));

        _payBtn = new ccui.Button("btn_pay_with_heart_features_menu.png", "btn_pay_with_heart_features_menu_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        _payBtn.name = "Pay";
        _payBtn.scale = 1.1;
        _payBtn.x = cc.winSize.width/2;
        _payBtn.y = _progressTrackerBtn.y - _payBtn.height*2 - this._featuresBtnOffSetY*2;
        _payBtn.addClickEventListener(this._btnPressed.bind(this));

        _progressTrackerBtn.addChild(this._createBtnTitle(localizeForWriting("Progress Tracker"), _progressTrackerBtn));
        _payBtn.addChild(this._createBtnTitle(localizeForWriting("Pay what's in your"), _payBtn, -30));
        _shareBtn.addChild(this._createBtnTitle(localizeForWriting("Share & Spread the message"), _shareBtn));

        this._featuresLayer.addChild(_progressTrackerBtn);
        this._featuresLayer.addChild(_payBtn);
        this._featuresLayer.addChild(_shareBtn);
    },

    _addAboutUsBtn: function() {
        var _likeUsBtn, _followUsBtn, _shareBtn;
        this._aboutUsLayer = new cc.Layer();
        this._aboutUsLayer.visible = false;
        this.addChild(this._aboutUsLayer);

        var lb = new cc.LabelBMFont(TEXT_AT_GROWNUP_1, "res/font/grownupcheckfont-export.fnt");
        lb.scale = 0.3;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/5 * 4 - 40;
        lb.setBoundingWidth(cc.winSize.width * 2);
        this._aboutUsLayer.addChild(lb);

        var buttonBg = new cc.Sprite("res/SD/aboutus/bg-aboutus.png");
        buttonBg.setAnchorPoint(0.5, 1);
        buttonBg.x = cc.winSize.width/2;
        buttonBg.y = lb.y - 50;
        this._aboutUsLayer.addChild(buttonBg);


        _shareBtn = new ccui.Button("res/SD/aboutus/share-button-aboutus.png", "res/SD/aboutus/share-button-aboutus-pressed.png", "");
        _shareBtn.name = "Share";
        _shareBtn.anchorX = 0;
        _shareBtn.x = 60;
        _shareBtn.y = buttonBg.height/2;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(_shareBtn);

        _likeUsBtn = new ccui.Button(res.Button_facebook_normal_png, res.Button_facebook_pressed_png);
        _likeUsBtn.name = "LikeUs";
        _likeUsBtn.anchorY = 0;
        _likeUsBtn.x = _shareBtn.x + _shareBtn.width + _likeUsBtn.width/2 + 70;
        _likeUsBtn.y = _shareBtn.y - _shareBtn.height/2;
        _likeUsBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(_likeUsBtn);
        var lbLikeUs = new cc.LabelBMFont("Like us", res.HomeFont_fnt);
        lbLikeUs.scale = 0.4;
        lbLikeUs.anchorY = 1;
        lbLikeUs.x = _likeUsBtn.width/2;
        lbLikeUs.y = - 6;
        _likeUsBtn.addChild(lbLikeUs);

        _followUsBtn = new ccui.Button("res/SD/aboutus/twitter.png", "res/SD/aboutus/twitter-pressed.png");
        _followUsBtn.name = "FollowUs";
        _followUsBtn.anchorY = 0;
        _followUsBtn.x = _likeUsBtn.x + _likeUsBtn.width + _followUsBtn.width/2 + 40;
        _followUsBtn.y = _shareBtn.y - _shareBtn.height/2;
        _followUsBtn.addClickEventListener(this._btnPressed.bind(this));
        buttonBg.addChild(_followUsBtn);
        var lbFollowUs = new cc.LabelBMFont("Follow us", res.HomeFont_fnt);
        lbFollowUs.scale = 0.4;
        lbFollowUs.anchorY = 1;
        lbFollowUs.x = _followUsBtn.width/2;
        lbFollowUs.y = - 6;
        _followUsBtn.addChild(lbFollowUs);


        var lb2 = new cc.LabelBMFont(TEXT_AT_GROWNUP_2, "res/font/grownupcheckfont-export.fnt");
        lb2.scale = 0.4;
        lb2.anchorX = 0;
        lb2.anchorY = 1;
        lb2.x = - buttonBg.width/2 + buttonBg.x;
        lb2.y = buttonBg.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(lb2);
        lb2.setBoundingWidth(lb2.width/5 * 4);
        lb2.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        var lb3 = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 20, cc.color("#1679bd"), 1,TEXT_AT_GROWNUP_3);
        lb3.setColor(cc.color("#5ce9fd"));
        lb3.x = lb2.getBoundingBox().x + lb2.getBoundingBox().width/2;
        lb3.y = lb2.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(lb3);
        this._lbArray.push(lb3);
        lb3.name = "email";

        var lb4 = new cc.LabelBMFont(TEXT_AT_GROWNUP_4, "res/font/grownupcheckfont-export.fnt");
        lb4.setBoundingWidth(cc.winSize.width/2);
        lb4.scale = 0.4;
        lb4.anchorX = 1;
        lb4.anchorY = 1;
        lb4.x = buttonBg.getBoundingBox().x + buttonBg.width;
        lb4.y = buttonBg.getBoundingBox().y - 20;
        this._aboutUsLayer.addChild(lb4);
        lb4.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._lbArray.push(lb4);
        lb4.name = "privacy";

        var lb5 = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 24, cc.color("#1679bd"), 1,TEXT_AT_GROWNUP_5);
        lb5.setColor(cc.color("#5ce9fd"));
        lb5.x = cc.winSize.width/2;
        lb5.y = 50;
        this._aboutUsLayer.addChild(lb5);
        this._lbArray.push(lb5);
        lb5.name = "web";
        // _likeUsBtn.addChild(this._createBtnTitle(localizeForWriting("Like Us"), _likeUsBtn));
        // _followUsBtn.addChild(this._createBtnTitle(localizeForWriting("Follow Us"), _followUsBtn));
        // _shareBtn.addChild(this._createBtnTitle(localizeForWriting("Share & Spread the message"), _shareBtn));

    },

    _createBtnTitle: function (title, button, offsetX) {
        offsetX = offsetX || 0;
        var btnTitleConfig = labelConfig[button.name];
        // var btnTitle = new cc.LabelBMFont(title, res.HomeFont_fnt);
        var btnTitle = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], btnTitleConfig.fontSize, cc.color(btnTitleConfig.color), btnTitleConfig.outlineSize,title);

        btnTitle.setDimensions(button.width * btnTitleConfig.boundingWidthRatio, button.height * btnTitleConfig.boundingHeightRatio);
        btnTitle.setLineHeight(btnTitle.getLineHeight() + 10);
        btnTitle.enableShadow(cc.color(btnTitleConfig.shadowColor[0], 
                                btnTitleConfig.shadowColor[1],
                                btnTitleConfig.shadowColor[2],
                                btnTitleConfig.shadowColor[3]
                            ),
                            cc.size(0, -btnTitleConfig.shadowSize)
        );
        btnTitle.x = button.width/2 + offsetX;
        btnTitle.y = button.height/2;

        return btnTitle;
    },

    _tabPressed: function(button) {
        var tabName = button.name;
        this._bgBtnChoose.removeFromParent();
        this._currentButton.setZOrder(1);
        button.setZOrder(10);
        this._currentButton = button;
        this._bgBtnChoose = new cc.Sprite("res/SD/progresstracker/tab.png");
        this._bgBtnChoose.x = button.width/2 + 1;
        this._bgBtnChoose.y = button.height/2 - 1;
        var lbChoose = new cc.LabelBMFont(tabName, "res/font/grownupcheckfont-export.fnt");
        lbChoose.scale = 0.4;
        lbChoose.x = this._bgBtnChoose.width/2;
        lbChoose.y = this._bgBtnChoose.height/2 + 10;
        lbChoose.tag = 1;
        this._bgBtnChoose.addChild(lbChoose);
        button.addChild(this._bgBtnChoose)
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
        switch(tabName) {
            case "Features":
                this._showFeatures();
                break;
            case "About us":
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
        switch(btnName) {
            case "Share":
                var layer = new ShareDialog();
                this.addChild(layer, 999999);
                break;
            case "LikeUs":
                cc.sys.openURL(FACEBOOK_FAN_PAGE)
                break;
            case "FollowUs":
                cc.sys.openURL(TWITTER_FAN_PAGE)
                break;
            case "ProgressTracker":
                var layer = new ProgressTrackerLayer();
                this.addChild(layer, 999999);
                break;
            case "Pay":
                cc.director.replaceScene(new PayScene());
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
            cc.director.replaceScene(new HomeScene());
        });
    },

});

var labelConfig = {
    "Share": {
        "color": "#2287c5",
        "shadowColor": [34, 135, 197, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 18,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.5
    },
    "Pay": {
        "color": "#b15a10",
        "shadowColor": [167, 90, 0, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 18,
        "outlineSize": 1.5,
        "boundingWidthRatio": 0.6,
        "boundingHeightRatio": 0.5
    },
    "ProgressTracker": {
        "color": "#18a401",
        "shadowColor": [17, 160, 0, 127],
        "shadowSize": 2,
        "shadowRadius": 6,
        "fontSize": 20,
        "outlineSize": 1.5,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.4
    }
};

var GrownUpMenuScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.addChild(new GrownUpMenuLayer());
    }
});