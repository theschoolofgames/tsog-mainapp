var RENDER_TEXTURE_WIDTH = 320;
var RENDER_TEXTURE_HEIGHT = 320;

var WritingTestLayer = cc.LayerColor.extend({

    _currentCharConfig: null,
    _baseRender: null,
    _tmpRender: null,
    _charPoints: [],

    ctor: function() {
        this._super(cc.color(128, 128, 128, 255));
        
        this._currentCharConfig = WritingTestLayer.CHAR_CONFIG["W"];

        this._baseRender = new cc.RenderTexture(RENDER_TEXTURE_WIDTH, RENDER_TEXTURE_HEIGHT);
        // this._baseRender.retain();
        this._baseRender.x = cc.winSize.width/2;
        this._baseRender.y = cc.winSize.height/2;
        this.addChild(this._baseRender, 3);

        this._tmpRender = new cc.RenderTexture(RENDER_TEXTURE_WIDTH, RENDER_TEXTURE_HEIGHT);
        this._tmpRender.setPosition(this._baseRender.getPosition());
        this.addChild(this._tmpRender, 2);        

        var character = new cc.Sprite("#W.png");
        character.x = this._baseRender.width/2 + this._baseRender.x;
        character.y = this._baseRender.height/2 + this._baseRender.y;
        this.addChild(character, 1);

        // this._renderTexture.begin();
        // for (var i = 0; i < this._charPoints.length-1; i++) {
        //     var distance = cc.pDistance(this._charPoints[i], this._charPoints[i+1]);
        //     var dif = cc.pSub(this._charPoints[i+1], this._charPoints[i]);

        //     cc.log(JSON.stringify(dif) + " " + distance);
        //     for (var j = 0; j < distance; j++) {
        //         var delta = j / distance;

        //         var brush = new cc.Sprite("brush.png");
        //         brush.color = cc.color.GREEN;
        //         brush.setPosition(this._charPoints[i].x + (dif.x * delta), this._charPoints[i].y + (dif.y * delta));
        //         // this.addChild(brush);
        //         brush.visit();
        //     }
        // }
        // this._renderTexture.end();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
    },

    onTouchBegan: function(touch, event) {
        return true;
    },

    onTouchMoved: function(touch, event) {
        var touchedPos = touch.getLocation();
        var prevPos = touch.getPreviousLocation();

        var renderPos = this.convertToRTSpace(touchedPos);
        var prevRenderPos = this.convertToRTSpace(prevPos);

        var distance = cc.pDistance(renderPos, prevRenderPos);
        var dif = cc.pSub(renderPos, prevRenderPos);

        this._tmpRender.begin();
        for (var i = 0; i < distance; i++) {
            var delta = i / distance;

            var brush = new cc.Sprite("brush.png");
            brush.color = cc.color.GREEN;
            brush.setPosition(renderPos.x + (dif.x * delta), renderPos.y + (dif.y * delta));
            brush.visit();
        }
        this._tmpRender.end();
        // cc.director.pause();
        // cc.director.drawScene();
        // cc.director.resume();
    },

    onTouchEnded: function(touch, event) {
        var self = this;
        
        var sprite = new cc.Sprite(this._tmpRender.getSprite().getTexture());
        sprite.flippedY = true;
        sprite.setPosition(RENDER_TEXTURE_WIDTH/2, RENDER_TEXTURE_HEIGHT/2);

        var image = this._tmpRender.newImage();

        this._currentCharConfig.paths.forEach(function(path) {
            path.forEach(function(point) {
                cc.log(self.isSpriteTransparentInPoint(image, point));
            });
        });


        this._baseRender.begin();
        sprite.visit();
        this._baseRender.end();

        this._tmpRender.clear(0,0,0,0);
    },   

    convertToRTSpace: function(p) {
        return cc.pSub(p, cc.pSub(this._tmpRender.getPosition(), cc.p(RENDER_TEXTURE_WIDTH/2, RENDER_TEXTURE_HEIGHT/2)));
    },

    isSpriteTransparentInPoint: function(image, point) {
        return h102.Utils.isPixelTransparent(image, point.x, point.y);
    }
});

WritingTestLayer.CHAR_CONFIG = null;

var WritingTestScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        if (WritingTestLayer.CHAR_CONFIG == null) {
            WritingTestLayer.CHAR_CONFIG = {};

            var csf = cc.director.getContentScaleFactor();
            var tiledMap = new cc.TMXTiledMap();
            tiledMap.initWithTMXFile(res.ABC_TMX);

            var mapSize = tiledMap.getMapSize();
            var tileSize = tiledMap.getTileSize();

            tiledMap.getObjectGroups().forEach(function(group) {
                var config = {
                    paths: [],
                    includedPoints: []
                };

                group.getObjects().forEach(function(obj) {
                    if (obj.name.startsWith("Path")) {
                        var pathIdx = parseInt(obj.name.substring(4));
                        config.paths[pathIdx-1] = [];

                        var offsetX = obj.x * csf;
                        var offsetY = (mapSize.height * tileSize.height - obj.y) * csf;

                        for (var i = 0; i < obj.polylinePoints.length; i++) {
                            var x = obj.polylinePoints[i].x * csf + offsetX;
                            var y = mapSize.height * tileSize.height - (obj.polylinePoints[i].y * csf + offsetY);

                            config.paths[pathIdx-1].push(cc.p(x, y));
                        }
                    }
                });

                WritingTestLayer.CHAR_CONFIG[group.getGroupName()] = config;
            });
            
            // var wChar = tiledMap.getObjectGroup("W");
            // var wPath = wChar.getObject("Path");
            
            // var offsetX = wPath.x * csf;
            // var offsetY = (mapSize.height * tileSize.height - wPath.y) * csf;

            // for (var i = 0; i < wPath.polylinePoints.length; i++) {
            //     var x = wPath.polylinePoints[i].x * csf + offsetX;
            //     var y = mapSize.height * tileSize.height - (wPath.polylinePoints[i].y * csf + offsetY);

            //     this._charPoints.push(cc.p(x, y));
            // }
        }

        var layer = new WritingTestLayer();
        this.addChild(layer);
    },
});