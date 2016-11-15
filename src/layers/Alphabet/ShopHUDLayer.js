var HUD_SPACE = 100;
var ShopHUDLayer = cc.Layer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,
    _lbDiamond: null,
    _lbCoin: null,

    ctor: function() {
        this._super(); // true -> no clock

        this.addBackButton();
        this.addCurrency();
    },

    addGameProgressBar: function() {},

    addBackButton: function() {
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = button.width;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.director.runScene(new HomeScene());
        });
    },

    addCurrency: function(){
        var bgGold = new cc.Sprite("#whitespace.png");
        bgGold.x = cc.winSize.width/3;
        bgGold.y = cc.winSize.height - bgGold.height/2 - 10;
        this.addChild(bgGold);

        var coin = new cc.Sprite("#gold.png");
        coin.scale = CURRENCY_SCALE;
        coin.x = bgGold.x - bgGold.width/2;
        coin.y = bgGold.y;
        this.addChild(coin, 999);
        var coinAmount = CurrencyManager.getInstance().getCoin();
        this._lbCoin = new cc.LabelBMFont(coinAmount.toString(), res.HudFont_fnt);
        this._lbCoin.anchorX = 0;
        this._lbCoin.x = coin.width/2 + 50;
        this._lbCoin.y = coin.height/2;
        coin.addChild(this._lbCoin);

        var bgDiamond = new cc.Sprite("#whitespace.png");
        bgDiamond.x = bgGold.x + bgDiamond.width + HUD_SPACE;
        bgDiamond.y = cc.winSize.height - bgDiamond.height/2 - 10;
        this.addChild(bgDiamond);

        var diamond = new cc.Sprite("#diamond.png");
        diamond.scale = CURRENCY_SCALE;
        diamond.x = bgDiamond.x - bgDiamond.width/2;
        diamond.y = bgDiamond.y;
        this.addChild(diamond, 999);
        var diamondAmount = CurrencyManager.getInstance().getDiamond();
        this._lbDiamond = new cc.LabelBMFont(diamondAmount.toString(), res.HudFont_fnt);
        this._lbDiamond.anchorX = 0;
        this._lbDiamond.x = diamond.width/2 + 50;
        this._lbDiamond.y = diamond.height/2;
        diamond.addChild(this._lbDiamond);
    },

    updateBalance: function() {
        var coin = CurrencyManager.getInstance().getCoin();
        var diamond = CurrencyManager.getInstance().getDiamond();
        this._lbCoin.setString(coin);
        this._lbDiamond.setString(diamond);
    },
});