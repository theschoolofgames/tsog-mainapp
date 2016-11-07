var HomeScreenLayer = cc.Layer.extend({
    _bg: null,

    ctor: function () {
        // body...
        this._super();
        var bg = new cc.Sprite("res/SD/background.png");
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        this.addChild(bg);
        this._bg = bg;
        this.addPlayBoard();
        this.addAlphaRacingBoard();
        this.addLockBoard();
        this.addShopBoard();
    },

    addPlayBoard: function(){
        var board  = new ccui.Button("res/SD/blackboard.png","res/SD/blackboard.png", "");
        board.anchorX = 1;
        board.anchorY = 0;
        board.x = this._bg.width/2 - 50;
        board.y = this._bg.height/2 + 60;
        this._bg.addChild(board);
        board.addClickEventListener(function(){
            cc.director.runScene(new MapScene());
        });

        var lbLearn = new cc.LabelBMFont("LEARN", "yellow-font-export.fnt");
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 5;
        board.getRendererNormal().addChild(lbLearn);
    },

    addAlphaRacingBoard: function(){
        var board  = new ccui.Button("res/SD/blackboard.png","res/SD/blackboard.png", "");
        board.anchorX = 0;
        board.anchorY = 0;
        board.x = this._bg.width/2 + 50;
        board.y = this._bg.height/2 + 60;
        this._bg.addChild(board);
        board.addClickEventListener(function(){
            cc.director.runScene(new AlphaRacingScene(ALPHARACING_DATA, null, 600));
        });

        var lbPlay = new cc.LabelBMFont("PLAY", "yellow-font-export.fnt");
        lbPlay.x = board.width/2;
        lbPlay.y = board.height/2 + 5;
        board.getRendererNormal().addChild(lbPlay);
    },

    addShopBoard: function(){
        var board  = new ccui.Button("res/SD/blueboard.png","res/SD/blueboard.png", "");
        board.anchorX = 1;
        board.anchorY = 1;
        board.x = this._bg.width/2 - 50;
        board.y = this._bg.height/2 + 25;
        this._bg.addChild(board);
        board.addClickEventListener(function(){

        });
        var lbShop = new cc.LabelBMFont("SHOP", "yellow-font-export.fnt");
        lbShop.x = board.width/2;
        lbShop.y = board.height/2 + 5;
        board.getRendererNormal().addChild(lbShop);
    },

    addLockBoard: function(){
        var board  = new ccui.Button("res/SD/blueboard.png","res/SD/blueboard.png", "");
        board.anchorX = 0;
        board.anchorY = 1;
        board.x = this._bg.width/2 + 50;
        board.y = this._bg.height/2 + 25;
        this._bg.addChild(board);
        board.addClickEventListener(function(){

        });

        var keylock = new cc.Sprite("res/SD/keylock.png");
        keylock.x = board.width/2;
        keylock.y = board.height/2;
        board.addChild(keylock);
    },

});

var HomeScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new HomeScreenLayer();
        this.addChild(layer);
    }
});