var GameListener = cc.Class.extend({

    getCurrentLayer: function() {
        return cc.director.getRunningScene().getChildByTag(1);
    },

    pauseGame: function() {
        var currentLayer = this.getCurrentLayer();
        this.pauseGameElements(currentLayer);
        AudioListener.getInstance().pauseListening();
        NativeHelper.callNative("stopBackgroundSoundDetecting");

        var self = this;
        cc.director.getRunningScene().addChild(new PauseLayer(function() {
            self.resumeGameElements(currentLayer);
            NativeHelper.callNative("startRestClock", [GAME_CONFIG.timeToPauseGame]);
            AudioListener.getInstance().resumeListening();
            NativeHelper.callNative("startBackgroundSoundDetecting");
        }));
    },

    pauseGameElements: function(parent) {
        parent.pause();
        var children = parent.getChildren();
        for (var i = 0; i < children.length; i++) {
            var childrenChild = children[i].length;
            if (children[i].getChildren().length > 0)
                this.pauseGameElements(children[i]);
            else
                children[i].pause();
        }
    },

    resumeGameElements: function(parent) {
        parent.resume();
        var children = parent.getChildren();
        for (var i = 0; i < children.length; i++) {
            var childrenChild = children[i].length;
            if (children[i].getChildren().length > 0)
                this.resumeGameElements(children[i]);
            else
                children[i].resume();
        }
    }
});

GameListener._instance = null;

GameListener.getInstance = function () {
  return GameListener._instance || GameListener.setupInstance();
};

GameListener.setupInstance = function () {
    GameListener._instance = new GameListener();
    return GameListener._instance;
}