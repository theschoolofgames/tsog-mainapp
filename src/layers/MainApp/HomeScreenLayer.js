var HOME_DOOR_OFFSET_Y = 260;
var HOME_DOOR_Y = 30;
var HOME_BACKGROUND_OFFSET_Y = -132;
var BOARD_LABEL_SCALE = 0.5;
var HOME_DOOR_Z_ORDER = 3;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,

    _changeLanguageButton: null,

    _didCutScenePlayed: false,
    ctor: function () {
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");

        this._super();

        // block touch for cutscene

        this.addBackGround();
        this.addPlayDoor();
        this.addLearnDoor();
        this.addHomeDoor();
        
        this.addChooseLanguageButton();
        
        
        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);

        this.addChild(new HomeHUDLayer(),2);

        this._didCutScenePlayed = KVDatabase.getInstance().getInt("didPlayCutScene", 0);
        if (!this._didCutScenePlayed)
            this.playBeginHomeCutScene();
    },

    addBackGround: function() {
        var bg = new cc.Sprite("res/SD/BG_home.jpg");
        bg.anchorY = 0;
        bg.x = cc.winSize.width/2;
        bg.y = HOME_BACKGROUND_OFFSET_Y * Utils.getScaleFactorTo16And9();
        bg.scale = cc.winSize.width / bg.width;
        this.addChild(bg);
        this._bg = bg;
        this._scale = bg.scale;
    },  

    playBeginHomeCutScene: function() {
        KVDatabase.getInstance().set("didPlayCutScene", 1);
        // shadow layer 
        var l = new cc.LayerColor(cc.color(0, 0, 0, 220));
        l.setLocalZOrder(HOME_DOOR_Z_ORDER + 2);
        this.addChild(l);

        var door = this.getChildByName("home");
        this.runDoorCutSceneAction(door, 1);

        door = this.getChildByName("play");
        this.runDoorCutSceneAction(door, 0);

        door = this.getChildByName("learn");
        this.runDoorCutSceneAction(door, 0.5);
    

        this.runAction(cc.sequence(
            cc.delayTime(2.2),
            cc.callFunc(function() {
                l.removeFromParent();
                this._changeLanguageButton.setTouchEnabled(true);
            }.bind(this))
        ));
    },

    runDoorCutSceneAction: function(door, baseTimeDelay) {
        var scale = this._scale;
        door.runAction(cc.sequence(
            cc.delayTime(baseTimeDelay + 0.5),
            cc.spawn(
                cc.sequence(
                    cc.scaleTo(0.25, scale-0.05).easing(cc.easeBackIn(1)),
                    cc.scaleTo(0.25, scale)
                ),
                cc.sequence(
                    cc.callFunc(function() {
                        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
                        door.setLocalZOrder(HOME_DOOR_Z_ORDER + 3);
                        door.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
                    }),
                    cc.delayTime(0.5),
                    cc.callFunc(function() {
                        door.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
                        door.setLocalZOrder(HOME_DOOR_Z_ORDER);
                        door.setTouchEnabled(true);
                    })
                )
            )
        ))
    },

    addPlayDoor: function(){
        var self = this;
        var door = new ccui.Button("play_door.png","play_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.name = "play";
        door.setTouchEnabled(!this._didCutScenePlayed);
        
        door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 - door.width/2 - 40 * this._scale;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(this._onDoorPressed.bind(this));
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
        door.name = "learn";
        door.setTouchEnabled(!this._didCutScenePlayed);
        
         // door.anchorX = 1;
        door.anchorY = 0;
        door.x = cc.winSize.width/2;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(this._onDoorPressed.bind(this));

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
        // cc.log("LastLevel: " + UserStorage.getInstance().getLastLevelPlay());
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
        door.name = "home";
        door.setTouchEnabled(!this._didCutScenePlayed);
        door.anchorX = 0;
        door.anchorY = 0;
        door.x = cc.winSize.width/2 + door.width/2 + 40 * this._scale;
        door.y = HOME_DOOR_Y;
        door.scale = this._scale;
        this.addChild(door);
        door.addClickEventListener(this._onDoorPressed.bind(this));
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
        character.anchorX = 0;
        character.x = door.x;
        character.y = door.y;
        this.addChild(character, HOME_DOOR_Z_ORDER+2);
    },

    addChooseLanguageButton: function() {
        var button = new ccui.Button("whitespace.png", "", "", ccui.Widget.PLIST_TEXTURE);
        button.setTouchEnabled(!this._didCutScenePlayed);
        button.x = cc.winSize.width - button.width/2 - 10;
        button.y = button.height/2 + 10;
        this.addChild(button, HOME_DOOR_Z_ORDER+1);

        var self = this;
        button.addClickEventListener(function() {
            self.addChild(new ChooseLanguageLayer(function() {
                // cc.log("chooselanguage callback");
                cc.director.replaceScene(new HomeScene())}));
        });
        
        var text = localizeForWriting("choose language");
        var lb = new cc.LabelBMFont(text, res.CustomFont_fnt);
        lb.scale = (button.width * 0.9) / lb.width;
        lb.x = button.width/2;
        lb.y = button.height/2 + 3;
        button.getVirtualRenderer().addChild(lb);

        this._changeLanguageButton = button;
    },

    _onDoorPressed: function(door) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);

        var doorName = door.name;
        switch(doorName) {
            case "play":
                var didEnoughCoinToPlay = (CurrencyManager.getInstance().getCoin() < COIN_NEED_TO_PLAY_ALPHARACING) ? true : false;
                this.addChild(new DialogPlayAlpharacing(didEnoughCoinToPlay));
                break;
            case "learn":
                cc.director.runScene(new MapScene());
                break;
            case "home":
                cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        }
    },
});

var HomeScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        var layer = new HomeScreenLayer();
        this.addChild(layer);
    }
});