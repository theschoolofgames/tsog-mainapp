var RENDER_TEXTURE_WIDTH = 320;
var RENDER_TEXTURE_HEIGHT = 320;

var WritingTestLayer = cc.LayerColor.extend({

    _adiDog: null,

    _names: null,
    _nameNode: null,

    _currentCharConfig: null,
    _baseRender: null,
    _tmpRender: null,
    _emptyFillCharacter: null,
    _dashedLine: null,

    _nameIdx: -1,
    _charIdx: -1,
    _pathIdx: -1,

    _blockTouch: false,

    _nextSceneName: null,
    _oldSceneName: null,

    _objectsArray: null,

    ctor: function(objectsArray, oldSceneName) {
        this._super(cc.color(128, 128, 128, 255));

        this._objectsArray = objectsArray;
        this._names = objectsArray.map(function(obj) {
            return obj.name.toUpperCase();
        });
        this._oldSceneName = oldSceneName;
        this._nameIdx = this._charIdx = this._pathIdx = 0;

        this._addRenderTextures();
        this._displayNewCharacter();
        this._displayCurrentName();
        this._addAdiDog();

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
    },

    onTouchBegan: function(touch, event) {
        return !this._blockTouch;
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
            // brush.color = cc.color.BLACK;
            brush.setPosition(renderPos.x + (dif.x * delta), renderPos.y + (dif.y * delta));
            brush.visit();
        }
        this._tmpRender.end();
        this._tmpRender.getSprite().color = cc.color.WHITE;;
    },

    onTouchEnded: function(touch, event) {
        var self = this;

        var image = this._tmpRender.newImage(); 

        var pathCfg = this._currentCharConfig.paths[this._pathIdx];
        var matched = true;
        pathCfg.forEach(function(point) {
            matched &= !self.isSpriteTransparentInPoint(image, point);
        });

        // this._blockTouch = true;
        if (matched) {
            this._pathIdx++;

            this._tmpRender.getSprite().runAction(cc.sequence(
                cc.tintTo(0.3, 0, 255, 0),
                cc.callFunc(function() {
                    self._blockTouch = false;

                    var sprite = new cc.Sprite(self._tmpRender.getSprite().getTexture());
                    sprite.flippedY = true;
                    sprite.setPosition(RENDER_TEXTURE_WIDTH/2, RENDER_TEXTURE_HEIGHT/2);

                    self._baseRender.begin();
                    sprite.visit();
                    self._baseRender.end();

                    self._tmpRender.clear(0,0,0,0);

                    self.checkChangingCharacter();
                    self._displayNewDashedLine();
                })
            ));
            this._correctAction();
        } else {
            this._tmpRender.getSprite().runAction(cc.sequence(
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.tintTo(0.15, 255, 0, 0),
                cc.tintTo(0.15, 255, 255, 255),
                cc.callFunc(function() {
                    self._blockTouch = false;
                    self._tmpRender.clear(0,0,0,0);
                })
            ));
            this._incorrectAction();
        }
    },   

    convertToRTSpace: function(p) {
        return cc.pSub(p, cc.pSub(this._tmpRender.getPosition(), cc.p(RENDER_TEXTURE_WIDTH/2, RENDER_TEXTURE_HEIGHT/2)));
    },

    isSpriteTransparentInPoint: function(image, point) {
        return h102.Utils.isPixelTransparent(image, point.x, point.y);
    },

    fetchCharacterConfig: function() {
        this._currentCharConfig = WritingTestLayer.CHAR_CONFIG[this._names[this._nameIdx][this._charIdx]];
    },

    checkChangingCharacter: function() {
        if (this._pathIdx >= this._currentCharConfig.paths.length)
        {
            // next char
            this._nameNode.getLetter(this._charIdx).opacity = 255;
            this._charIdx++;
            this._pathIdx = 0;
            if (this._charIdx >= this._names[this._nameIdx].length) {
                this._charIdx = 0;
                this._nameIdx++;
                if (this._nameIdx >= this._names.length) {
                    var self = this;
                    this.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(function() {
                        self._nextScene();
                    })));
                    return;
                }
                this._displayCurrentName();
            }
            
            this._displayNewCharacter();
            this._baseRender.clear(0,0,0,0);
        }
    },

    _nextScene: function() {
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        var scene;
        if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene")
            scene = new window[nextSceneName](this._objectsArray, this._oldSceneName);
        else
            scene = new window[nextSceneName]();
        cc.director.runScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    },

    _displayNewCharacter: function() {
        if (this._emptyFillCharacter)
            this._emptyFillCharacter.removeFromParent();

        this._emptyFillCharacter = new cc.Sprite("#" + this._names[this._nameIdx].toUpperCase()[this._charIdx] + ".png");
        this._emptyFillCharacter.x = this._baseRender.width/2 + this._baseRender.x;
        this._emptyFillCharacter.y = this._baseRender.height/2 + this._baseRender.y;
        this.addChild(this._emptyFillCharacter, 1);

        this.fetchCharacterConfig();
        this._displayNewDashedLine();
    },

    _displayNewDashedLine: function() {
        if (this._dashedLine) {
            this._dashedLine.removeFromParent();
            this._dashedLine = null;
        }

        var dashCfg = this._currentCharConfig.dashedLines[this._pathIdx];
        if (!dashCfg)
            return;

        this._dashedLine = new cc.Sprite("#" + dashCfg.sprite);
        this._dashedLine.x = dashCfg.x + this._emptyFillCharacter.x - this._emptyFillCharacter.width/2;
        this._dashedLine.y = dashCfg.y + this._emptyFillCharacter.y - this._emptyFillCharacter.height/2;
        this._dashedLine.scaleX = dashCfg.w / this._dashedLine.width;
        this._dashedLine.scaleY = dashCfg.h / this._dashedLine.height;
        this._dashedLine.rotation = dashCfg.rotation;
        this._dashedLine.anchorX = this._dashedLine.anchorY = 0;
        this.addChild(this._dashedLine, 1);
    },

    _displayCurrentName: function() {
        if (this._nameNode)
            this._nameNode.removeFromParent();

        this._nameNode = new cc.LabelBMFont(this._names[this._nameIdx], "hud-font.fnt");
        this._nameNode.x = cc.winSize.width/4;
        this._nameNode.y = cc.winSize.height - 50;
        this.addChild(this._nameNode);

        for (var i = 0; i < this._names[this._nameIdx].length; i++)
            this._nameNode.getLetter(i).opacity = 128;
    },

    _addAdiDog: function() {
        this._adiDog = new AdiDogNode();
        // this._adiDog.scale = 1.5;
        this._adiDog.setPosition(cc.p(cc.winSize.width / 4, cc.winSize.height / 6));
        this.addChild(this._adiDog);
    },

    _addRenderTextures: function() {
        this._baseRender = new cc.RenderTexture(RENDER_TEXTURE_WIDTH, RENDER_TEXTURE_HEIGHT);
        // this._baseRender.retain();
        this._baseRender.x = cc.winSize.width/8 * 5;
        this._baseRender.y = cc.winSize.height/2;
        this._baseRender.getSprite().color = cc.color.GREEN;
        this._baseRender.getSprite().opacity = 128;
        this.addChild(this._baseRender, 2);

        this._tmpRender = new cc.RenderTexture(RENDER_TEXTURE_WIDTH, RENDER_TEXTURE_HEIGHT);
        this._tmpRender.setPosition(this._baseRender.getPosition());
        this._tmpRender.getSprite().opacity = 128;
        this.addChild(this._tmpRender, 3);        
    },

    _correctAction: function() {
        var self = this;
        jsb.AudioEngine.play2d(res.Succeed_sfx);
        this.runAction(cc.sequence(
            cc.callFunc(function() {
                self._adiDog.adiJump();
            }),
            cc.delayTime(1),
            cc.callFunc(function() {
                self._adiDog.adiHifi();
            }),
            cc.delayTime(2),
            cc.callFunc(function() {
                self._adiDog.adiIdling();
            })
        ));
    },

    _incorrectAction: function() {
        var self = this;
        jsb.AudioEngine.play2d(res.Failed_sfx);
        this._adiDog.adiShakeHead();
        this.runAction(
            cc.sequence(
                cc.delayTime(4),
                cc.callFunc(function() {
                    self._adiDog.adiIdling();
                })        
            )
        );
    }
});

WritingTestLayer.CHAR_CONFIG = null;

var WritingTestScene = cc.Scene.extend({
    ctor: function(objectsArray, nextSceneName, oldSceneName){
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
                    dashedLines: [],
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

                    if (obj.name.startsWith("Dash")) {
                        var dashIdx = parseInt(obj.name.substring(4));

                        var dashCfg = {};

                        dashCfg.x = obj.x * csf;
                        dashCfg.y = (obj.y + obj.height) * csf; 
                        dashCfg.w = obj.width;
                        dashCfg.h = obj.height;
                        dashCfg.sprite = obj.sprite;
                        dashCfg.rotation = obj.rotation || 0;

                        config.dashedLines[dashIdx-1] = dashCfg;
                    }
                });

                WritingTestLayer.CHAR_CONFIG[group.getGroupName()] = config;
            });
        }

        var layer = new WritingTestLayer(objectsArray, nextSceneName, oldSceneName);
        this.addChild(layer);
    }
});