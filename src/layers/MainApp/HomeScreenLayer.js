var HOME_DOOR_OFFSET_Y = 260;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,
    _blocktouch: false,
    ctor: function () {
        // init coin for testing
        var didCoinInit = KVDatabase.getInstance().getInt("didCoinInit", 0);
        if (!didCoinInit) {
            KVDatabase.getInstance().set("didCoinInit", 1);

            // CurrencyManager.getInstance().incCoin(1800);
            // CurrencyManager.getInstance().incDiamond(1800);
        }

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

        this.addChooseLanguageButton();
        
        this._blocktouch = false;
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");

        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);

        this.addChild(new HomeHUDLayer());
    },

    _showDialogIfNotEnoughCoin: function(){
        var dialog = new MessageDialog("#level_dialog_frame.png");
        var lb = new cc.LabelBMFont("Need 10 coins to play!", res.HomeFont_fnt);
        lb.scale = 0.7;
        lb.x = dialog.background.width/2 + 20;
        lb.y = dialog.background.height/2 + 100;
        lb.setColor(cc.color(255,255,255));
        lb.setBoundingWidth(550);
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

    _showDialogIfEnoughCoin: function(){
        var self = this;
        var dialog = new MessageDialog();
        var lb = new cc.LabelTTF("You have to spend 10 coins to play!", "Arial", 30, cc.size(300, 80));
        lb.color = cc.color(0,0,0);
        lb.x = dialog.background.width/2;
        lb.y = dialog.background.height/2;
        dialog.addComponent(lb);
        this.addChild(dialog,100);

        var buttonOk = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonOk.x = dialog.background.width/2 + 100;
        buttonOk.y = 100;
        buttonOk.scale = 0.6;
        dialog.addComponent(buttonOk);
        buttonOk.addClickEventListener(function(){
            dialog.removeFromParent();
            CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
            var data = DataManager.getInstance().getDataAlpharacing();
            cc.director.runScene(new AlphaRacingScene(data, null, 600));
        });
        var lbOK = new cc.LabelBMFont("OK", res.CustomFont_fnt); 
        lbOK.scale = 0.6;
        lbOK.x = buttonOk.width/2;
        lbOK.y = buttonOk.height/2;
        buttonOk.addChild(lbOK);

        var buttonCancel = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonCancel.x = dialog.background.width/2 - 100;
        buttonCancel.y = 100;
        buttonCancel.scale = 0.6;
        dialog.addComponent(buttonCancel);
        buttonCancel.addClickEventListener(function(){
            dialog.removeFromParent();
            self._blocktouch = false;
        });
        var lbCancel = new cc.LabelBMFont("CANCEL", res.CustomFont_fnt); 
        lbCancel.scale = 0.6;
        lbCancel.x = buttonCancel.width/2;
        lbCancel.y = buttonCancel.height/2;

        buttonCancel.addChild(lbCancel);
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
            // if(self._blocktouch)
            //     return;
            // self._blocktouch = true;
            if(CurrencyManager.getInstance().getCoin() < GOLD_NEED_TO_PLAY_ALPHARACING)
                self._showDialogIfNotEnoughCoin();
            // CurrencyManager.getInstance().decrCoin(GOLD_NEED_TO_PLAY_ALPHARACING);
            // var data = DataManager.getInstance().getDataAlpharacing();
            // cc.director.runScene(new AlphaRacingScene(data, null, 600));
            // self._showDialogIfEnoughCoin();
            else
                self.addChild(new DialogPlayAlpharacing());
            // cc.log("ALPHARACING: " + JSON.stringify(data));
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
    },

    addChooseLanguageButton: function() {
        var button = new ccui.Button("whitespace.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - button.width/2 - 10;
        button.y = button.height/2 + 10;
        this.addChild(button);

        var self = this;
        button.addClickEventListener(function() {
            self.addChild(new ChooseLanguageLayer(function() {cc.director.replaceScene(new HomeScene())}));
        });
        
        var lb = new cc.LabelBMFont("Choose Language", res.HudFont_fnt);
        lb.scale = 0.5;
        lb.x = button.width/2;
        lb.y = button.height/2;
        button.getVirtualRenderer().addChild(lb);
    },
});

var HomeScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new HomeScreenLayer();
        this.addChild(layer);
    }
});