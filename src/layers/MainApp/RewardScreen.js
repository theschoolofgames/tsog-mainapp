var RewardScreenLayer = cc.Layer.extend({
    ctor: function (coins, diamonds) {
        // body...
        this._super();
        cc.log("Coins: " + coins);
        cc.log("diamonds: " + diamonds);
        this._createBackground();
        this._addPageBorders();
        this._addContent();
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

    _addContent: function(){
        var self = this;
        var lb = new cc.LabelBMFont("Thank you for joining us in our mission", "res/font/grownupcheckfont-export.fnt");
        lb.scale = 0.8;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height - 80;
        this.addChild(lb, 1);

        buttonShare = new ccui.Button("res/SD/dialogs/pay/pay_button_normal.png", "res/SD/dialogs/pay/pay_button_pressed.png", "");
        buttonShare.x = cc.winSize.width/2 - 200;
        buttonShare.y = 100;
        this.addChild(buttonShare);
        var lbShare = new cc.LabelBMFont("Share the news", res.HomeFont_fnt);
        lbShare.scale = 0.3;
        buttonShare.addChild(lbShare,1);
        lbShare.x = buttonShare.width/2;
        lbShare.y = buttonShare.height/2 + 5;
        buttonShare.addClickEventListener(function(){
            self.addChild(new ShareDialog(), 1);
        });

        buttonRate = new ccui.Button("res/SD/dialogs/pay/pay_button_normal.png", "res/SD/dialogs/pay/pay_button_pressed.png", "");
        buttonRate.x = cc.winSize.width/2 + 200;
        buttonRate.y = 100;
        this.addChild(buttonRate);
        var lbRate = new cc.LabelBMFont("Rate us", res.HomeFont_fnt);
        lbRate.scale = 0.3;
        buttonRate.addChild(lbRate,1);
        lbRate.x = buttonRate.width/2;
        lbRate.y = buttonRate.height/2 + 5;
        buttonRate.addClickEventListener(function(){
            cc.sys.openURL(GAME_URL);
        });

        lbReward = new cc.LabelBMFont("YOUR REWARD", res.HomeFont_fnt);
        lbReward.scale = 0.8;
        lbReward.x = cc.winSize.width/2;
        lbReward.y = cc.winSize.height/5 * 4 - 50;
        this.addChild(lbReward);
    }
});
var RewardScene = cc.Scene.extend({
    ctor: function(coins, diamonds) {
        this._super();
        var layer = new RewardScreenLayer(coins, diamonds);
        this.addChild(layer);
    }
});