var MissionPageBeforeLogin = cc.Layer.extend({
    _loggedIn: false,

    _contentTextScale: 0.35,
    _contentTextOffSetY: 5,

    _buttonOffSetY: 10,

    _backgroundZOrder: 1,
    _childrenZOrder: 3,
    _cloudZOrder: 2,
    _grownupCheckDialogZOrder: 5,

    _childrenOffSetY: 0,

    ctor: function() {
        this._super();

        this._addBackground();
        this._addMissionContent();
        this._addButtons();

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
    },

    _addButtons: function() {
        var b = new ccui.Button("btn_pay_with_heart.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width/2 - b.width/2 - 20;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);

        b.addClickEventListener(this._payBtnPressed.bind(this));

        var lb = new cc.LabelBMFont("Pay with your", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2 - 30;
        lb.y = b.height/2 + 10;
        b.addChild(lb);

        b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "play";

        var lb = new cc.LabelBMFont("Play for free", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 10;
        b.addChild(lb);
        
        b.x = cc.winSize.width/2 + b.width/2 + 20;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);

        b.addClickEventListener(this._playBtnPressed.bind(this));

    },

    _addLaterBtn: function() {
        var b = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        b.x = cc.winSize.width/2 - b.width/2 - 20;
        b.y = b.height/2;
        this.addChild(b, this._childrenZOrder);
        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            cc.director.replaceScene(new GrownUpMenuScene());
        }.bind(this));

        var content = "Maybe later!";
        var lb = new cc.LabelBMFont(content, res.HomeFont_fnt);
        lb.scale = 0.3;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + this._contentTextOffSetY;
        b.addChild(lb);

        b = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        b.x = cc.winSize.width/2 + b.width/2 + 20;
        b.y = b.height/2;
        this.addChild(b, this._childrenZOrder);
        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            cc.director.replaceScene(new HomeScene());
        }.bind(this));

        content = "Back to Home";
        lb = new cc.LabelBMFont(content, res.HomeFont_fnt);
        lb.scale = 0.3;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + this._contentTextOffSetY;
        b.addChild(lb);
    },

    _addMissionContent: function() {
        var lCloud = new cc.Sprite("#left_cloud.png");
        lCloud.setAnchorPoint(0, 1);
        lCloud.y = cc.winSize.height;
        this.addChild(lCloud, this._cloudZOrder);

        var content = "Equal education to every child";
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

        content = "When you pay with your      we educate a child in need";
        var rContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        rContent.scale = this._contentTextScale;
        rContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        rContent.x = rCloud.width/2 - 4;
        rContent.y = rCloud.height/2 + this._contentTextOffSetY + 10;
        rContent.boundingWidth = rCloud.width * 2.3;
        rCloud.addChild(rContent);

        var iconHeart = new cc.Sprite("#icon_heart.png");
        iconHeart.scale = 0.7;
        iconHeart.x = rCloud.width * 0.9;
        iconHeart.y = rCloud.height * 0.8;
        rCloud.addChild(iconHeart);
    },

    _grownUpCheckCallback: function() {
        SceneFlowController.getInstance().setSceneGoAfterRewardScene("welcome");
        cc.director.replaceScene(new PayScene(function() {
            cc.director.replaceScene(new MissionPageBeforeLoginScene());
        }));
    },

    _payBtnPressed: function() {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        if (User.isLoggedIn())
            this.addChild(new GrownUpCheckDialog(this._grownUpCheckCallback), this._grownupCheckDialogZOrder);
        else {
            LoadingIndicator.show();
            FirebaseManager.getInstance().login(function(succeed, msg) {
                // debugLog("gonna remove loading indicator");
                if (succeed) {
                    LoadingIndicator.hide();
                    this.addChild(new GrownUpCheckDialog(this._grownUpCheckCallback), this._grownupCheckDialogZOrder);
                } else {
                    LoadingIndicator.hide();
                }
            }.bind(this));
        }
    },

    _playBtnPressed: function() {
        AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        if (User.isLoggedIn())
            cc.director.replaceScene(new WelcomeScene());
        else {
            LoadingIndicator.show();
            FirebaseManager.getInstance().login(function(succeed, msg) {
                // debugLog("gonna remove loading indicator");
                if (succeed) {
                    LoadingIndicator.hide();
                    cc.director.replaceScene(new WelcomeScene());
                } else {
                    LoadingIndicator.hide();
                }
            });
        }
    },

});

var MissionPageBeforeLoginScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        this.addChild(new MissionPageBeforeLogin());
    }
});