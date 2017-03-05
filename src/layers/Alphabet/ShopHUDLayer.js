var HUD_SPACE = 100;
var ShopHUDLayer = SpecifyGoalHudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,
    _lbDiamond: null,
    _lbCoin: null,

    _bgGold: null,
    _bgDiamond: null,
    _backButton: null,

    _backBtnCallback: null,

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
            if (this._backBtnCallback)
                this._backBtnCallback();
            else
                cc.director.runScene(new HomeScene());
        }.bind(this));
        this._backButton = button;
    },

    addCurrency: function(){
        var bgGold = new cc.Sprite("#whitespace.png");
        bgGold.x = cc.winSize.width/2 - bgGold.width/2 - 100;
        bgGold.y = cc.winSize.height - bgGold.height/2 - 10;
        this.addChild(bgGold);

        var coin = new cc.Sprite("#gold.png");
        coin.scale = CURRENCY_SCALE;
        coin.x = coin.width / 5;
        coin.y = coin.height / 3;
        bgGold.addChild(coin, 999);

        var coinAmount = CurrencyManager.getInstance().getCoin();
        this._lbCoin = new cc.LabelBMFont(coinAmount.toString(), res.HudFont_fnt);
        this._lbCoin.scale = ((bgGold.width / this._lbCoin.width * 0.6) > 1) ? 1 : (bgGold.width / this._lbCoin.width * 0.6);
        debugLog("hud coin scale -> " + this._lbCoin.scale);
        // this._lbCoin.anchorX = 0;
        this._lbCoin.x = bgGold.width * 0.55;
        this._lbCoin.y = bgGold.height/2 + 2;
        bgGold.addChild(this._lbCoin);

        var bgDiamond = new cc.Sprite("#whitespace.png");
        bgDiamond.x = cc.winSize.width/2 + bgDiamond.width/2 + 100;
        bgDiamond.y = cc.winSize.height - bgDiamond.height/2 - 10;
        this.addChild(bgDiamond);

        var diamond = new cc.Sprite("#diamond.png");
        diamond.scale = CURRENCY_SCALE;
        diamond.x = diamond.width / 5;
        diamond.y = diamond.height / 2.5;
        bgDiamond.addChild(diamond, 999);

        var diamondAmount = CurrencyManager.getInstance().getDiamond();
        this._lbDiamond = new cc.LabelBMFont(diamondAmount.toString(), res.HudFont_fnt);
        this._lbDiamond.scale = ((bgDiamond.width / this._lbDiamond.width * 0.6) > 1) ? 1 : (bgDiamond.width / this._lbDiamond.width * 0.6);
        this._lbDiamond.x = bgDiamond.width*0.55;
        this._lbDiamond.y = bgDiamond.height/2 + 2;
        bgDiamond.addChild(this._lbDiamond);

        this._bgGold = bgGold;
        this._bgDiamond = bgDiamond;
    },

    updatex: function() {
        var coin = CurrencyManager.getInstance().getCoin().toString();
        var diamond = CurrencyManager.getInstance().getDiamond().toString();
        this._lbCoin.setString(coin);
        this._lbDiamond.setString(diamond);
    },

    setBackBtnCallback: function(callback) {
        this._backBtnCallback = callback;
    },
});