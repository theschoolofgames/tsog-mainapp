var MissionPageAfterLogin = MissionPageBeforeLogin.extend({
    _childrenOffSetY: 0,

    ctor: function() {
        this._super();

        this._childrenOffSetY = 50;
        this._addLaterBtn();
    },

    _addButtons: function() {
        var b = new ccui.Button("btn_pay_with_heart.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "pay";
        b.x = cc.winSize.width/2 - b.width/2 - 20;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);

        b.addClickEventListener(function() {
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

        b = new ccui.Button("btn_empty.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.name = "share";

        var lb = new cc.LabelBMFont("Share & Spread the message", res.HomeFont_fnt);
        lb.scale = 0.3;
        lb.boundingWidth = b.width*2;
        lb.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        lb.x = b.width/2;
        lb.y = b.height/2 + 10;
        b.addChild(lb);
        
        b.x = cc.winSize.width/2 + b.width/2 + 20;
        b.y = b.height - this._buttonOffSetY + this._childrenOffSetY;
        this.addChild(b);

        b.addClickEventListener(function() {
            this.addChild(new ShareDialog(), 99);
        }.bind(this));

    },

    _addLaterBtn: function() {
        var b = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        b.x = cc.winSize.width/2;
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
    },
});

var MissionPageAfterLoginScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        this.addChild(new MissionPageAfterLogin());
    }
});