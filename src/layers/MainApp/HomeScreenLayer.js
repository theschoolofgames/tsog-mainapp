var HOME_DOOR_OFFSET_Y = 260;
var HOME_DOOR_Y = 30;
var HOME_BACKGROUND_OFFSET_Y = -132;
var BOARD_LABEL_SCALE = 0.5;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,
    _blocktouch: false,
    ctor: function () {
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");
        // init coin for testing
        var didCoinInit = KVDatabase.getInstance().getInt("didCoinInit", 0);
        if (!didCoinInit) {
            KVDatabase.getInstance().set("didCoinInit", 1);
            CurrencyManager.getInstance().incCoin(1800);
            CurrencyManager.getInstance().incDiamond(1800);
        };

        this._super();
        var bg = new cc.Sprite("res/SD/BG_home.jpg");
        bg.anchorY = 0;
        bg.x = cc.winSize.width/2;
        bg.y = HOME_BACKGROUND_OFFSET_Y * Utils.getScaleFactorTo16And9();
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
        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);

        this.addChild(new HomeHUDLayer(),2);

        // var testNode = new CharacterNodeAlpharacing("monkey");
        // testNode.x = cc.winSize.width/2;
        // testNode.y = cc.winSize.height/2;
        // this.addChild(testNode, 1000);

        // this.setVolume();
    },

    setVolume:function() {
        cc.audioEngine.setMusicVolume(0.1);
        cc.audioEngine.setEffectsVolume(0.7);
    },

    addPlayDoor: function(){
        var self = this;
        var door  = new ccui.Button("play_door.png","play_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        // door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            // if(self._blocktouch)
            //     return;
            // self._blocktouch = true;
            if(CurrencyManager.getInstance().getCoin() < COIN_NEED_TO_PLAY_ALPHARACING)
                self.addChild(new DialogPlayAlpharacing(true));
            // CurrencyManager.getInstance().decrCoin(COIN_NEED_TO_PLAY_ALPHARACING);
            // var data = DataManager.getInstance().getDataAlpharacing();
            // cc.director.runScene(new AlphaRacingScene(data, null, 600));
            // self._showDialogIfEnoughCoin();
            else
                self.addChild(new DialogPlayAlpharacing(false));
            // cc.log("ALPHARACING: " + JSON.stringify(data));
        });
        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var text = localizeForWriting("play");
        var lbPlay = new cc.LabelBMFont(text.toUpperCase(), res.HomeFont_fnt);
        lbPlay.scale = (lbPlay.width*BOARD_LABEL_SCALE > board.width*0.75) ? (board.width*0.75 / lbPlay.width) : BOARD_LABEL_SCALE;
        lbPlay.x = board.width/2;
        lbPlay.y = board.height/2 + 15;
        board.addChild(lbPlay);

        // var lbHighScore = new cc.LabelBMFont(UserStorage.getInstance().getARHighscore().toString() + " m", res.CustomFont_fnt);
        // lbHighScore.scale = 0.5;
        // lbHighScore.x = lbPlay.x;
        // lbHighScore.y = lbPlay.y - 37;
        // board.addChild(lbHighScore);
        var dimaond = new cc.Sprite("#diamond-00.png");
        dimaond.scale = 0.5;
        dimaond.x = lbPlay.x;
        dimaond.y = lbPlay.y - 40;
        board.addChild(dimaond);

    },

    addLearnDoor: function(){
        var door  = new ccui.Button("learn_door.png","learn_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 0;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 + door.width/2 + 40 * this._scale;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            cc.director.runScene(new MapScene());
        });

        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var text = localizeForWriting("learn");
        var lbLearn = new cc.LabelBMFont(text.toUpperCase(), res.HomeFont_fnt);
        lbLearn.scale = (lbLearn.width*BOARD_LABEL_SCALE > board.width*0.75) ? (board.width*0.75 / lbLearn.width) : BOARD_LABEL_SCALE;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 15;
        board.addChild(lbLearn);
        cc.log("LastLevel: " + UserStorage.getInstance().getLastLevelPlay());
        var lastLevel = UserStorage.getInstance().getLastLevelPlay();
        lastLevel = "L. " + lastLevel;
        // var lbHighScore = new cc.LabelBMFont(lastLevel, res.CustomFont_fnt);
        // lbHighScore.scale = 0.5;
        // lbHighScore.x = lbLearn.x;
        // lbHighScore.y = lbLearn.y - 37;
        // board.addChild(lbHighScore);

        var coin = new cc.Sprite("#gold.png");
        coin.scale = 0.5;
        coin.x = lbLearn.x;
        coin.y = lbLearn.y - 40;
        board.addChild(coin);
    },

    addHomeDoor: function(){
        var door  = new ccui.Button("home_door.png","home_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 - door.width/2 - 40 * this._scale;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(function(){
            // AudioManager.getInstance().play(res.home_click_mp3, false, null);
            // cc.director.replaceScene(new cc.TransitionFade(4, new TalkingAdiScene(), cc.color.WHITE));
            cc.director.replaceScene(new TalkingAdiScene());
        });
        var board = new cc.Sprite("#board.png");
        board.x = door.width/2;
        board.y = door.height - 130;
        door.addChild(board);

        var text = localizeForWriting("home");
        var lbLearn = new cc.LabelBMFont(text.toUpperCase(), res.HomeFont_fnt);
        lbLearn.scale = (lbLearn.width*BOARD_LABEL_SCALE > board.width*0.75) ? (board.width*0.75 / lbLearn.width) : BOARD_LABEL_SCALE;
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
            self.addChild(new ChooseLanguageLayer(function() {
                cc.log("chooselanguage callback");
                cc.director.replaceScene(new HomeScene())}));
        });
        
        var text = localizeForWriting("choose language");
        var lb = new cc.LabelBMFont(text, res.CustomFont_fnt);
        lb.scale = (button.width * 0.9) / lb.width;
        lb.x = button.width/2;
        lb.y = button.height/2 + 3;
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