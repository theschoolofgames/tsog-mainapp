var AssetManager = cc.Class.extend({
	_manager: null,

	ctor: function() {
		cc.assert(AssetManager._instance == null, "can be instantiated once only");

		var manifestUrl = "downloadable-assets.json";
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "downloaded/");
        cc.log("AssetManager: Storage path for downloadable assets: " + storagePath);
		var manager = new jsb.AssetsManager(manifestUrl, storagePath);
		this._manager = manager;

		// As the process is asynchronised, you need to retain the assets manager to make sure it won't be released before the process is ended.
		manager.retain();

		if (!manager.getLocalManifest().isLoaded()) {
		    cc.log("Fail to update assets, step skipped.");
		}
		else {
		    var listener = new jsb.EventListenerAssetsManager(manager, function(event) {
		        switch (event.getEventCode())
		        {
		            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
		                cc.log("AssetManager: No local manifest file found, skip assets update.");
		                break;
		            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
		                var percent = event.getPercent();
		                var filePercent = event.getPercentByFile();
		                cc.log("AssetManager: Download percent : " + percent + " | File percent : " + filePercent);
		                break;
		            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
		            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
		                cc.log("AssetManager: Fail to download manifest file, update skipped.");
		                break;
		            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
		            case jsb.EventAssetsManager.UPDATE_FINISHED:
		                cc.log("AssetManager: Update finished.");
		                // You need to release the assets manager while you are sure you don't need it any more
		                manager.release();
		                break;
		            case jsb.EventAssetsManager.UPDATE_FAILED:
		                cc.log("AssetManager: Update failed. " + event.getMessage());
		                // Directly update previously failed assets, we suggest you to count and abort after several retry.
		                manager.downloadFailedAssets();
		                break;
		            case jsb.EventAssetsManager.ERROR_UPDATING:
		                cc.log("AssetManager: Asset update error: " + event.getAssetId() + ", " + event.getMessage());
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

});

AssetManager._instance = null;
AssetManager.getInstance = function() {
	return AssetManager._instance || AssetManager.setupInstance();
}
AssetManager.setupInstance = function() {
	AssetManager._instance = new AssetManager();
	return AssetManager._instance;
}