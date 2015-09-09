var Utils = Utils || {};

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

Utils.loadImg = function(imgUrl, spriteNode) {
    if (!spriteNode) return;

    var oldWidth = spriteNode.getBoundingBox().width;

    if (imgUrl) {
        var self = this;

        if (imgUrl.startsWith('/'))
            imgUrl = BACKEND_ADDRESS + imgUrl.slice(1, imgUrl.length);

        if (imgUrl.startsWith('https'))
            imgUrl = "http" + imgUrl.substring(5);

        var frame = cc.spriteFrameCache.getSpriteFrame(imgUrl);
        if (frame) {
            if (spriteNode instanceof ccui.Button)
                spriteNode.loadTextureNormal(imgUrl, ccui.Widget.PLIST_TEXTURE);
            if (spriteNode instanceof cc.Sprite)
                spriteNode.setSpriteFrame(frame);

            spriteNode.scale = oldWidth / (spriteNode.getBoundingBox().width / spriteNode.scale);

            return;
        }        

        cc.loader.loadImg(imgUrl, function(target, texture) {

            if (texture instanceof cc.Texture2D) {
                // cc.log(texture.pixelsWidth + " " + texture.pixelsHeight);
                // self._avatarTexture[fbid] = texture;

                var spriteFrame = new cc.SpriteFrame(texture, cc.rect(0, 0, texture.width, texture.height));
                cc.spriteFrameCache.addSpriteFrame(spriteFrame, imgUrl);

                if (spriteNode instanceof ccui.Button)
                    spriteNode.loadTextureNormal(imgUrl, ccui.Widget.PLIST_TEXTURE);
                if (spriteNode instanceof cc.Sprite)
                    spriteNode.setSpriteFrame(spriteFrame);

                spriteNode.scale = oldWidth / (spriteNode.getBoundingBox().width / spriteNode.scale);
            }
        });
    }
}