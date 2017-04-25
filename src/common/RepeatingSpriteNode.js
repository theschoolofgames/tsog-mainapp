var RepeatingSpriteNode = {};

RepeatingSpriteNode.create = function(spriteName, width, height) {
    var rNode = new cc.Node();
    var sampleSprite = new cc.Sprite(spriteName);
    var spriteW = sampleSprite.width;
    var spriteH = sampleSprite.height;
    width = width || spriteW;
    height = height || spriteH;
    var horizontalSpritesNumber = Math.ceil(width / spriteW);
    var verticalSpritesNumber = Math.ceil(height / spriteH);

    for (var i = 0; i < horizontalSpritesNumber; i++) {
        for (var j = 0; j < verticalSpritesNumber; j++) {
            var sprite = new cc.Sprite(spriteName);
            sprite.setAnchorPoint(0, 1);
            sprite.x = i * spriteW;
            sprite.y = -(j * spriteH);
            rNode.addChild(sprite);
        }
    }

    return rNode;
}