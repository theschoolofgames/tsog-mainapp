var GrownUpMenuLayer = cc.LayerColor.extend({
    _featuresLayer: null,
    _aboutUsLayer: null,

    ctor: function() {
        this._super(cc.color(255, 255, 255));

        this._addTabs();
        this._addFeaturesBtn();
        this._addAboutUsBtn();
        this.addBackButton();
    },

    _addTabs: function() {
        this._addTabBtn("Features", cc.winSize.width/2, cc.winSize.height - 100, -0.5);
        this._addTabBtn("AboutUs", cc.winSize.width/2, cc.winSize.height - 100, 0.5);
    },

    _addTabBtn: function(tabName, x, y, offsetX) {
        var _btn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _btn.x = x + _btn.width*offsetX;
        _btn.y = y;
        _btn.name = tabName;

        _btn.addClickEventListener(this._tabPressed.bind(this));

        var btnTitle = this._createBtnTitle(localizeForWriting(tabName), _btn);
        _btn.addChild(btnTitle);

        this.addChild(_btn);
    },

    _addFeaturesBtn: function() {
        var _progressTrackerBtn, _payBtn, _shareBtn;
        this._featuresLayer = new cc.Layer();
        this.addChild(this._featuresLayer);

        _progressTrackerBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _progressTrackerBtn.name = "ProgressTracker";
        _progressTrackerBtn.scale = 1.5;
        _progressTrackerBtn.x = cc.winSize.width/4;
        _progressTrackerBtn.y = cc.winSize.height/2 + _progressTrackerBtn.height;
        _progressTrackerBtn.addClickEventListener(this._btnPressed.bind(this));

        _payBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _payBtn.name = "Pay";
        _payBtn.scale = 1.5;
        _payBtn.x = cc.winSize.width/4 * 3;
        _payBtn.y = cc.winSize.height/2 + _payBtn.height;
        _payBtn.addClickEventListener(this._btnPressed.bind(this));

        _shareBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _shareBtn.name = "Share";
        _shareBtn.scale = 1.5;
        _shareBtn.x = cc.winSize.width/4;
        _shareBtn.y = cc.winSize.height/2 - _shareBtn.height;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));

        _progressTrackerBtn.addChild(this._createBtnTitle(localizeForWriting("Progress Tracker"), _progressTrackerBtn));
        _payBtn.addChild(this._createBtnTitle(localizeForWriting("Pay with Your Heart"), _payBtn));
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
        _likeUsBtn.scale = 1.5;
        _likeUsBtn.name = "LikeUs";
        _likeUsBtn.x = cc.winSize.width/2;
        _likeUsBtn.y = cc.winSize.height/2 + _likeUsBtn.height;
        _likeUsBtn.addClickEventListener(this._btnPressed.bind(this));

        _followUsBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _followUsBtn.name = "FollowUs";
        _followUsBtn.scale = 1.5;
        _followUsBtn.x = cc.winSize.width/4 * 3;
        _followUsBtn.y = cc.winSize.height/2 + _followUsBtn.height;
        _followUsBtn.addClickEventListener(this._btnPressed.bind(this));

        _shareBtn = new ccui.Button("block-empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        _shareBtn.name = "Share";
        _shareBtn.scale = 1.5;
        _shareBtn.x = cc.winSize.width/4;
        _shareBtn.y = cc.winSize.height/2 + _shareBtn.height;
        _shareBtn.addClickEventListener(this._btnPressed.bind(this));

        _likeUsBtn.addChild(this._createBtnTitle(localizeForWriting("Like Us"), _likeUsBtn));
        _followUsBtn.addChild(this._createBtnTitle(localizeForWriting("Follow Us"), _followUsBtn));
        _shareBtn.addChild(this._createBtnTitle(localizeForWriting("Share & Spread the message"), _shareBtn));

        this._aboutUsLayer.addChild(_likeUsBtn);
        this._aboutUsLayer.addChild(_followUsBtn);
        this._aboutUsLayer.addChild(_shareBtn);
    },

    _createBtnTitle: function (title, button) {
        var btnTitle = new cc.LabelBMFont(title, res.HudFont_fnt);
        btnTitle.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        btnTitle.scale = 0.5 / button.scale;
        btnTitle.setBoundingWidth(button.width * 2);
        btnTitle.x = button.width/2;
        btnTitle.y = button.height/2;

        return btnTitle;
    },

    _tabPressed: function(button) {
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
            cc.director.replaceScene(new HomeScene());
        });
    },

});

var GrownUpMenuScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.addChild(new GrownUpMenuLayer());
    }
});