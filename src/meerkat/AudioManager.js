var SOUND_FOLDER_NAMES = [
    "alphabets",
    "colors",
    "numbers",
    "shapes/plural", 
    "shapes/singular",
    "sentences",
    "words"
];
var AudioManager = cc.Class.extend({

    ctor: function () {
        cc.assert(AudioManager._instance == null, "can be instantiated once only");

    },

    getFullPathForFileName: function(soundFileName) {
        // get full path for input file name - input format 'currentLanguage' + name + '.mp3'
        var sName = "";
        var searchPath = "res/sounds/";
        for (var i = 0; i < SOUND_FOLDER_NAMES.length; i++) {
            var fName = SOUND_FOLDER_NAMES[i];
            sName = searchPath + fName + "/" + soundFileName;
            if (jsb.fileUtils.isFileExist(sName))
                return sName;
        }
        return sName;
    },

    preload: function(path, callback) {
        if (path == "" || cc.isUndefined(path))
            return;
        if (callback && cc.isFunction(callback))
            jsb.AudioEngine.preload(path, callback);
        else
            jsb.AudioEngine.preload(path, null);
        cc.log("preload sound path: %s", path);
    },

    play: function(path, loop, callback) {
        var audio = jsb.AudioEngine.play2d(path, loop);
        if (cc.isFunction(callback)){
            if (audio > -1)  
                jsb.AudioEngine.setFinishCallback(audio, function(audioId, audioPath) {
                    callback();
                });
            else // no file name match the input path 
            {
                cc.log("callback called immediately");
                callback();
            }
        }
        return audio;
    },

    getSoundDurationById: function(audioId) {
        return jsb.AudioEngine.getDuration(audioId);
    },

    unload: function(path, wantUnloadAll) {
        if (wantUnloadAll)
            jsb.AudioEngine.uncacheAll();
        else
            jsb.AudioEngine.uncache(path);
        cc.log("unload sound path: %s", path);
    },

    playBackGroundMusic: function() {
        jsb.AudioEngine.stopAll();
        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.level_mp3, true);
        }
    },

    stopAll: function() {
        jsb.AudioEngine.stopAll();
    },
});

AudioManager._instance = null;

AudioManager.getInstance = function () {
  return AudioManager._instance || AudioManager.setupInstance();
};

AudioManager.setupInstance = function () {
    AudioManager._instance = new AudioManager();
    return AudioManager._instance;
}