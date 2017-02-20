var MissionPageAfterLogin = MissionPageBeforeLogin.extend({
    _childrenOffSetY: 0,
    _btnPay: null,

    ctor: function() {
        this._super();

        this._childrenOffSetY = 50;
        this._addLaterBtn();
    },

    _addButtons: function() {
        var b = new ccui.Button("btn_pay_with_heart.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width/2;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);
        this._btnPay = b;

        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            SceneFlowController.getInstance().setSceneGoAfterRewardScene("growupmenu");
            cc.director.replaceScene(new PayScene(function() {
                cc.director.replaceScene(new GrownUpMenuScene());    
            }));
        }.bind(this));

        var lb = new cc.LabelBMFont("Pay with your", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2 - 30;
        lb.y = b.height/2 + 10;
        b.addChild(lb);

        b = new ccui.Button("btn_share_wide.png", "btn_share_wide_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "share";

        var shareImg = new cc.Sprite("#icon_share.png");
        shareImg.x = b.width - shareImg.width - 10;
        shareImg.y = b.height/2;
        b.addChild(shareImg);

        var lb = new cc.LabelBMFont("Share", res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.boundingWidth = b.width*2;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 10;
        b.addChild(lb);
        
        b.x = cc.winSize.width/2 - this._btnPay.width - 10;
        b.y = this._btnPay.y;
        this.addChild(b);

        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            this.addChild(new ShareDialog("Mission_page"), 99);
        }.bind(this));

    },

    _addLaterBtn: function() {
        var b = new ccui.Button("btn_later.png", "btn_later_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        b.x = cc.winSize.width/2 + this._btnPay.width + 10;
        b.y = this._btnPay.y;
        this.addChild(b, this._childrenZOrder);
        b.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            cc.director.replaceScene(new GrownUpMenuScene());
        }.bind(this));

        var content = "Maybe later!";
        var lb = new cc.LabelBMFont(content, res.HomeFont_fnt);
        lb.scale = 0.4;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + this._contentTextOffSetY;
        b.addChild(lb);
    },
});

var MissionPageAfterLoginScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        this.addChild(new MissionPageAfterLogin());
    }
});