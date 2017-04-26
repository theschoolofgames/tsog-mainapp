var HOME_DOOR_OFFSET_Y = 260;
var HOME_DOOR_Y = 30;
var HOME_BACKGROUND_OFFSET_Y = -132;
var BOARD_LABEL_SCALE = 0.5;
var HOME_DOOR_Z_ORDER = 3;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,

    _playBeginHomeCutScene: false,
    ctor: function (playBeginHomeCutScene) {
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");

        this._super();

        this.addBackGround();
        this.addPlayDoor();
        this.addLearnDoor();
        this.addHomeDoor();
        this.addProgressTrackerButton();

        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);

        this.addChild(new HomeHUDLayer(),2);

        this._playBeginHomeCutScene = playBeginHomeCutScene || false;
        if (this._playBeginHomeCutScene)
            this.playBeginHomeCutScene();
        
    },

    addProgressTrackerButton: function(){
        var self = this;
        var button = new ccui.Button("res/SD/button-progress-tracker.png", "res/SD/button-progress-tracker-pressed.png", "");
        button.x = cc.winSize.width - button.width/2  - 60;
        button.y = cc.winSize.height - button.height + 10;
        button.scale = 1.3;
        this.addChild(button);
        button.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
            var dialog = new ProgressTrackerLayer();
            self.addChild(dialog, 999999);
        });
        
        var text = localizeForWriting("Progress Tracker");
        var lb = new cc.LabelBMFont(text, res.HomeFont_fnt);
        lb.scale = (button.width * 0.85) / lb.width;
        lb.x = button.width/2;
        lb.y = button.height/2 + 3;
        button.addChild(lb);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        var characterList = CharacterManager.getInstance().getCharactersHasNotUnlock();
        if (HomeScreenLayer.didGoFromAlphaRacing && CurrencyManager.getInstance().getDiamond() >= characterList[0].price) {
            ShopScreenLayer.wantScrollToNextAvailableCharacter = true;
            DialogPetStore.show();
        }
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
        // KVDatabase.getInstance().set("didPlayCutScene", 1);
        // shadow layer 
        var l = new cc.LayerColor(cc.color(0, 0, 0, 180));
        l.setLocalZOrder(HOME_DOOR_Z_ORDER + 2);
        this.addChild(l);

        var door = this.getChildByName("pet");
        this.runDoorCutSceneAction(door, 1);

        door = this.getChildByName("play");
        this.runDoorCutSceneAction(door, 0);

        door = this.getChildByName("learn");
        this.runDoorCutSceneAction(door, 0.5);
    

        this.runAction(cc.sequence(
            cc.delayTime(2.2),
            cc.callFunc(function() {
                l.removeFromParent();
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
        door.setTouchEnabled(!this._playBeginHomeCutScene);
        
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
        var diamond = new cc.Sprite("#diamond-00.png");
        diamond.scale = 0.5;
        diamond.x = lbPlay.x;
        diamond.y = lbPlay.y - 40;
        board.addChild(diamond);

    },

    addLearnDoor: function(){
        var door  = new ccui.Button("learn_door.png","learn_door_pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        door.name = "learn";
        door.setTouchEnabled(!this._playBeginHomeCutScene);
        
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
        door.name = "pet";
        door.setTouchEnabled(!this._playBeginHomeCutScene);
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

        var text = localizeForWriting("pets");
        var lbLearn = new cc.LabelBMFont(text.toUpperCase(), res.HomeFont_fnt);
        lbLearn.scale = (lbLearn.width*BOARD_LABEL_SCALE > board.width*0.75) ? (board.width*0.75 / lbLearn.width) : BOARD_LABEL_SCALE;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2 + 15;
        board.addChild(lbLearn);

        var character = new AdiDogNode(true);
        character.scale  = 0.5;
        character.anchorX = 0;
        // character.x = door.x;
        // character.y = door.y;
        door.addChild(character, HOME_DOOR_Z_ORDER+2);
    },

    _onDoorPressed: function(door) {
        AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);

        var doorName = door.name;
        switch(doorName) {
            case "play":
                this.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
                break;
            case "learn":
                cc.director.runScene(new MapScene());
                break;
            case "pet":
                cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        }
    },

    onExit: function() {
        this._super();
        HomeScreenLayer.didGoFromAlphaRacing = false;
    },
});

var HomeScene = cc.Scene.extend({
    ctor: function(playBeginHomeCutScene) {
        this._super();
        var layer = new HomeScreenLayer(playBeginHomeCutScene);
        this.addChild(layer);
    }
});

HomeScreenLayer.didGoFromAlphaRacing = false;