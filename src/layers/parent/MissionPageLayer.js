var MissionPageLayer = cc.Layer.extend({
    _contentTextScale: 0.35,
    _contentTextOffSetY: 5,

    _buttonOffSetY: 10,

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
    },

    _addButtons: function() {
        var b = new ccui.Button("btn_pay_with_heart.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width/2 - b.width/2 - 20;
        b.y = b.height - this._buttonOffSetY;
        this.addChild(b);

        b.addClickEventListener(this._btnPressed.bind(this));

        b = new ccui.Button("btn_play_for_free.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "play";
        b.x = cc.winSize.width/2 + b.width/2 + 20;
        b.y = b.height - this._buttonOffSetY;
        this.addChild(b);

        b.addClickEventListener(this._btnPressed.bind(this));
    },

    _addMissionContent: function() {
        var lCloud = new cc.Sprite("#left_cloud.png");
        lCloud.setAnchorPoint(0, 1);
        lCloud.y = cc.winSize.height;
        this.addChild(lCloud);

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
        this.addChild(rCloud);

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
                    this.addChild(new GrownUpCheckDialog(this._payCallBack));
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
            default:
                break;
        }
    },

    _payCallBack: function() {
        cc.director.replaceScene(new PayScene());
    },

});

var MissionPageScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        this.addChild(new MissionPageLayer());
    }
});