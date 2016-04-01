var Utils = Utils || {};

Utils.delayOneFrame = function(target, callback) {
    target.runAction(cc.sequence(
        cc.delayTime(0),
        cc.callFunc(callback)));
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

Utils.getUserId = function() {
    return KVDatabase.getInstance().getString(STRING_USER_ID, "");
}

Utils.getUserName = function() {
    return KVDatabase.getInstance().getString(STRING_USER_NAME, "");
}

Utils.getSchoolName = function() {
    return KVDatabase.getInstance().getString(STRING_SCHOOL_NAME, "");
}

Utils.screenRatioTo43 = function() {
    return (cc.winSize.width / cc.winSize.height) / (4/3);
}

Utils.getLanguage = function() {
    var lang = KVDatabase.getInstance().getString("language", "english");

    if (lang != "english" && language != "hindi" && lang != spanish)
        return "english";

    return lang;
}


