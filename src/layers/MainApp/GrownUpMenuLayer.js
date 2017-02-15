var GrownUpMenuLayer = cc.LayerColor.extend({
    _featuresLayer: null,
    _aboutUsLayer: null,

    _featuresBtnOffSetY: 50,

    ctor: function() {
        this._super(cc.color(255, 255, 255));

        this._addBackground();
        this._addPageBorders();
        this._addTabs();
        this._addFeaturesBtn();
        this._addAboutUsBtn();
        this.addBackButton();
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
        this._addTabBtn("Features", cc.winSize.width/2, cc.winSize.height - 100, -0.5);
        this._addTabBtn("AboutUs", cc.winSize.width/2, cc.winSize.height - 100, 0.5);
    },

    _addTabBtn: function(tabName, x, y, offsetX) {
        var _btn = new ccui.Button("res/SD/progresstracker/tab-normal.png", "res/SD/progresstracker/tab-normal.png", "");
        _btn.x = x + _btn.width*offsetX;
        _btn.y = y;
        _btn.name = tabName;

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
        _payBtn.addChild(this._createBtnTitle(localizeForWriting("Pay what's in your"), _payBtn));
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

        _likeUsBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _likeUsBtn.name = "LikeUs";
        _likeUsBtn.x = cc.winSize.width/2;
        _likeUsBtn.y = cc.winSize.height/2 + _likeUsBtn.height;
        _likeUsBtn.addClickEventListener(this._btnPressed.bind(this));

        _followUsBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _followUsBtn.name = "FollowUs";
        _followUsBtn.x = cc.winSize.width/4 * 3;
        _followUsBtn.y = cc.winSize.height/2 + _followUsBtn.height;
        _followUsBtn.addClickEventListener(this._btnPressed.bind(this));

        _shareBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _shareBtn.name = "Share";
        _shareBtn.x = cc.winSize.width/4;
        _shareBtn.y = cc.winSize.height/2 + _shareBtn.height;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));

        // _likeUsBtn.addChild(this._createBtnTitle(localizeForWriting("Like Us"), _likeUsBtn));
        // _followUsBtn.addChild(this._createBtnTitle(localizeForWriting("Follow Us"), _followUsBtn));
        // _shareBtn.addChild(this._createBtnTitle(localizeForWriting("Share & Spread the message"), _shareBtn));

        this._aboutUsLayer.addChild(_likeUsBtn);
        this._aboutUsLayer.addChild(_followUsBtn);
        this._aboutUsLayer.addChild(_shareBtn);
    },

    _createBtnTitle: function (title, button) {
        var btnTitleConfig = labelConfig[button.name];
        // var btnTitle = new cc.LabelBMFont(title, res.HomeFont_fnt);
        cc.log("btnTitleConfig" + JSON.stringify(btnTitleConfig));
        var btnTitle = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], btnTitleConfig.fontSize, cc.color(btnTitleConfig.color), btnTitleConfig.outlineSize,title);
        // btnTitle.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        // btnTitle.scale = 0.5 / button.scale * scale;
        btnTitle.setDimensions(button.width * btnTitleConfig.boundingWidthRatio, button.height * btnTitleConfig.boundingHeightRatio);
        btnTitle.x = button.width/2;
        btnTitle.y = button.height/2;

        return btnTitle;
    },

    _tabPressed: function(button) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
        var tabName = button.name;
        switch(tabName) {
            case "Features":
                this._showFeatures();
                break;
            case "AboutUs":
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
                break;
            case "FollowUs":
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
        button.y = cc.winSize.height - 50;
        this.addChild(button);
        button.addClickEventListener(function(){
            cc.director.replaceScene(new MissionPageScene(true));
        });
    },

});

var labelConfig = {
    "Share": {
        "color": "#2287c5",
        "fontSize": 22,
        "outlineSize": 2,
        "boundingWidthRatio": 1,
        "boundingHeightRatio": 0.5
    },
    "Pay": {
        "color": "#b15a10",
        "fontSize": 22,
        "outlineSize": 2,
        "boundingWidthRatio": 0.6,
        "boundingHeightRatio": 0.5
    },
    "ProgressTracker": {
        "color": "#18a401",
        "fontSize": 24,
        "outlineSize": 2,
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