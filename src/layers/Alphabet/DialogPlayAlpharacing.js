var DialogPlayAlpharacing = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function(){
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addText();
        this._addButton();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return false },
        }, this);
    },
    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },
    _addText: function() {
        var text = new cc.LabelBMFont("You have to spend 10 coins to play!", res.HomeFont_fnt);
        text.scale = 0.7;
        text.x = this._dialogBg.width/2 + 20;
        text.y = this._dialogBg.height/2 + 100;
        text.setColor(cc.color(255,255,255));
        this._dialogBg.addChild(text);
        text.setBoundingWidth(550);
    },
    _addButton: function(){
        var self = this;
        var canttouch = false;
        // var buttonCancel = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        // buttonCancel.x = this._dialogBg.width/2 - 50;
        // buttonCancel.y = 100;
        // buttonCancel.scale = 0.6;
        // this._dialogBg.addChild(buttonCancel);
        // lbCancel = new cc.LabelBMFont("Cancel", "res/font/custom_font.fnt");
        // lbCancel.scale = 0.6;
        // lbCancel.x = buttonCancel.width/2;;
        // lbCancel.y = buttonCancel.height/2;
        // buttonCancel.addChild(lbCancel);
        // buttonCancel.addClickEventListener(function(){
        //     self.removeFromParent();
        // });

        var buttonPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonPlay.x = this._dialogBg.width/2;
        buttonPlay.y = 100;
        // buttonPlay.scale = 0.6;
        this._dialogBg.addChild(buttonPlay);
        lbPlay = new cc.LabelBMFont("Play", "res/font/custom_font.fnt");
        // lbPlay.scale = 0.6;
        lbPlay.x = buttonPlay.width/2;
        lbPlay.y = buttonPlay.height/2;
        buttonPlay.addChild(lbPlay);
        buttonPlay.addClickEventListener(function(){
            if(canttouch)
                return;
            canttouch = true;
            CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
        });

        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this._dialogBg.width - 25;
        closeButton.y = this._dialogBg.height - 25;
        closeButton.addClickEventListener(function(){
            self.removeFromParent();
        });
        this._dialogBg.addChild(closeButton);
    }
})