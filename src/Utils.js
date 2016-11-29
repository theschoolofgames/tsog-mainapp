var Utils = Utils || {};

Utils.delayOneFrame = function(target, callback) {
    target.runAction(cc.sequence(
        cc.delayTime(0),
        cc.callFunc(callback)));
}

Utils.showVersionLabel = function(parent) {
    if (parent && SHOW_VERSION_LABEL) {
        var lb = new cc.LabelBMFont(NativeHelper.callNative("getVersionName") + "(" + NativeHelper.callNative("getBuildNumber") + ")", res.CustomFont_fnt);
        lb.x = cc.winSize.width-lb.width/2 - 10;
        lb.y = lb.height;
        lb.scale = 0.5;
        parent.addChild(lb, 9999);
    }
}

Utils.addLoadingIndicatorLayer = function(block) {
    var currentScene = cc.director.getRunningScene();

    if (currentScene.getChildByTag(TAG_LOADING_INDICATOR_LAYER) != null)
        return;

    var loadingLayer = new LoadingIndicatorLayer(block);
    currentScene.addChild(loadingLayer, 1000);
    return loadingLayer;
}

Utils.removeLoadingIndicatorLayer = function() {
    var currentScene = cc.director.getRunningScene();

    var layer = currentScene.getChildByTag(TAG_LOADING_INDICATOR_LAYER);
    if (layer)
        layer.removeFromParent();    
}
Utils.getScaleFactorTo16And9 = function() {
    var winSize = cc.director.getWinSize();
    return (winSize.height / winSize.width) / (16/9);
}
Utils.loadImg = function(imgUrl, spriteNode, cb) {
    if (!spriteNode) return;

    var oldWidth = spriteNode.getBoundingBox().width;

    if (imgUrl) {
        var self = this;

        if (imgUrl.startsWith('/'))
            imgUrl = BACKEND_ADDRESS + imgUrl.slice(1, imgUrl.length);

        if (imgUrl.startsWith('https'))
            imgUrl = "http" + imgUrl.substring(5);

        var fileName = imgUrl.substring(imgUrl.lastIndexOf('/')+1);

        var frame = cc.spriteFrameCache.getSpriteFrame(fileName);
        if (!frame) {
            Utils.loadSavedTexture(fileName);
            frame = cc.spriteFrameCache.getSpriteFrame(fileName);
        }
        if (frame) {
            if (spriteNode instanceof ccui.Button) {
                spriteNode.loadTextureNormal(fileName, ccui.Widget.PLIST_TEXTURE);
            }
            if (spriteNode instanceof cc.Sprite) {
                spriteNode.setSpriteFrame(frame);
            }

            spriteNode.scale = oldWidth / (spriteNode.getBoundingBox().width / spriteNode.scale);

            return;
        }        

        cc.loader.loadImg(imgUrl, function(target, texture) {

            if (texture instanceof cc.Texture2D) {

                texture.setAntiAliasTexParameters();
                var spriteFrame = new cc.SpriteFrame(texture, cc.rect(0, 0, texture.width, texture.height));
                cc.spriteFrameCache.addSpriteFrame(spriteFrame, fileName);

                if (spriteNode instanceof ccui.Button) {
                    spriteNode.loadTextureNormal(fileName, ccui.Widget.PLIST_TEXTURE);
                }
                if (spriteNode instanceof cc.Sprite) {
                    spriteNode.setSpriteFrame(spriteFrame);
                }

                spriteNode.scale = oldWidth / (spriteNode.getBoundingBox().width / spriteNode.scale);

                Utils.writeTexture(fileName);
            }
        });
    }
}

Utils.writeTexture = function(fileName) {
    jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + 'games/');

    var sprite = new cc.Sprite("#" + fileName);
    sprite.anchorX = sprite.anchorY = 0;

    var renderTexture = new cc.RenderTexture(sprite.width, sprite.height);
    renderTexture.begin();
    sprite.visit();
    renderTexture.end();
    renderTexture.saveToFile("games/" + fileName, 1);
}

Utils.loadSavedTexture = function(fileName) {
    var fullName = jsb.fileUtils.getWritablePath() + 'games/' + fileName;
    if (jsb.fileUtils.isFileExist(fullName)) {
        var sprite = new cc.Sprite(fullName);
        sprite.texture.setAntiAliasTexParameters();
        var spriteFrame = new cc.SpriteFrame(sprite.getTexture(), cc.rect(0, 0, sprite.width, sprite.height));
        cc.spriteFrameCache.addSpriteFrame(spriteFrame, fileName);

        return true;
    }

    return false;
}

Utils.useHDAssets = false;

Utils.getAssetsManagerPath = function() {
    return ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "assetsManager/");
}

Utils.getAccessToken = function() {
    return KVDatabase.getInstance().getString(STRING_USER_ACCESS_TOKEN, "");
}

Utils.getUserId = function() {
    return KVDatabase.getInstance().getString(STRING_USER_ID, "");
}

Utils.getUserName = function() {
    //return KVDatabase.getInstance().getString(STRING_USER_NAME, "");

    // Currently change to student name
    return KVDatabase.getInstance().getString(STRING_STUDENT_NAME, "");
}

Utils.getSchoolName = function() {
    return KVDatabase.getInstance().getString(STRING_SCHOOL_NAME, "");
}

Utils.isLoggedIn = function() {
    return KVDatabase.getInstance().getString(STRING_USER_ACCESS_TOKEN, "") != "";
}

Utils.screenRatioTo43 = function() {
    return (cc.winSize.width / cc.winSize.height) / (4/3);
}

Utils.getLanguage = function() {
    var lang = KVDatabase.getInstance().getString("language", "english");

    if (lang != "english" && lang != "hindi" && lang != spanish)
        return "english";

    return lang;
}

Utils.timeToShowPauseScreen = -1;
Utils.timeToShowPayWall = -1;
Utils.currentScene = null;
Utils.method = null;
Utils.didShowPayWall = false;
Utils.lastPlayedDateTime = -1;
Utils.outOfFreeDay = 0;
Utils.subscribed = 0;
Utils.fullAccess = 0;

Utils.startCallback = function (){
    cc.log("startCallback called");
    cc.director.pause();
};

Utils.resumeCallback = function (){
    cc.log("resumeCallback called");
    if (!Utils.didShowPayWall)
        cc.director.resume();
};

Utils.countdownTimePlayedToShowPauseScreen = function() {
    // cc.log("timeToShowPauseScreen -> " + Utils.timeToShowPauseScreen);
    
    if (Utils.timeToShowPauseScreen === 0) {
        if (Utils.currentScene !== cc.director.getRunningScene())
            return;
        if (Utils.startCallback)
            Utils.startCallback();
        
        cc.director.getRunningScene().addChild(new PauseLayer(function() {
            Utils.resumeCallback();
            Utils.startCountDownTimePlayed("pause");
        }));
    }
    else
        Utils.timeToShowPauseScreen--;
};

Utils.startCountDownTimePlayed = function(method) {
    Utils.currentScene = cc.director.getRunningScene();

    if (method == "pause") {
        if (Utils.timeToShowPauseScreen <= 0)
            Utils.timeToShowPauseScreen = GAME_CONFIG.timeToPauseGame;
        cc.director.getRunningScene().schedule(Utils.countdownTimePlayedToShowPauseScreen, 1, Utils.timeToShowPauseScreen);
    } else if (method == "showPayWall") {
        Utils.outOfFreeDay = KVDatabase.getInstance().getInt("outOfFreeDay", 0);
        Utils.subscribed = KVDatabase.getInstance().getInt("subscribed", 0);
        Utils.fullAccess = KVDatabase.getInstance().getInt(STRING_USER_FULL_ACCESS, 0);
        // console.log("STRING_USER_FULL_ACCESS -> " + (Utils.fullAccess == 0 ? "NO" : "YES"));
        if (TSOG_DEBUG)
            return;
        if (Utils.outOfFreeDay === 0 || Utils.subscribed === 1 || Utils.fullAccess === 1) {
            // console.log("outOfFreeDay -> " + (Utils.outOfFreeDay==0 ? "NO" : "YES"));
            // console.log("subscribed -> " + (Utils.subscribed==0 ? "NO" : "YES"));
            // console.log("Still Free To Play --> RETURN!");
            return;
        }

        // Parse time played 
        var timePlayedInDay = KVDatabase.getInstance().getString("timePlayedInDay", ""); // Format: TimePlayedOnSecond_UTCDay like 0000_0000000
        // console.log("TimePlayedInDay: " + timePlayedInDay);
        
        if (timePlayedInDay){
            var timeSecondPlayedTotal = parseInt(timePlayedInDay.split("_")[0]);
            var lastPlayedDate = new Date(parseInt(timePlayedInDay.split("_")[1]));
            
            if (Utils.daysBetweenNow(lastPlayedDate) >= 0 && timeSecondPlayedTotal < GAME_CONFIG.amountOfMinutesEachDayToPlay * 60){
                Utils.timeToShowPayWall = GAME_CONFIG.amountOfMinutesEachDayToPlay * 60 - timeSecondPlayedTotal;
            }
            else {
                Utils.timeToShowPayWall = 0;
            }
        }
        
        if (Utils.timeToShowPayWall < 0)
            Utils.timeToShowPayWall = GAME_CONFIG.amountOfMinutesEachDayToPlay * 60;

        cc.director.getRunningScene().schedule(Utils.countdownTimePlayedToShowPayWall, 1, Utils.timeToShowPayWall);
    }
};

Utils.countdownTimePlayedToShowPayWall = function() {
    // console.log("timeToShowPayWall -> " + Utils.timeToShowPayWall);
    if (Utils.timeToShowPayWall === 0) {
        if (Utils.currentScene !== cc.director.getRunningScene())
            return;
        if (Utils.startCallback)
            Utils.startCallback();

        cc.director.getRunningScene().addChild(new PayWallDialog(function() {
            Utils.resumeCallback();
            //Utils.startCountDownTimePlayed("showPayWall");
        }));
    }
    else {
        Utils.timeToShowPayWall--;
        var timeSecondPlayedTotal = GAME_CONFIG.amountOfMinutesEachDayToPlay * 60 - Utils.timeToShowPayWall;
        var timePlayedInDayString = timeSecondPlayedTotal.toString().concat("_").concat(Date.now());
        KVDatabase.getInstance().set("timePlayedInDay", timePlayedInDayString);
    }
};

Utils.daysBetweenNow = function(lastDate) {
    var oneDay = 1000 * 60 * 60 * 24;
    var diffDayMs = Date.now() - lastDate.getTime(); // Diff days in milisecond  
    var diffDayMsRound = Math.round(diffDayMs / oneDay);
    return diffDayMsRound;
};

Utils.checkFullAccessPermission = function(userId) {
    RequestsManager.getInstance().getUserInfo(userId, function(succeed, data) {
        Utils.removeLoadingIndicatorLayer();

        if (succeed) {
            if (data.full_access)
                KVDatabase.getInstance().set(STRING_USER_FULL_ACCESS, 1);
            else 
                KVDatabase.getInstance().set(STRING_USER_FULL_ACCESS, 0);

            console.log("User Full Access: " + data.full_access);
        }
    });
};

Utils.logoutStudent = function(){
    KVDatabase.getInstance().remove(STRING_STUDENT_ID);
    KVDatabase.getInstance().remove(STRING_STUDENT_NAME);

    KVDatabase.getInstance().remove("numberItems");
    KVDatabase.getInstance().remove("amountGamePlayed");
    SceneFlowController.getInstance().resetFlow();
    Global.clearCachedState();
};

Utils.logoutUser = function() {
    KVDatabase.getInstance().remove(STRING_USER_ACCESS_TOKEN);
    KVDatabase.getInstance().remove(STRING_USER_ID);
    KVDatabase.getInstance().remove(STRING_USER_NAME);
    KVDatabase.getInstance().remove(STRING_SCHOOL_NAME);
    KVDatabase.getInstance().remove("numberItems");
    KVDatabase.getInstance().remove("amountGamePlayed");
    KVDatabase.getInstance().set(STRING_USER_FULL_ACCESS, 0);
    KVDatabase.getInstance().set("isLoggedIn", 0);
    SceneFlowController.getInstance().resetFlow();
    Global.clearCachedState();
};

Utils.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

Utils.getTTFConfig = function(fontFile, fontSize) {
    var ttfConfig = {
        fontFilePath: fontFile,
        fontSize: fontSize,
        outlineSize: 0,
        glyphs: 2,
        customGlyphs: "",
        distanceFieldEnable: true
    }
    return ttfConfig
}

Utils.getScaleFactorTo16And9 = function() {
    var winSize = cc.director.getWinSize();
    return (winSize.width / winSize.height) / (16/9);
}

Utils.updateStepData = function() {
    var currentLevel = SceneFlowController.getInstance().getCurrentStep();
    var currentSceneIdx = SceneFlowController.getInstance().getCurrentSceneIdx();
    var totalSceneInStep = SceneFlowController.getInstance().getTotalSceneInStep();
    var stepData = {};
    var currentTotalStars;
    var completed;

    var data = KVDatabase.getInstance().getString("stepData", JSON.stringify(stepData));
    if (data != null && data != "" && data != "{}") {
        data = JSON.parse(data);
        stepData = data;
    }

    if (!stepData[currentLevel])
        stepData[currentLevel] = {};
    else if (stepData[currentLevel][currentSceneIdx])
        return;
    if (!stepData[currentLevel]["totalStars"])
        stepData[currentLevel]["totalStars"] = 0;

    currentTotalStars = parseInt(stepData[currentLevel]["totalStars"]);
    completed = ((currentTotalStars+1) >= totalSceneInStep) ? 1 : 0;
    cc.log("totalSceneInStep: " + totalSceneInStep);
    cc.log("currentTotalStars + 1: " + (currentTotalStars + 1));
    stepData[currentLevel][currentSceneIdx] = 1;
    stepData[currentLevel]["completed"] = completed;
    stepData[currentLevel]["totalStars"] = currentTotalStars+1;

    KVDatabase.getInstance().set("stepData", JSON.stringify(stepData));
}

Utils.addBuildVersionText = function(parent) {
    var text = "16.11.01.00";
    var lb = new cc.LabelBMFont("Version: " + text, res.CustomFont_fnt);
    lb.x = cc.winSize.width-lb.width/2 - 10;
    lb.y = cc.winSize.height-lb.height/2 - 10;
    lb.scale = 0.5;
    parent.addChild(lb);
}
Utils.runAnimation = function(node, effectName, effectDelay, effectFrames, loop, timeForNextLoop) {
    var animFrames = [];
    for (var i = 1; i < effectFrames + 1; i++) {
        var str = effectName + "-" + i + ".png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
    };
    var effectAnimation = new cc.Animation(animFrames, effectDelay);
    var actions = [cc.animate(effectAnimation)];
    var effectAction = null;
    if (!loop) {
        effectAction = cc.sequence(actions);
    } else
    {   
        var time = Math.random() * 4 + 2;
        if(timeForNextLoop){
            time = timeForNextLoop
        };
        actions.push(cc.delayTime(time));
        effectAction = cc.repeatForever(cc.sequence(
            actions
        ));
    }
    cc.log("runAction");
    node.runAction(effectAction);
}