var MainScreenLayer = cc.Layer.extend({
    schLayer: null,
    _isLoggedIn: 0,

    ctor: function () {
        this._super();
        var policyAccepted = KVDatabase.getInstance().getInt("policyAccepted", 0);
        if (!policyAccepted) {
            this.addChild(new PrivacyPolicyScreen(), 9999);
        }

        RequestsManager.getInstance().getGame(GAME_ID, function(succeed, data) {
            if (succeed) {
                KVDatabase.getInstance().set(STRING_GAME_CONFIG, data.config);
                ConfigStore.setupInstance(false);
            }
        });

        this.downloadAssets();
        this.checkNewVersion(); 
        // this.checkPurchasedState();

        var startedDay = KVDatabase.getInstance().getInt("startedDay", 0);
        cc.log("startedDay: " + startedDay);
        if (!startedDay) {
            startedDay = Date.now()/1000;
            KVDatabase.getInstance().set("startedDay", startedDay);
            cc.log("startedDay: " + startedDay);
        } else {
            var currentDay = Date.now()/1000;
            var playedDay = Math.floor((currentDay - startedDay) / 86400); // second to daytime
            cc.log("currentDay: " + currentDay);
            cc.log("playedDay: " + playedDay);
            cc.log("amountOfFreeDayToPlay: " + GAME_CONFIG.amountOfFreeDayToPlay);
            if (playedDay >= GAME_CONFIG.amountOfFreeDayToPlay)
                KVDatabase.getInstance().set("outOfFreeDay", 1);
        }
    },

    onEnter: function() {
        this._super();
        this._isLoggedIn = KVDatabase.getInstance().getInt("isLoggedIn", 0);
        var studentId = KVDatabase.getInstance().getString(STRING_STUDENT_ID, "");
        var userId = KVDatabase.getInstance().getString(STRING_USER_ID, "");
        console.log("StudentId -> " + studentId);
        
        if (this._isLoggedIn == 1 && userId) {
            if (studentId){
                this._moveToMainScene();  
            }
            else {
                this._moveToStudentSelectorScene();
            }

            Utils.checkFullAccessPermission(userId);
        }
        else {
            this._createBackground();
            this._addDialog();
            this._addDialogButtons();
            this._playBackgroundMusic();
        }
    },

    _addDialog: function() {
        this._popupDialog = new cc.Sprite("#popup.png");
        this._popupDialog.x = cc.winSize.width/2;
        // this._popupDialog.y = cc.winSize.height/2;
        this._popupDialog.y = -this._popupDialog.height/2;
        // this._popupDialog.scale = 0;

        this._popupDialog.runAction(
            cc.sequence(
                cc.moveBy(0.5, cc.p(0, this._popupDialog.height+50)).easing(cc.easeElasticInOut(0.6))
                // cc.scaleTo(0.2, 1.1),
                // cc.scaleTo(0.2, 1).easing(cc.easeElasticInOut(0.6))
            )
        );
        this.addChild(this._popupDialog);
    },

    _addDialogButtons: function() {
        var self = this;

        // LOGIN
        var btnLogin = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnLogin.x = this._popupDialog.width/2;
        btnLogin.y = this._popupDialog.height/2;
        this._popupDialog.addChild(btnLogin);
        btnLogin.addClickEventListener(function() {
            cc.director.replaceScene(new cc.TransitionFade(1, new LoginScene(), cc.color(255, 255, 255, 255)));
        });

        var lbLogin = new cc.LabelBMFont("LOGIN", "yellow-font-export.fnt");
        lbLogin.scale = 0.6;
        lbLogin.x = btnLogin.width/2;
        lbLogin.y = btnLogin.height/2;
        btnLogin.getRendererNormal().addChild(lbLogin);

        // REGISTER
        var btnRegister = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnRegister.x = this._popupDialog.width/2;
        btnRegister.y = this._popupDialog.height/2 - 100;
        this._popupDialog.addChild(btnRegister);
        btnRegister.addClickEventListener(function() {
            //cc.director.replaceScene(new cc.TransitionFade(1, new SignUpScene("MainScene"), cc.color(255, 255, 255, 255)));
            cc.director.replaceScene(new cc.TransitionFade(1, new GameTestScene(), cc.color(255, 255, 255, 255)));
        });

        var lbRegister = new cc.LabelBMFont("TEST GAMES", "yellow-font-export.fnt");
        lbRegister.scale = 0.6;
        lbRegister.x = btnRegister.width/2;
        lbRegister.y = btnRegister.height/2;
        btnRegister.getRendererNormal().addChild(lbRegister);

        // PLAY
        var btnPlay = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnPlay.x = this._popupDialog.width/2;
        btnPlay.y = this._popupDialog.height/2 + 100;
        this._popupDialog.addChild(btnPlay);
        btnPlay.addClickEventListener(function() {
            // cc.log("PLAY");
            cc.audioEngine.stopMusic();
            self._moveToMainScene();
        });

        var lbPlay = new cc.LabelBMFont("PLAY", "yellow-font-export.fnt");
        lbPlay.scale = 0.6;
        lbPlay.x = btnPlay.width/2;
        lbPlay.y = btnPlay.height/2;
        btnPlay.getRendererNormal().addChild(lbPlay);

        // MAP
        var btnMap = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnMap.x = this._popupDialog.width/2;
        btnMap.y = this._popupDialog.height/2 + 200;
        this._popupDialog.addChild(btnMap);
        btnMap.addClickEventListener(function() {
            // cc.log("PLAY");
            cc.director.runScene(new MapScene());
        });

        var lbMap = new cc.LabelBMFont("MAP", "yellow-font-export.fnt");
        lbMap.scale = 0.6;
        lbMap.x = btnMap.width/2;
        lbMap.y = btnMap.height/2;
        btnMap.getRendererNormal().addChild(lbMap);

        // IAP TEST BUTTON
        // var btnIAPTest = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        // btnIAPTest.x = this._popupDialog.width/2;
        // btnIAPTest.y = this._popupDialog.height/2 - 100;
        // this._popupDialog.addChild(btnIAPTest);
        // btnIAPTest.addClickEventListener(function() {
        //     IAPManager.getInstance().purchaseMonthlySubscription();
        // });

        // var lbIAP = new cc.LabelBMFont("TEST PURCHASE", "yellow-font-export.fnt");
        // lbIAP.scale = 0.6;
        // lbIAP.x = btnIAPTest.width/2;
        // lbIAP.y = btnIAPTest.height/2;
        // btnIAPTest.getRendererNormal().addChild(lbIAP);
    },

    _createBackground: function() {
        var bg = new cc.Sprite(res.Bg_account_jpg);
        bg.x = cc.winSize.width / 2;
        bg.y = cc.winSize.height / 2;
        this.addChild(bg);

        var bush = new cc.Sprite("#grass.png");
        bush.anchorY = bush.anchorX = 0;
        this.addChild(bush);
        bush = new cc.Sprite("#grass.png");
        bush.anchorY = bush.anchorX = 0;
        bush.x = bush.width-1;
        bush.flippedX = true;
        this.addChild(bush, 0);

        var ground = new cc.Sprite("#Mainground.png");
        ground.anchorX = 0;
        this.addChild(ground, 1);
        ground = new cc.Sprite("#Mainground.png");
        ground.anchorX = 0;
        ground.x = ground.width-1;
        ground.flippedX = true;
        this.addChild(ground, 1);

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
            cc.delayTime(0),
            cc.callFunc(function() {
                // cc.director.replaceScene(new cc.TransitionFade(1, new TalkingAdiScene(), cc.color(255, 255, 255, 255)));
                var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
                var scene;
                if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
                    scene = new RoomScene();
                else
                    scene = new window[nextSceneName]();
                cc.log("test nextSceneName:" + nextSceneName);
                cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
                // cc.director.replaceScene(scene);
            }, this)
        ));
    },

    _moveToStudentSelectorScene: function() {

        this.runAction(cc.sequence(
            cc.delayTime(0),
            cc.callFunc(function() {
                
                cc.director.replaceScene(new cc.TransitionFade(1, new AccountSelectorScene(), cc.color(255, 255, 255, 255)));
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
    },

    checkPurchasedState: function() {
        IAPManager.getInstance().restore();
    },
});

var MainScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var msLayer = new MainScreenLayer();
        this.addChild(msLayer);
    }
});