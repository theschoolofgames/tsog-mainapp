var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,
    ctor: function () {
        // body...
        this._super();
        var bg = new cc.Sprite("res/SD/BG_home.jpg");
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        bg.scale = cc.winSize.width / bg.width;
        cc.log("Scale: " + bg.scale);
        this._scale = bg.scale;
        this.addChild(bg);
        this._bg = bg;
        this.addPlayDoor();
        this.addLearnDoor();
        this.addHomeDoor();
        
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
        // setLanguage("swahili");

    },

    addPlayDoor: function(){
        var door  = new ccui.Button("play_door.png","play_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        // door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2;
        door.y = cc.winSize.height/2 - 220 * this._scale;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
            cc.log("ALPHARACING: " + JSON.stringify(data));
        });
        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var lbLearn = new cc.LabelBMFont("PLAY", res.HomeFont_fnt);
        lbLearn.scale = 0.5;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 15;
        board.addChild(lbLearn);

    },

    addLearnDoor: function(){
        var door  = new ccui.Button("learn_door.png","learn_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 0;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 + door.width/2 + 40 * this._scale;
        door.y = cc.winSize.height/2 - 220 * this._scale;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            cc.director.runScene(new MapScene());
        });

        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var lbLearn = new cc.LabelBMFont("LEARN", res.HomeFont_fnt);
        lbLearn.scale = 0.5;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 15;
        board.addChild(lbLearn);
    },

    addHomeDoor: function(){
        var door  = new ccui.Button("home_door.png","home_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 - door.width/2 - 40 * this._scale;
        door.y = cc.winSize.height/2 - 220 * this._scale;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            cc.director.runScene(new ShopScene());
        });
        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var lbLearn = new cc.LabelBMFont("HOME", res.HomeFont_fnt);
        lbLearn.scale = 0.5;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 15;
        board.addChild(lbLearn);

        var character = new AdiDogNode(true);
        character.scale  = 0.5;
        character.x = 0;
        character.y = 0;
        door.addChild(character);
    }

});

var HomeScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new HomeScreenLayer();
        this.addChild(layer);
    }
});