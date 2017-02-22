var DialogPlayAlpharacing = Dialog.extend({
    _dialogBg: null,
    _isRetry: false,

    ctor: function(retry){
        this._isRetry = retry;

        let isNotEnoughCoin = CurrencyManager.getInstance().getCoin() < COIN_NEED_TO_PLAY_ALPHARACING;

        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addText(isNotEnoughCoin);
        this._addButton(isNotEnoughCoin);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function() { return true },
        }, this);
    },
    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
        this.background = dialogBg;
    },
    _addText: function(isNotEnoughCoin) {
        var text = new cc.LabelBMFont(localize("Spend") + " " + COIN_NEED_TO_PLAY_ALPHARACING.toString(), res.HomeFont_fnt);
        text.scale = 0.7;
        text.x = this._dialogBg.width/2 - 20;
        text.y = this._dialogBg.height/2 + 100;
        if(isNotEnoughCoin) {
            text.setString(localize("Not enough"));
            var coin = new cc.Sprite("#gold.png");
            coin.x = text.width + coin.width/2;
            coin.y = text.height/2 - 10;
            text.addChild(coin);  
            var text2 = new cc.LabelBMFont(" " + localize("to play!"), res.HomeFont_fnt);
            text2.scale = 0.7;
            text2.x = text.x - 10;
            text2.y = text.y - text.height;
            this._dialogBg.addChild(text2);
        }
        else {
            var coin = new cc.Sprite("#gold.png");
            coin.x = text.width + 50;
            coin.y = text.height/2 - 10;
            text.addChild(coin);  
            var text2 = new cc.LabelBMFont(localize("to play!"), res.HomeFont_fnt);
            text2.scale = 0.7;
            text2.x = text.x;
            text2.y = text.y - text.height;
            this._dialogBg.addChild(text2);
        };
        text.setColor(cc.color(255,255,255));
        this._dialogBg.addChild(text);
        text.setBoundingWidth(800);
    },
    _addButton: function(isNotEnoughCoin){
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

        if(isNotEnoughCoin) {
            var buttonLearn = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
            buttonLearn.x = this._dialogBg.width/2;
            buttonLearn.y = 100;
            buttonLearn.scale = 0.6;
            this._dialogBg.addChild(buttonLearn);
            lbLearn = new cc.LabelBMFont(localize("Learn"), "res/font/custom_font.fnt");
            lbLearn.x = buttonLearn.width/2;
            lbLearn.y = buttonLearn.height/2;
            buttonLearn.addChild(lbLearn);
            buttonLearn.addClickEventListener(function(){
                cc.log("Learn");
                if(canttouch)
                    return;
                canttouch = true;
                cc.director.runScene(new MapScene());
            });

            // var buttonShop = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
            // buttonShop.x = this._dialogBg.width/2 + 130;
            // buttonShop.y = 100;
            // buttonShop.scale = 0.6;
            // this._dialogBg.addChild(buttonShop);
            // lbShop = new cc.LabelBMFont(localize("Cancel"), "res/font/custom_font.fnt");
            // lbShop.x = buttonShop.width/2;
            // lbShop.y = buttonShop.height/2;
            // buttonShop.addChild(lbShop);
            // buttonShop.addClickEventListener(function(){
            //     cc.log("Shop");
            //     if(canttouch)
            //         return;
            //     canttouch = true;
            //     // cc.director.runScene(new MapScene());
            //     self.parent._blocktouch = false;
            //     self.removeFromParent();
            // });
        } else {
            var buttonPlay = new ccui.Button("res/SD/reward/btn_rate.png", "res/SD/reward/btn_rate_pressed.png", "");
            buttonPlay.x = this._dialogBg.width/2;
            buttonPlay.y = 100;
            // buttonPlay.scale = 0.6;
            this._dialogBg.addChild(buttonPlay);
            var lbPlay = CustomLabel.createWithTTF(res.HELVETICARDBLK_ttf.srcs[0], 40, cc.color("#b15a10"), 1,localizeForWriting("Play"));
        // lbPlay.scale = 0.3;
            buttonPlay.addChild(lbPlay,1);
            lbPlay.x = buttonPlay.width/2;
            lbPlay.y = buttonPlay.height/2 + 8;
            buttonPlay.addClickEventListener(function(){
                AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
                if(canttouch) // ^_^ @david
                    return;
                canttouch = true;
                CurrencyManager.getInstance().decrCoin(COIN_NEED_TO_PLAY_ALPHARACING);
                var data = DataManager.getInstance().getDataAlpharacing();
                cc.director.runScene(new AlphaRacingScene(data, null, 600));
                AnalyticsManager.getInstance().logEventSpendVirtualCurrency("Alpharacing_start",
                    "Coin", COIN_NEED_TO_PLAY_ALPHARACING);
            });
        }

        // lbPlay.scale = 0.6;

        var closeButton = new ccui.Button("btn_x.png", "btn_x-pressed.png", "",ccui.Widget.PLIST_TEXTURE);
        closeButton.x = this._dialogBg.width - 25;
        closeButton.y = this._dialogBg.height - 25;
        closeButton.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_close_mp3, false, null);
            
            if (self._isRetry) {
                cc.director.runScene(new HomeScene());
            } else {
                self.parent._blocktouch = false;
                self.removeFromParent();
            }
        });
        this._dialogBg.addChild(closeButton);
    }
})