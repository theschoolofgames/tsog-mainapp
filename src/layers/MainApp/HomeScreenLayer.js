var HOME_DOOR_OFFSET_Y = 260;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,
    ctor: function () {
        // body...
        this._super();
        var bg = new cc.Sprite("res/SD/BG_home.jpg");
        bg.anchorY = 0;
        bg.x = cc.winSize.width/2;
        bg.y = -132;
        bg.scale = cc.winSize.width / bg.width;
        cc.log("Scale: " + bg.scale);
        this._scale = bg.scale;
        this.addChild(bg);
        this._bg = bg;
        this.addPlayDoor();
        this.addLearnDoor();
        this.addHomeDoor();
        
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");

        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);

        this.addChild(new HomeHUDLayer());
    },

    _showDialog: function(){
        var dialog = new MessageDialog();
        var lb = new cc.LabelTTF("You not enough 10 coin to play!", "Arial", 30, cc.size(300, 80));
        lb.color = cc.color(0,0,0);
        lb.x = dialog.background.width/2;
        lb.y = dialog.background.height/2;
        dialog.addComponent(lb);
        this.addChild(dialog,100);

        var button = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = dialog.background.width/2;
        button.y = 100;
        dialog.addComponent(button);
        button.addClickEventListener(function(){
            dialog.removeFromParent();
        });
        var lbOK = new cc.LabelBMFont("OK", res.CustomFont_fnt); 
        lbOK.scale = 0.5;
        lbOK.x = button.width/2;
        lbOK.y = button.height/2;
        button.addChild(lbOK);

    },

    addPlayDoor: function(){
        var self = this;
        var door  = new ccui.Button("play_door.png","play_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        // door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2;
        door.y = cc.winSize.height/2 - HOME_DOOR_OFFSET_Y * this._scale;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            if(CurrencyManager.getInstance().getCoin() < GOLD_NEED_TO_PLAY_ALPHARACING)
                self._showDialog();
            CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
            cc.log("ALPHARACING: " + JSON.stringify(data));
        });
        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var lbPlay = new cc.LabelBMFont("PLAY", res.HomeFont_fnt);
        lbPlay.scale = 0.5;
        lbPlay.x = board.width/2;
        lbPlay.y = board.height/2 + 15;
        board.addChild(lbPlay);

        var lbHighScore = new cc.LabelBMFont(UserStorage.getInstance().getARHighscore().toString() + " m", res.CustomFont_fnt);
        lbHighScore.scale = 0.5;
        lbHighScore.x = lbPlay.x;
        lbHighScore.y = lbPlay.y - 37;
        board.addChild(lbHighScore);

    },

    addLearnDoor: function(){
        var door  = new ccui.Button("learn_door.png","learn_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 0;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 + door.width/2 + 40 * this._scale;
        door.y = cc.winSize.height/2 - HOME_DOOR_OFFSET_Y * this._scale;
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
        cc.log("LastLevel: " + UserStorage.getInstance().getLastLevelPlay());
        var lastLevel = UserStorage.getInstance().getLastLevelPlay();
        lastLevel = "L. " + lastLevel;
        var lbHighScore = new cc.LabelBMFont(lastLevel, res.CustomFont_fnt);
        lbHighScore.scale = 0.5;
        lbHighScore.x = lbLearn.x;
        lbHighScore.y = lbLearn.y - 37;
        board.addChild(lbHighScore);
    },

    addHomeDoor: function(){
        var door  = new ccui.Button("home_door.png","home_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 - door.width/2 - 40 * this._scale;
        door.y = cc.winSize.height/2 - HOME_DOOR_OFFSET_Y * this._scale;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            cc.director.runScene(new TalkingAdiScene());
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