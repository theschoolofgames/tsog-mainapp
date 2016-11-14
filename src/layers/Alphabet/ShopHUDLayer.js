var ShopHUDLayer = HudLayer.extend({
    _specifyGoalLabel: null,

    _totalSpecifyGoal: 0,
    _currentSpecifyGoal: 0,


    ctor: function(layer) {
        this._super(layer);

        this.addGold();
        this.addDiamond();
    },

    addCurrency: function(){
        // var coin = new cc.Sprite("#gold.png");
        // coin.x = 100;
        // coin.y = cc.winSize.height - coin.height/2 - 10;
        // this.addChild(coin, 999);
        // var coinAmount = CurrencyManager.getInstance().getCoin();
        // var lbCoin = new cc.LabelBMFont(coinAmount.toString(), "res/font/custom_font.fnt");
        // lbCoin.scale = 0.4;
        // lbCoin.anchorX = 0;
        // lbCoin.x = 50;
        // lbCoin.y = coin.height/2;
        // coin.addChild(lbCoin);

        // var diamond = new cc.Sprite("#diamond.png");
        // diamond.x = 400;
        // diamond.y = cc.winSize.height - diamond.height/2 - 10;
        // this.addChild(diamond, 999);
        // var diamondAmount = CurrencyManager.getInstance().getDiamond();
        // var lbDiamond = new cc.LabelBMFont(diamondAmount.toString(), "res/font/custom_font.fnt");
        // lbDiamond.scale = 0.4;
        // lbDiamond.anchorX = 0;
        // lbDiamond.x = 50;
        // lbDiamond.y = diamond.height/2;
        // diamond.addChild(lbDiamond);

    },
});