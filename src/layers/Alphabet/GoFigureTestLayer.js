var GoFigureTestLayer = WritingTestLayer.extend({

    ctor: function(objectsArray, oldSceneName) {
        cc.log("GoFigureTestLayer ctor");
        this._super(objectsArray, oldSceneName);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this._playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    fetchCharacterConfig: function() {
        this._currentChar = this._writingWords[this._nameIdx][this._charIdx];
        this._currentCharConfig = GoFigureTestLayer.CHAR_CONFIG[this._currentChar];
    },
});

GoFigureTestLayer.CHAR_CONFIG = null;

var GoFigureTestScene = cc.Scene.extend({
    ctor: function(objectsArray, oldSceneName){
        this._super();

        if (GoFigureTestLayer.CHAR_CONFIG == null) {
            GoFigureTestLayer.CHAR_CONFIG = {};

            var csf = cc.director.getContentScaleFactor();
            var tiledMap = new cc.TMXTiledMap();
            tiledMap.initWithTMXFile(res.Figure_TMX);

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
                        var offsetY = mapSize.height * tileSize.height - obj.y * csf;

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

                GoFigureTestLayer.CHAR_CONFIG[group.getGroupName()] = config;
            });
        }

        var layer = new GoFigureTestLayer(objectsArray, oldSceneName);
        this.addChild(layer);

    }
});