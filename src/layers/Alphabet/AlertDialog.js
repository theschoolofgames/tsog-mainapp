var AlertDialog = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function(text){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addButton();
        this._addText(text);
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },

    _addText: function(text) {
        var text = new cc.LabelBMFont(text, res.HomeFont_fnt);
        text.scale = 0.5;
        text.x = this._dialogBg.width/2 + 20;
        text.y = this._dialogBg.height/2 + 100;
        text.setColor(cc.color(255,255,255));
        text.setBoundingWidth(this._dialogBg.width - 50);
        this._dialogBg.addChild(text);
    },

    _showDialog: function(){
        var dialog = new MessageDialog("#level_dialog_frame.png");
        var lb = new cc.LabelBMFont(localize("Need 2 coins to play!"), res.HomeFont_fnt);
        lb.scale = 0.7;
        lb.x = dialog.background.width/2 + 20;
        lb.y = dialog.background.height/2 + 100;
        lb.setColor(cc.color(255,255,255));
        lb.setBoundingWidth(550);
        dialog.addComponent(lb);

        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = dialog.background.width/2;
        button.y = 100;
        dialog.addComponent(button);
        button.addClickEventListener(function(){
            dialog.removeFromParent();
        });
        var lbOK = new cc.LabelBMFont(localize("OK"), res.CustomFont_fnt); 
        lbOK.scale = 0.5;
        lbOK.x = button.width/2;
        lbOK.y = button.height/2;
        button.addChild(lbOK);

    },

    _addButton: function(){
        var self = this;
        var buttonCancel = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonCancel.x = this._dialogBg.width/2 - buttonCancel.width/2;
        buttonCancel.y = 100;
        this._dialogBg.addChild(buttonCancel);
        lbCancel = new cc.LabelBMFont(localize("Cancel"), "res/font/custom_font.fnt");
        lbCancel.scale = 0.4;
        lbCancel.x = buttonCancel.width/2;;
        lbCancel.y = buttonCancel.height/2;
        buttonCancel.addChild(lbCancel);
        buttonCancel.addClickEventListener(function(){
            self.parent._showDialog = true;
            self.removeFromParent();
        });

        var buttonPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonPlay.x = this._dialogBg.width/2 + buttonPlay.width/2;
        buttonPlay.y = 100;
        this._dialogBg.addChild(buttonPlay);
        lbPlay = new cc.LabelBMFont(localize("Play"), "res/font/custom_font.fnt");
        lbPlay.scale = 0.4;
        lbPlay.x = buttonPlay.width/2;
        lbPlay.y = buttonPlay.height/2;
        buttonPlay.addChild(lbPlay);
        buttonPlay.addClickEventListener(function(){
            if(CurrencyManager.getInstance().getCoin() < GOLD_NEED_TO_PLAY_ALPHARACING) {
                // self._showDialog();
                var mess = localize("Not enough gold to play!");
                NativeHelper.callNative("showMessage", ["Message", mess]);
            }
            else {
                CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
                var data = DataManager.getInstance().getDataAlpharacing();
                cc.director.runScene(new AlphaRacingScene(data, null));
            }
        });

    }
})