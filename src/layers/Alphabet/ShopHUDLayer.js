var HUD_SPACE = 100;
var ShopHUDLayer = SpecifyGoalHudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,
    _lbDiamond: null,
    _lbCoin: null,

    ctor: function() {
        this._showClock = false;
        this._super();

        this.addBackButton();
        // this.addCurrency();
    },

    addBackGround: function() {},
    addSettingButton: function() {
        this._super();
        this._settingBtn.visible = false;
    },

    addGameProgressBar:function(){
        this._super();
        this._progressBarBg.visible = false;
    },

    addBackButton: function() {
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = button.width;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            AudioManager.getInstance().play(res.back_sound_mp3, false, null);
            cc.director.runScene(new HomeScene());
        });
    },

    addCurrency: function(){
        var bgGold = new cc.Sprite("#whitespace.png");
        bgGold.x = cc.winSize.width/2 - bgGold.width/2 - 70;
        bgGold.y = cc.winSize.height - bgGold.height/2 - 10;
        this.addChild(bgGold);

        var coin = new cc.Sprite("#gold.png");
        coin.scale = CURRENCY_SCALE;
        coin.x = bgGold.x - bgGold.width/2;
        coin.y = bgGold.y;
        this.addChild(coin, 999);
        var coinAmount = CurrencyManager.getInstance().getCoin();
        this._lbCoin = new cc.LabelBMFont(coinAmount.toString(), res.HudFont_fnt);
        // this._lbCoin.anchorX = 0;
        this._lbCoin.x = bgGold.width/2 + 5;
        this._lbCoin.y = bgGold.height/2;
        bgGold.addChild(this._lbCoin);

        var bgDiamond = new cc.Sprite("#whitespace.png");
        bgDiamond.x = cc.winSize.width/2 + bgDiamond.width/2 + 70;
        bgDiamond.y = cc.winSize.height - bgDiamond.height/2 - 10;
        this.addChild(bgDiamond);

        var diamond = new cc.Sprite("#diamond.png");
        diamond.scale = CURRENCY_SCALE;
        diamond.x = bgDiamond.x - bgDiamond.width/2;
        diamond.y = bgDiamond.y;
        this.addChild(diamond, 999);
        var diamondAmount = CurrencyManager.getInstance().getDiamond();
        this._lbDiamond = new cc.LabelBMFont(diamondAmount.toString(), res.HudFont_fnt);
        // this._lbDiamond.anchorX = 0;
        this._lbDiamond.x = bgDiamond.width/2 + 5;
        this._lbDiamond.y = bgDiamond.height/2;
        bgDiamond.addChild(this._lbDiamond);
    },

    updateBalance: function() {
        var coin = CurrencyManager.getInstance().getCoin();
        var diamond = CurrencyManager.getInstance().getDiamond();
        this._lbCoin.setString(coin);
        this._lbDiamond.setString(diamond);
    },
});