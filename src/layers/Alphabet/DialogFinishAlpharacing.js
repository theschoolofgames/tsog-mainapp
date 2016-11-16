var DialogFinishAlpharacing = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function(){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addButton();
        this._addText();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return false },
        }, this);
    },
    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#setting-dialog-bg.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },
    _addText: function() {
        var text = new cc.LabelTTF("If you want to play more, press OK!", "Arial", 30, cc.size(300, 80));
        text.x = this._dialogBg.width/2 + 20;
        text.y = this._dialogBg.height/2;
        text.setColor(cc.color(0,0,0));
        this._dialogBg.addChild(text);
    },
    _showDialog: function(){
        var dialog = new MessageDialog();
        var lb = new cc.LabelTTF("You not enough 10 coin to play!", "Arial", 30, cc.size(300, 80));
        lb.color = cc.color(0,0,0);
        lb.x = dialog.background.width/2;
        lb.y = dialog.background.height/2;
        dialog.addComponent(lb);
        this.addChild(dialog,100);

        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = dialog.background.width/2;
        button.y = 100;
        dialog.addComponent(button);
        button.addClickEventListener(function(){
            dialog.removeFromParent();
        });
        var lbOK = new cc.LabelBMFont("OK", res.CustomFont_fnt); 
        lbOK.scale = 0.5;
        lbOK.x = button.width/2;
        lbOK.y = button.height/2;
        button.addChild(lbOK);

    },

    _addButton: function(){
        var self = this;
        var buttonCancel = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonCancel.x = this._dialogBg.width/2 - 50;
        buttonCancel.y = 100;
        buttonCancel.scale = 0.6;
        this._dialogBg.addChild(buttonCancel);
        lbCancel = new cc.LabelBMFont("Cancel", "res/font/custom_font.fnt");
        lbCancel.scale = 0.6;
        lbCancel.x = buttonCancel.width/2;;
        lbCancel.y = buttonCancel.height/2;
        buttonCancel.addChild(lbCancel);
        buttonCancel.addClickEventListener(function(){
            cc.director.resume();
            self.removeFromParent();
            cc.director.runScene(new HomeScene());
        });

        var buttonPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonPlay.x = this._dialogBg.width/2 + 50;
        buttonPlay.y = 100;
        buttonPlay.scale = 0.6;
        this._dialogBg.addChild(buttonPlay);
        lbPlay = new cc.LabelBMFont("Play", "res/font/custom_font.fnt");
        lbPlay.scale = 0.6;
        lbPlay.x = buttonPlay.width/2;
        lbPlay.y = buttonPlay.height/2;
        buttonPlay.addChild(lbPlay);
        buttonPlay.addClickEventListener(function(){
            if(CurrencyManager.getInstance().getCoin() < GOLD_NEED_TO_PLAY_ALPHARACING)
                self._showDialog();
            CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.resume();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
        });

    }
})