var PayLayer = cc.Layer.extend({
	_bottomPageH: 0,
    _backBtnCallBack: null,
	_purchasedSet: null,

	ctor: function(backBtnCallBack) {
		this._super();

        this._backBtnCallBack = backBtnCallBack;

		this._createBackground();
		this._addPageBorders();
		this._addHud();
		this._addTitle();
		this._addDescription();
		this._addItems();
	},

	_createBackground: function() {
		var topPageW = cc.winSize.width;
		var topPageH = cc.winSize.height / 5;

		var bottomPageW = cc.winSize.width;
		var bottomPageH = cc.winSize.height - topPageH;

		var topPage = new cc.LayerColor(cc.color(94, 63, 48, 255), topPageW, topPageH);
		topPage.setPosition(0, cc.winSize.height - topPageH);
		this.addChild(topPage);

		var bottomPage = new cc.LayerColor(cc.color(107, 76, 61, 255), bottomPageW, bottomPageH);
		bottomPage.setPosition(0, 0);
		this.addChild(bottomPage);

		var payBackground = RepeatingSpriteNode.create(res.Pay_background_png, cc.winSize.width, bottomPageH);
		payBackground.setAnchorPoint(0, 1);
		payBackground.x = 10;
		payBackground.y = bottomPageH - 10;
		this.addChild(payBackground);

		var pageBreakingLine = new cc.Sprite(res.Pay_breaking_line_png);
		pageBreakingLine.setAnchorPoint(0, 0.5);
		pageBreakingLine.setScale(cc.winSize.width / pageBreakingLine.width);
		pageBreakingLine.x = 0;
		pageBreakingLine.y = bottomPageH;
		this.addChild(pageBreakingLine);

		this._bottomPageH = bottomPageH;
	},

	_addPageBorders: function() {
		var topBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
		topBorder.setAnchorPoint(0, 1);
		topBorder.x = 0;
		topBorder.y = cc.winSize.height;
		this.addChild(topBorder);

		var bottomBorder = RepeatingSpriteNode.create(res.Pay_border_png, cc.winSize.width, 0);
		bottomBorder.setScale(-1, -1);
		bottomBorder.x = cc.winSize.width;
		bottomBorder.y = 0;
		this.addChild(bottomBorder);
	},

	_addHud: function() {
		var shopHUDLayer = new ShopHUDLayer();
		shopHUDLayer.y -= 5; 
		shopHUDLayer._bgGold.x = shopHUDLayer._backButton.x + shopHUDLayer._backButton.width * 2;
		shopHUDLayer._bgGold.y -= shopHUDLayer._bgGold.height / 4;
		shopHUDLayer._bgDiamond.x = shopHUDLayer._bgGold.x + shopHUDLayer._bgGold.width * 1.1;
		shopHUDLayer._bgDiamond.y -= shopHUDLayer._bgDiamond.height / 4;
		this.addChild(shopHUDLayer);

        if (this._backBtnCallBack) {
            shopHUDLayer.setBackBtnCallback(this._backBtnCallBack);
        }
	},

	_addTitle: function() {
		var ribbon = new cc.Sprite(res.Ribbon_png);
		ribbon.x = cc.winSize.width / 2;
		ribbon.y = this._bottomPageH;
		this.addChild(ribbon);

        var label = new cc.LabelBMFont(localizeForWriting("Pay"), res.HudFont_fnt);
        // label.scale = 0.5;
        label.x = ribbon.width / 2;
        label.y = ribbon.height * 0.765;
        ribbon.addChild(label);

	},

	_addDescription: function() {
        var description = new cc.LabelBMFont(localizeForWriting("When you \"pay what's in your   \"\n" 
                                                        + "we educate a child in need"), res.HudFont_fnt);
        description.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        description.scale = 0.8;
        description.x = cc.winSize.width / 2;
        description.y = this._bottomPageH - description.height * 1.25;
        this.addChild(description);
        var iconHeart = new cc.Sprite("#icon_heart.png");
        iconHeart.x = description.width - 45;
        iconHeart.y = description.height - 10;
        description.addChild(iconHeart);
	},

	_addItems: function() {
		var self = this;
		this._createItemSlot(cc.winSize.width / 4, this._bottomPageH / 2.2, 
								res.Icon_gold_small_png, SET_SMALL_PRICE,
								"Small Impact", function() {
									this._purchasedSet = "set1";
									this.itemCallback();
								}.bind(this));

		this._createItemSlot(cc.winSize.width / 2, this._bottomPageH / 2.2, 
								res.Icon_gold_medium_png, SET_MEDIUM_PRICE, 
								"Medium Impact", function() {
									this._purchasedSet = "set2";
									this.itemCallback();
								}.bind(this));

		this._createItemSlot(cc.winSize.width / 4 * 3, this._bottomPageH / 2.2, 
								res.Icon_gold_big_png, SET_BIG_PRICE,
								"Big Impact", function() {
									this._purchasedSet = "set3";
									this.itemCallback();
								}.bind(this));
	},

	_createItemSlot: function(x, y, icon, price, label, callback) {
		var slot = new cc.Sprite(res.Item_background_png);
		slot.x = x;
		slot.y = y;
		this.addChild(slot);
        var coinsAmount = 0;
        var diamondsAmount = 0;
        switch (price) {
            case SET_SMALL_PRICE:
                coinsAmount = SET_SMALL_COINS;
                diamondsAmount = SET_SMALL_DIAMONDS
                break;

            case SET_MEDIUM_PRICE:
                coinsAmount = SET_MEDIUM_COINS;
                diamondsAmount = SET_MEDIUM_DIAMONDS
                break;

            case SET_BIG_PRICE:
                coinsAmount = SET_BIG_COINS;
                diamondsAmount = SET_BIG_DIAMONDS
                break;

            default:
                break;
        }

        var icon = new cc.Sprite(icon);
        icon.x = slot.width / 2;
        icon.y = slot.height / 3 * 2 - 10;
        slot.addChild(icon);

        var button = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        button.x = slot.width / 2;
        button.y = 0;
        button.addClickEventListener(callback);
        slot.addChild(button);

        var lbCoin = new cc.LabelBMFont(coinsAmount, res.HudFont_fnt);
        lbCoin.scale = 0.6;
        lbCoin.x = slot.width/2;
        lbCoin.y = button.y + button.height - 8;
        slot.addChild(lbCoin);
        var iconCoin = new cc.Sprite("#gold.png");
        iconCoin.anchorX = 0;
        iconCoin.scale = 0.6;
        iconCoin.x = lbCoin.width + 5;
        iconCoin.y = lbCoin.height/2;
        lbCoin.addChild(iconCoin);

        var lbDiamond = new cc.LabelBMFont(diamondsAmount, res.HudFont_fnt);
        lbDiamond.scale = 0.6;
        lbDiamond.x = slot.width/2;
        lbDiamond.y = button.y + button.height + lbDiamond.height/2;
        slot.addChild(lbDiamond);
        var iconDiamond = new cc.Sprite("#diamond.png");
        iconDiamond.anchorX = 0;
        iconDiamond.scale = 0.6;
        iconDiamond.x = lbDiamond.width + 5;
        iconDiamond.y = lbDiamond.height/2;
        lbDiamond.addChild(iconDiamond);

		var buttonLabel = new cc.LabelBMFont(price, res.HomeFont_fnt);
        buttonLabel.scale = 0.4;
        buttonLabel.x = button.width / 2;
        buttonLabel.y = button.height / 1.65;
        button.addChild(buttonLabel);	

        var itemLabel = new cc.LabelBMFont(label, res.HudFont_fnt);
        itemLabel.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        itemLabel.scale = 0.6;
        itemLabel.x = slot.width / 2;
        itemLabel.y = slot.height * 9/10;
        slot.addChild(itemLabel);
	},

	_succeedDialog: function() {
		debugLog("_succeedDialog");
		var dialog = new cc.Sprite("res/SD/grownup/dialog_bg.png");
		dialog.x = cc.winSize.width/2;
		dialog.y = cc.winSize.height/2;

		var dialogLayer = new Dialog();
		dialogLayer.addChild(dialog);

		dialogLayer.background = dialog;
		this.addChild(dialogLayer);

		var title = new cc.LabelBMFont(localizeForWriting("Purchase Succeed"),res.Grown_Up_fnt);
        title.scale = 0.55;
        title.x = dialog.width/2;
        title.y = dialog.height/2 + title.height;
        dialog.addChild(title);

        var confirmBtn = new ccui.Button(res.Pay_button_normal_png, res.Pay_button_pressed_png);
        confirmBtn.x = dialog.width/2;
        confirmBtn.y = dialog.height/2 - 20;
        dialog.addChild(confirmBtn);

        var title = new cc.LabelBMFont(localizeForWriting("Ok"),res.Grown_Up_fnt);
        title.scale = 0.55;
        title.x = confirmBtn.width/2;
        title.y = confirmBtn.height/2 + 3;
        confirmBtn.addChild(title);

        confirmBtn.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
        	cc.director.replaceScene(new WelcomeScene());
        });
	},

	itemCallback: function() {
		AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
		IAPManager.getInstance().purchase(this._purchasedSet, function(succeed) {
			if (succeed) {
				var currentCoin = parseInt(User.getCurrentChild().getCoin());
				var currentDiamond = parseInt(User.getCurrentChild().getDiamond());
				var coins = 0, diamonds = 0
				if (this._purchasedSet == "set1") {
					coins = SET_SMALL_COINS;
					diamonds = SET_SMALL_DIAMONDS;
				} else if (this._purchasedSet == "set2") {
					coins = SET_MEDIUM_COINS;
					diamonds = SET_MEDIUM_DIAMONDS;
				} else if (this._purchasedSet == "set3") {
					coins = SET_BIG_COINS;
					diamonds = SET_BIG_DIAMONDS;
				}
				User.getCurrentChild().setCoin(currentCoin + parseInt(coins));
				User.getCurrentChild().setDiamond(currentDiamond + parseInt(diamonds));
				// this._succeedDialog();
				cc.director.replaceScene(new RewardScene(coins, diamonds));
			}
		}.bind(this));
	}

});

var PayScene = cc.Scene.extend({
	ctor: function(backBtnCallBack) {
		this._super();
		var payLayer = new PayLayer(backBtnCallBack);
		this.addChild(payLayer);
	}
})