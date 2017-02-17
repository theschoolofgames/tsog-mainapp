var RewardScreenLayer = cc.Layer.extend({
    ctor: function (coins, diamonds) {
        // body...
        this._super();
        cc.log("Coins: " + coins);
        cc.log("diamonds: " + diamonds);
        this._createBackground();
        this._addPageBorders();
        this._addContent(coins, diamonds);
        this.addBackButton();
        this.addCoinRain();
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

    _addContent: function(coins, diamonds){
        var self = this;
        var lb = new cc.LabelBMFont(localizeForWriting("Thank you for joining us in our mission"), "res/font/grownupcheckfont-export.fnt");
        lb.scale = 0.5;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height - 50;
        this.addChild(lb, 1);

        buttonShare = new ccui.Button("res/SD/reward/btn_share.png", "res/SD/reward/btn_share_pressed.png", "");
        buttonShare.x = cc.winSize.width/2 - 160;
        buttonShare.y = 70;
        this.addChild(buttonShare);
        // var lbShare = new cc.LabelBMFont("Share the news", res.HomeFont_fnt);
        // lbShare.scale = 0.3;
        // buttonShare.addChild(lbShare,1);
        // lbShare.x = buttonShare.width/2;
        // lbShare.y = buttonShare.height/2 + 5;
        buttonShare.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            self.addChild(new ShareDialog(), 1);
        });

        buttonRate = new ccui.Button("res/SD/reward/btn_rate.png", "res/SD/reward/btn_rate_pressed.png", "");
        buttonRate.x = cc.winSize.width/2 + 160;
        buttonRate.y = 70;
        this.addChild(buttonRate);
        // var lbRate = new cc.LabelBMFont("Rate us", res.HomeFont_fnt);
        // lbRate.scale = 0.3;
        // buttonRate.addChild(lbRate,1);
        // lbRate.x = buttonRate.width/2;
        // lbRate.y = buttonRate.height/2 + 5;
        buttonRate.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            if (cc.sys.os === cc.sys.OS_ANDROID)
                cc.sys.openURL(GAME_URL_ANDROID)
            else
                cc.sys.openURL(GAME_URL_IOS);
        });

        var ribbon = new cc.Sprite("res/SD/dialogs/ribbon.png");
        ribbon.x = cc.winSize.width/2;
        ribbon.y = cc.winSize.height / 5 * 4;
        this.addChild(ribbon);

        lbReward = new cc.LabelBMFont(localizeForWriting("YOUR REWARD"), res.Grown_Up_fnt);
        lbReward.scale = 0.4;
        lbReward.x = ribbon.width/2;
        lbReward.y = ribbon.height/2 + 25;
        ribbon.addChild(lbReward);

        var coinBg = new cc.Sprite("res/SD/progresstracker/square.png");
        coinBg.setAnchorPoint(1,0.5);
        coinBg.x = cc.winSize.width/2 - 50;
        coinBg.y = cc.winSize.height/2 - 40;
        this.addChild(coinBg);
        var light = new cc.Sprite("res/SD/progresstracker/light.png");
        light.x = coinBg.width/2;
        light.y = coinBg.height/2 - 50;
        coinBg.addChild(light);
        var coinIcon = new cc.Sprite("res/SD/reward/iconcoinreward.png");
        coinIcon.x = coinBg.width/2;
        coinIcon.y = coinBg.height/2 - 60;
        coinBg.addChild(coinIcon);
        var coinRewardLb = new cc.LabelBMFont(coins + localizeForWriting(" Coins"), res.Grown_Up_fnt);
        coinRewardLb.scale = 0.4;
        coinRewardLb.x = coinBg.width/2;
        coinRewardLb.y = coinBg.height - 40;
        coinBg.addChild(coinRewardLb);

        var diamondBg = new cc.Sprite("res/SD/progresstracker/square.png");
        diamondBg.setAnchorPoint(0,0.5);
        diamondBg.x = cc.winSize.width/2 + 50;
        diamondBg.y = cc.winSize.height/2 - 40;
        this.addChild(diamondBg);
        var light = new cc.Sprite("res/SD/progresstracker/light.png");
        light.x = diamondBg.width/2;
        light.y = diamondBg.height/2 - 50;
        diamondBg.addChild(light);
        var diamondIcon = new cc.Sprite("res/SD/reward/icondiamondreward.png");
        diamondIcon.x = diamondBg.width/2;
        diamondIcon.y = diamondBg.height/2 - 60;
        diamondBg.addChild(diamondIcon);
        var diamondRewardLb = new cc.LabelBMFont(diamonds + localizeForWriting(" Diamonds"), res.Grown_Up_fnt);
        diamondRewardLb.scale = 0.4;
        diamondRewardLb.x = diamondBg.width/2;
        diamondRewardLb.y = diamondBg.height - 40;
        diamondBg.addChild(diamondRewardLb);
    },
    addBackButton: function(){
        var self = this;
        var button = new ccui.Button("back.png", "back-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = 50;
        button.y = cc.winSize.height - 70;
        this.addChild(button);
        button.addClickEventListener(function(){
            AudioManager.getInstance().play(res.ui_click_mp3_2, false, null);
            cc.director.runScene(new WelcomeScene());
        });
    },
    addCoinRain: function(){
        var cr = new CoinRain();
        this.addChild(cr, 10000);
        cr.startWithCallback(null);
    }
});
var RewardScene = cc.Scene.extend({
    ctor: function(coins, diamonds) {
        this._super();
        var layer = new RewardScreenLayer(coins, diamonds);
        this.addChild(layer);
    }
});