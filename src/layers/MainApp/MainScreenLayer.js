var MainScreenLayer = cc.Layer.extend({
    schLayer: null,
    _isLoggedIn: 0,

    ctor: function () {
        this._super();

        this._isLoggedIn = KVDatabase.getInstance().getInt("isLoggedIn", 0);
        /*
            this._isLoggedIn = 0 is not logged in,
            1 is logged in
        */
        var self = this;
        Utils.delayOneFrame(this, function() {
            // NativeHelper.callNative("startRestClock", [GAME_CONFIG.timeToPauseGame]);
            if (self._isLoggedIn == 0) {
                cc.director.replaceScene(new SchoolSelectorScene());
                self.playBackgroundMusic();
            }
            else
                cc.director.replaceScene(new WelcomeScene());
        });

        RequestsManager.getInstance().getGame(GAME_ID, function(succeed, data) {
            if (succeed) {
                KVDatabase.getInstance().set(STRING_GAME_CONFIG, data.config);
                ConfigStore.setupInstance(false);
            }
        });

        this.downloadAssets();
        this.checkNewVersion(); 
    },


    playBackgroundMusic: function() {
        if (cc.audioEngine.isMusicPlaying())
            return
        // play background music
        cc.audioEngine.setMusicVolume(0.2);
        cc.audioEngine.playMusic(res.background_mp3, true);
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