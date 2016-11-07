ShopScreenLayer = cc.LayerColor.extend({
    ctor: function() {
        this._super(cc.color(255,255,255,255));
        this.addBackToHomeScene();
        this.addCurrency();
    },

    addBackToHomeScene: function(){
        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - button.width;
        button.y = cc.winSize.height - button.height/2 - 10;
        this.addChild(button, 9999);
        button.addClickEventListener(function(){
            cc.director.runScene(new HomeScene());
        });
        var lb = new cc.LabelBMFont("BACK TO HOME", "yellow-font-export.fnt");
        lb.scale = 0.5;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.getRendererNormal().addChild(lb);
    },


    addCurrency: function(){
        var coin = new cc.Sprite("res/SD/gold.png");
        coin.x = 100;
        coin.y = cc.winSize.height - coin.height/2 - 10;
        this.addChild(coin, 999);

        var diamond = new cc.Sprite("res/SD/diamond.png");
        diamond.x = 200;
        diamond.y = cc.winSize.height - diamond.height/2 - 10;
        this.addChild(diamond, 999);

    }
});
var ShopScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new ShopScreenLayer();
        this.addChild(layer);
    }
});