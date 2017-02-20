var MissionPageLayer = cc.Layer.extend({
    _hasLaterBtn: false,

    _contentTextScale: 0.35,
    _contentTextOffSetY: 5,

    _buttonOffSetY: 10,

    _backgroundZOrder: 1,
    _childrenZOrder: 3,
    _cloudZOrder: 2,

    _childrenOffSetY: 0,

    ctor: function(hasLaterBtn) {
        this._super();
        this._hasLaterBtn = hasLaterBtn;

        debugLog("MissionPageLayer ctor _hasLaterBtn -> " + this._hasLaterBtn);
        if (hasLaterBtn) {
            this._childrenOffSetY = 50;
            this._addLaterBtn();
        }

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

        b.addClickEventListener(this._btnPressed.bind(this));

        var lb = new cc.LabelBMFont("Pay with your", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2 - 30;
        lb.y = b.height/2 + 10;
        b.addChild(lb);

        if (this._hasLaterBtn) {
            b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
            b.name = "share";

            var lb = new cc.LabelBMFont("Share & Spread the message", res.HomeFont_fnt);
            lb.scale = 0.3;
            lb.boundingWidth = b.width*2;
        } else {
            b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
            b.name = "play";

            var lb = new cc.LabelBMFont("Play for free", res.HomeFont_fnt);
            lb.scale = 0.4;
        }
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 10;
        b.addChild(lb);
        
        b.x = cc.winSize.width/2 + b.width/2 + 20;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);

        b.addClickEventListener(this._btnPressed.bind(this));

    },

    _addLaterBtn: function() {
        var b = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        b.x = cc.winSize.width/2 - b.width/2 - 20;
        b.y = b.height/2;
        this.addChild(b, this._childrenZOrder);
        b.addClickEventListener(function() {
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

        var content = "When you pay with your heart, we educate a child in need";
        var lContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        lContent.scale = this._contentTextScale;
        lContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lContent.x = lCloud.width/2;
        lContent.y = lCloud.height/2 + this._contentTextOffSetY;
        lContent.boundingWidth = lCloud.width * 2;
        lCloud.addChild(lContent);

        var rCloud = new cc.Sprite("#right_cloud.png");
        rCloud.setAnchorPoint(1, 1);
        rCloud.x = cc.winSize.width;
        rCloud.y = cc.winSize.height;
        this.addChild(rCloud, this._cloudZOrder);

        content = "Our mission is provide equal education to every child";
        var rContent = new cc.LabelBMFont(content, res.Grown_Up_fnt);
        rContent.scale = this._contentTextScale;
        rContent.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        rContent.x = rCloud.width/2;
        rContent.y = rCloud.height/2 + this._contentTextOffSetY;
        rContent.boundingWidth = rCloud.width * 2;
        rCloud.addChild(rContent);
    },

    _btnPressed: function(button) {
        var btnName = button.name;
        switch(btnName) {
            case "pay":
                if (User.isLoggedIn())
                    this.addChild(new GrownUpCheckDialog(this._payCallBack), this._childrenZOrder+1);
                else {
                    LoadingIndicator.show();
                    FirebaseManager.getInstance().login(function(succeed, msg) {
                        // debugLog("gonna remove loading indicator");
                        if (succeed) {
                            LoadingIndicator.hide();
                            this.addChild(new GrownUpCheckDialog(this._payCallBack));
                        } else {
                            LoadingIndicator.hide();
                        }
                    }.bind(this))    
                }
                break;
            case "play":
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
                    })
                }
                break;
            case "share":
                var layer = new ShareDialog("Mission_page");
                this.addChild(layer, 999999);
            default:
                break;
        }
    },

    _payCallBack: function() {
        cc.director.replaceScene(new PayScene());
    },

});

var MissionPageScene = cc.Scene.extend({
    ctor: function(hasLaterBtn) {
        this._super();

        this.addChild(new MissionPageLayer(hasLaterBtn));
    }
});