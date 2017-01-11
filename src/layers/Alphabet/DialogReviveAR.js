var DialogReviveAR = cc.LayerColor.extend({
    _dialogBg: null,

    ctor: function (coins) {
        // body...
        this._super(cc.color(0, 0, 0 , 200));
        this._addDialogBg();
        this._addText(coins);
        this.addButton(coins);
    },

    _addDialogBg: function() {
        var dialogBg = new cc.Sprite("#level_dialog_frame.png");
        dialogBg.x = cc.winSize.width/2;
        dialogBg.y = cc.winSize.height/2;
        this.addChild(dialogBg);
        this._dialogBg = dialogBg;
    },

    _addText: function(coins) {
        var text = new cc.LabelBMFont(localize("Spend") + " " + coins.toString(), res.HomeFont_fnt);
        text.scale = 0.7;
        text.x = this._dialogBg.width/2 - 20;
        text.y = this._dialogBg.height/2 + 100;

        var coin = new cc.Sprite("#gold.png");
        coin.x = text.width + 50;
        coin.y = text.height/2 - 10;
        text.addChild(coin);  
        var text2 = new cc.LabelBMFont(localize("to revive!"), res.HomeFont_fnt);
        text2.scale = 0.7;
        text2.x = text.x;
        text2.y = text.y - text.height;
        this._dialogBg.addChild(text2);

        text.setColor(cc.color(255,255,255));
        this._dialogBg.addChild(text);
        text.setBoundingWidth(800);
    },

    addButton: function(coins) {
        var buttonPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonPlay.x = this._dialogBg.width/2;
        buttonPlay.y = 100;
        // buttonPlay.scale = 0.6;
        this._dialogBg.addChild(buttonPlay);
        lbPlay = new cc.LabelBMFont(localize("Play"), "res/font/custom_font.fnt");
        lbPlay.x = buttonPlay.width/2;
        lbPlay.y = buttonPlay.height/2;
        buttonPlay.addChild(lbPlay);

        var self = this;
        buttonPlay.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            CurrencyManager.getInstance().decrCoin(coins);
            self.removeFromParent();
            var event = new cc.EventCustom(EVENT_AR_REVIVAL);
            cc.eventManager.dispatchEvent(event);
        });
    }

}) 