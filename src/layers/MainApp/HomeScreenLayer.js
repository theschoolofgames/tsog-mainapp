var HOME_DOOR_OFFSET_Y = 260;
var HOME_DOOR_Y = 30;
var HOME_BACKGROUND_OFFSET_Y = -132;
var BOARD_LABEL_SCALE = 0.5;
var HOME_DOOR_Z_ORDER = 3;
var HomeScreenLayer = cc.Layer.extend({
    _bg: null,
    _scale: null,

    _playBeginHomeCutScene: false,

    lbHighScore: null,

    ctor: function (playBeginHomeCutScene) {
        AnalyticsManager.getInstance().logCustomEvent(EVENT_HOME_LOAD);
        currentLanguage = KVDatabase.getInstance().getString("currentLanguage", "en");

        this._super();

        this._playBeginHomeCutScene = playBeginHomeCutScene || false;
        this.addBackGround();
        this.addPlayDoor();
        this.addLearnDoor();
        this.addHomeDoor();        
    
        this.addChild(new HomeHUDLayer(),2);
        this.addProgressTrackerButton();
        KVDatabase.getInstance().set("ignoreMapScrollAnimation", 1);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        var isOpenedFromNotif = NativeHelper.callNative("isOpenedFromNotification");
        var isFirstSession = KVDatabase.getInstance().getString("game_first_session", false);
        var isNewSession = KVDatabase.getInstance().getString("game_new_session", false);

        if (isFirstSession || isOpenedFromNotif || !isNewSession) {
            if (this._playBeginHomeCutScene)
                this.playBeginHomeCutScene();
        } else {
            CheckProgressDialog.show();
        }

    },

    addProgressTrackerButton: function(){
        var button = new ccui.Button("res/SD/grownup/button-grown-up.png", "res/SD/grownup/button-grown-up-pressed.png", "");
        button.x = cc.winSize.width - button.width/2  - 10;
        button.y = cc.winSize.height - button.height + 10;
        this.addChild(button);
        var self = this;
        button.addClickEventListener(function() {
            AudioManager.getInstance().play(res.ui_click_mp3_0, false, null);
            AnalyticsManager.getInstance().logCustomEvent(EVENT_PARENTS_CLICK);
            var dialog = new GrownUpCheckDialog(self.grownUpCheckCallback);
            self.addChild(dialog, 999999);
        });
        
        var text = localizeForWriting("Parents");
        var lb = new cc.LabelBMFont(text, res.Grown_Up_fnt);
        lb.scale = (button.width * 0.8) / lb.width;
        lb.x = button.width/2;
        lb.y = button.height/2 + 3;
        button.addChild(lb);
    },

    grownUpCheckCallback: function() {
        AnalyticsManager.getInstance().logCustomEvent(EVENT_MISSION_PAGE_2);
        cc.director.replaceScene(new MissionPageAfterLoginScene());
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
        // shadow layer 
        var l = new cc.LayerColor(cc.color(0, 0, 0, 180));
        l.setLocalZOrder(HOME_DOOR_Z_ORDER + 2);
        this.addChild(l);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);



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

        var lbHighScore = new cc.LabelBMFont(UserStorage.getInstance().getARHighscore().toString(), res.HomeFont_fnt);
        lbHighScore.scale = 0.7;
        lbHighScore.x = board.x;
        lbHighScore.y = cc.rectGetMinY(board.getBoundingBox()) - 105*lbHighScore.scale;
        door.addChild(lbHighScore);
        var diamond = new cc.Sprite("#diamond-00.png");
        diamond.scale = 0.5;
        diamond.x = lbPlay.x;
        diamond.y = lbPlay.y - 40;
        board.addChild(diamond);

        this.lbHighScore = lbHighScore;

        this.schedule(this.updateHighScore, 0.5);
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
        // var lastLevel = UserStorage.getInstance().getLastLevelPlay();
        // lastLevel = "L. " + lastLevel;
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
        cc.log("board width: " + board.width);
        var text = localizeForWriting("pets");
        var lbLearn = new cc.LabelBMFont(text.toUpperCase(), res.HomeFont_fnt);
        lbLearn.setBoundingWidth(350);
        lbLearn.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbLearn.scale = currentLanguage == "en"? BOARD_LABEL_SCALE : 0.33;
        lbLearn.x = board.width/2;
        lbLearn.y = board.height/2;
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
                AnalyticsManager.getInstance().logCustomEvent(EVENT_PLAY_CLICK);
                this.addChild(new DialogPlayAlpharacing(false), HOME_DOOR_Z_ORDER+3);
                break;
            case "learn":
                AnalyticsManager.getInstance().logCustomEvent(EVENT_LEARN_CLICK);
                this._handleTappedLearn();
                break;
            case "home":
                AnalyticsManager.getInstance().logCustomEvent(EVENT_PETS_CLICK);
                cc.director.replaceScene(new TalkingAdiScene());
                break;
            default:
                break;
        }
    },

    _handleTappedLearn: function() {
        // if (NativeHelper.callNative("hasGrantPermission", ["WRITE_EXTERNAL_STORAGE"]))
            cc.director.runScene(new MapScene());
        // else {
        //     NativeHelper.setListener("RequestPermission", this);
        //     NativeHelper.callNative("requestPermission", ["WRITE_EXTERNAL_STORAGE"]);
        // }
    },
    onRequestPermission: function(succeed) {
        if (succeed)
            cc.director.runScene(new MapScene());
        else {
            NativeHelper.callNative("showMessage", ["Permission Required", "Please enable permission to read/write files to storage in Device Setting for TSOG"]);
        }
    },

    updateHighScore: function() {
        this.lbHighScore.setString(UserStorage.getInstance().getARHighscore().toString());
    },
});

var HomeScene = cc.Scene.extend({
    ctor: function(playBeginHomeCutScene) {
        this._super();
        var layer = new HomeScreenLayer(playBeginHomeCutScene);
        this.addChild(layer);
    }
});