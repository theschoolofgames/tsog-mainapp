var MainScreenLayer = cc.Layer.extend({
    schLayer: null,
    _isLoggedIn: 0,

    ctor: function () {
        this._super();

        RequestsManager.getInstance().getGame(GAME_ID, function(succeed, data) {
            if (succeed) {
                KVDatabase.getInstance().set(STRING_GAME_CONFIG, data.config);
                ConfigStore.setupInstance(false);
            }
        });

        this.downloadAssets();
        this.checkNewVersion(); 
    },

    onEnter: function() {
        this._super();
        // this._isLoggedIn = KVDatabase.getInstance().getInt("isLoggedIn", 0);
        // if (this._isLoggedIn == 0) {
        //     cc.director.replaceScene(new SchoolSelectorScene());
        //     this.playBackgroundMusic();
        // }
        // else
        //     cc.director.replaceScene(new WelcomeScene());
        this._createBackground();
        this._addButtons();
        this._playBackgroundMusic();
    },

    _createBackground: function() {
        var bg = new cc.Sprite(res.Bg_school_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);
    },

    _addButtons: function() {
        var self = this;

        var randBgIdx = Math.floor(Math.random()*2) + 1;
        var playButton = new ccui.Button("school_bg-"+ randBgIdx +".png", "", "", ccui.Widget.PLIST_TEXTURE);
        playButton.x = cc.winSize.width/2 - 200;
        playButton.y = cc.winSize.height/2;
        playButton.addClickEventListener(function() {
            // cc.log("PLAY");
            cc.audioEngine.stopMusic();
            self._moveToMainScene();
        });
        this.addChild(playButton);
        this._runBubbleAnimation(playButton);

        var font = SCHOOL_NAME_COLOR[Math.floor(Math.random()*4)];
        var playButtonLb = new cc.LabelBMFont("PLAY",
            font,
            playButton.width*1.5,
            cc.TEXT_ALIGNMENT_CENTER);
        playButtonLb.setScale(0.5);
        playButtonLb.x = playButton.width / 2;
        playButtonLb.y = playButton.height / 2;
        playButton.addChild(playButtonLb);

        randBgIdx = Math.floor(Math.random()*2) + 1;
        var loginButton = new ccui.Button("school_bg-"+ randBgIdx +".png", "", "", ccui.Widget.PLIST_TEXTURE);
        loginButton.x = cc.winSize.width/2 + 200;
        loginButton.y = cc.winSize.height/2;
        loginButton.addClickEventListener(function() {
            cc.director.runScene(new cc.TransitionFade(1, new SchoolSelectorScene(), cc.color(255, 255, 255, 255)));
        });
        this.addChild(loginButton);
        this._runBubbleAnimation(loginButton);

        font = SCHOOL_NAME_COLOR[Math.floor(Math.random()*4)];
        var loginButtonLb = new cc.LabelBMFont("LOGIN",
            font,
            loginButton.width*1.5,
            cc.TEXT_ALIGNMENT_CENTER);
        loginButtonLb.setScale(0.5);
        loginButtonLb.x = loginButton.width / 2;
        loginButtonLb.y = loginButton.height / 2;
        loginButton.addChild(loginButtonLb);
    },

    _playBackgroundMusic: function() {
        // if (cc.audioEngine.isMusicPlaying())
        //     return
        // play background music
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
    },

    _runBubbleAnimation: function(button) {
        button.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, this.getRandomedPosition(button)),
                    cc.moveTo(MOVE_DELAY_TIME, button.getPosition())
                )
            )
        )
    },

    getRandomedPosition: function(obj) {
        var randomedValueX = Math.random() * 20 - 10;
        var randomedValueY = Math.random() * 20 - 10;
        var randomedPos =  cc.p(obj.x + randomedValueX, obj.y + randomedValueY);

        return randomedPos;
    },

    _moveToMainScene: function() {

        this.runAction(cc.sequence(
            cc.callFunc(function() {
                // cc.director.runScene(new cc.TransitionFade(1, new TalkingAdiScene(), cc.color(255, 255, 255, 255)));
                var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
                var scene;
                if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
                    scene = new RoomScene();
                else
                    scene = new window[nextSceneName]();
                cc.director.runScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
            }, this)
        ));
    },

    downloadAssets: function() {
        var manifestPath = "project.manifest";
        var manager = new jsb.AssetsManager(manifestPath, Utils.getAssetsManagerPath());

        cc.log("Storage path for this test : " + Utils.getAssetsManagerPath());

        manager.retain();

        if (!manager.getLocalManifest().isLoaded()) {
            cc.log("Fail to update assets, step skipped.");
        }
        else {
            var listener = new jsb.EventListenerAssetsManager(manager, function(event) {
                switch (event.getEventCode())
                {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, skip assets update.");
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        var percent = event.getPercent();
                        var filePercent = event.getPercentByFile();
                        cc.log("Download percent : " + percent + " | File percent : " + filePercent);
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, update skipped.");
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("Update finished.");

                        ConfigStore.setupInstance(false);
                        // You need to release the assets manager while you are sure you don't need it any more
                        manager.release();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log("Update failed. " + event.getMessage());
                        // Directly update previously failed assets, we suggest you to count and abort after several retry.
                        manager.downloadFailedAssets();
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log(event.getMessage());
                        break;
                    default:
                        break;
                }
            });

            cc.eventManager.addListener(listener, 1);
            manager.update();
        }
    },

    checkNewVersion: function() {
        var currentVersionName = NativeHelper.callNative("getVersionName");

        var configableVersionName = GAME_CONFIG[cc.sys.os.toLowerCase() + "VersionName"] || UPDATED_CONFIG[cc.sys.os.toLowerCase() + "VersionName"];
        var configableForceUpdate = GAME_CONFIG[cc.sys.os.toLowerCase() + "ForceUpdate"] || UPDATED_CONFIG[cc.sys.os.toLowerCase() + "ForceUpdate"];

        // cc.log(currentVersionName + " " + configableVersionName);

        if (cmpVersions(configableVersionName, currentVersionName) > 0) {
            // Show dialog
            cc.log("Show Dialog");
            NativeHelper.callNative("showUpdateDialog", [configableVersionName, configableForceUpdate]);
        }
    }
});

var MainScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});