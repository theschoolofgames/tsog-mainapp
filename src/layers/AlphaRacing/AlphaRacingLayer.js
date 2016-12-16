var CHIPMUNK_COLLISION_TYPE_STATIC = 1;
var CHIPMUNK_COLLISION_TYPE_DYNAMIC = 2;

var AR_LANDS_ZODER = 1000;
var AR_PLAYER_ZODER = 1002;
var AR_SCALE_NUMBER = 1;

var WALLS_ELASTICITY = 1;
var WALLS_FRICTION = 1;

var CAMERA_FOLLOW_FACTOR = 0.9;
var CAMERA_PLAYER_POSITION_ON_SCREEN = cc.p(1/3, 1/3);

var AlphaRacingLayer = cc.Layer.extend({

    _space: null,

    _layers: [],
    _maps: [],

    _player: null,

    _bgGradient: null,

    _currentMapX: 0,

    _polygonConfigs: null,
    
    ctor: function(inputData,option) {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.AdiDog_Run_plist);
        cc.spriteFrameCache.addSpriteFrames(res.AR_Background_plist);

        this._bgGradient = new cc.LayerColor(cc.color("#ebfcff"));
        this.addChild(this._bgGradient);

        // var camera = cc.Camera.getDefaultCamera();
        // cc.log("camera: " + JSON.stringify(camera.getPosition()));

        // this.resetData();
        this._inputData = inputData;
        this._tempInputData = inputData.slice();

        this._elapsedTime = 0;
        // this.addRefreshButton();

        this._workers = [];
        this._layers = [];
        this._polygonConfigs = [];
        this.gameLayer = new cc.Layer();
        this.addChild(this.gameLayer, 10);

        this.initPhysicWorld();

        this.scheduleUpdate();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this)
        }, this);
    },

    onEnter: function() {
        this._super();

        var camera = cc.Camera.getDefaultCamera();
        camera.y += cc.winSize.height/3;
    },

    update: function(dt) {
        var delta = 1/60;
        var times = dt / delta;
        for (var i = 0; i < times; i++) {
            this._player.update(delta);
            this._space.step(delta);
        }

        this.cameraFollower();
        this._bgGradient.setPosition(cc.pSub(cc.Camera.getDefaultCamera().getPosition(), cc.p(cc.winSize.width/2, cc.winSize.height/2)));

        if (this.isFirstTMXOutOfScreen()) {
            this.removeOutOfScreenMap();
            this.createNewMapSegment();
        }
    },

    onTouchBegan: function(touch, event) {

        this._player.jump();

        return true;
    },

    onTouchMoved: function(touch, event) {

    },

    onTouchEnded: function(touch, event) {

    },

    initPhysicWorld: function() {
        var space = new cp.Space();
        space.gravity = cp.v(0, -500);
        space.iterations = 30;
        space.sleepTimeThreshold = Infinity;
        space.collisionBias = 0;
        this._space = space;

        var phDebugNode = cc.PhysicsDebugNode.create(space);
        this.addChild(phDebugNode, 99999);

        space.addCollisionHandler(CHIPMUNK_COLLISION_TYPE_STATIC, CHIPMUNK_COLLISION_TYPE_DYNAMIC, this.collisionStaticDynamic.bind(this), null, null, null);

        this.createNewMapSegment();
        this.createNewMapSegment();

        this._player = new ARPlayer(this._space);
        this.addChild(this._player, AR_PLAYER_ZODER);
    },

    createNewMapSegment: function() {
        var index = Math.floor(Math.random() * AR_TMX_LEVELS.length);
        var tmxMap = new cc.TMXTiledMap(AR_TMX_LEVELS[index]);
        tmxMap.x = this._currentMapX;
        this.addChild(tmxMap, AR_LANDS_ZODER, 2);

        this._currentMapX += tmxMap.mapWidth * tmxMap.tileWidth;

        var shapes = this.buildPhysicBodyFromTilemap(tmxMap, index);
        tmxMap.setUserData(shapes);

        // cc.log(shapes.length);

        this._maps.push(tmxMap);
    },

    buildPhysicBodyFromTilemap: function(tmxMap, index) {
        var tmxLayer = tmxMap.getLayer("Lands");
        var offset = tmxMap.getPosition();
        
        cc.log("layerWidth: " + tmxLayer.layerWidth);
        cc.log("layerHeight: " + tmxLayer.layerHeight);

        var inspectedTiles = [];
        var polygons = this._polygonConfigs[index];

        if (!polygons) {
            polygons = [];
            for (var i = 0; i < tmxLayer.layerWidth; i++) {
                for (var j = 0; j < tmxLayer.layerHeight; j++) {
                    var gid = tmxLayer.getTileGIDAt(i, j);

                    if (gid) {
                        var arrays = this.getPolygonIncludeTile(tmxLayer, inspectedTiles, i, j);

                        if (arrays[0].length > 0)
                            polygons = polygons.concat(arrays[0]);
                        inspectedTiles = inspectedTiles.concat(arrays[1]); // inspected Polygon
                    }
                }
            }

            this._polygonConfigs[index] = polygons;
        }

        // cc.log(JSON.stringify(polygons));

        var shapes = [];

        for (var i = 0; i < polygons.length; i++) {
            var p = polygons[i].map(p => [p[0] * tmxLayer.tileWidth, (tmxLayer.layerHeight - p[1]) * tmxLayer.tileHeight]);
            var flatten = [].concat.apply([], p);

            var body = cp.StaticBody();
            body.setPos(offset);

            var shape = new cp.PolyShape(body, flatten, cc.p());
            shape.setElasticity(WALLS_ELASTICITY);
            shape.setFriction(WALLS_FRICTION);
            shape.setCollisionType(CHIPMUNK_COLLISION_TYPE_STATIC);
            this._space.addStaticShape(shape);

            shapes.push(shape);
        }

        return shapes;
    },

    getPolygonIncludeTile: function(layer, inspectedTiles, x, y) {
        var borderTiles = [];

        var tile = {x: x, y: y, index: 0}
        var polygonTiles = [ ];

        var queue = [];
        queue.push(tile);

        while (queue.length > 0) {
            tile = queue.shift();

            if (polygonTiles.indexOfPoint(tile) >= 0 || inspectedTiles.indexOfPoint(tile) >= 0)
                continue;

            polygonTiles.push(tile);

            var neighbourTiles = [
                {x: tile.x+1,   y: tile.y,      index: tile.index+1},
                {x: tile.x-1,   y: tile.y,      index: tile.index+1},
                {x: tile.x,     y: tile.y+1,    index: tile.index+1},
                {x: tile.x,     y: tile.y-1,    index: tile.index+1}
            ];

            for (var i = 0; i < neighbourTiles.length; i++) {
                var otherTile = neighbourTiles[i];
                if (otherTile.x >= layer.layerWidth || otherTile.y >= layer.layerHeight || otherTile.x < 0 || otherTile.x < 0) {
                    if (borderTiles.indexOfPoint(tile) < 0)
                        borderTiles.push(tile);
                    continue;
                }

                if (layer.getTileGIDAt(otherTile)) {
                    queue.push(otherTile);
                } else {
                    if (borderTiles.indexOfPoint(tile) < 0)
                        borderTiles.push(tile);
                }
            }
        }

        var convexHulls = [];

        if (polygonTiles.length > 0) {
            var allPoints = polygonTiles.map(t => [[t.x, t.y], [t.x+1, t.y], [t.x, t.y+1], [t.x+1, t.y+1]]);
            var flattenPoints = [].concat.apply([], allPoints);
            var concaveHull = hull(flattenPoints, 1);
            convexHulls = decomp.quickDecomp(concaveHull);
        }

        return [convexHulls, polygonTiles];
    },

    collisionStaticDynamic: function(arbiter, space) {
        for (i = 0; i < arbiter.getBodies().length; i++) {
            var body = arbiter.getBodies()[i];
            if (body != this._player.getBody() && body.getPos().y < this._player.getBody().getPos().y) {
                this._player.run();
                return true;
            }
        }
        return false;
    },

    cameraFollower: function() {
        var camera = cc.Camera.getDefaultCamera();
        var playerPos = cc.pAdd(this._player.getPosition(), cc.p((1/2 - CAMERA_PLAYER_POSITION_ON_SCREEN.x) * cc.winSize.width, (1/2 - CAMERA_PLAYER_POSITION_ON_SCREEN.y) * cc.winSize.height ));
        var desiredPos = cc.pLerp(camera.getPosition(), playerPos, CAMERA_FOLLOW_FACTOR);
        camera.setPosition(desiredPos);
    },

    isFirstTMXOutOfScreen: function() {
        var camera = cc.Camera.getDefaultCamera();

        var firstTMX = this._maps[0];
        return firstTMX.x + firstTMX.mapWidth * firstTMX.tileWidth < camera.x - cc.winSize.width/2;
    },

    removeOutOfScreenMap: function() {
        var firstTMX = this._maps.shift();

        var shapes = firstTMX.getUserData();
        for (var i = 0; i < shapes.length; i++) {
            this._space.removeShape(shapes[i]);
        }

        firstTMX.removeFromParent();
    }
});

var AlphaRacingScene = cc.Scene.extend({
    ctor: function(inputData, option) {
        this._super();
        this.name = "alpha-racing";
        var layer = new AlphaRacingLayer(inputData,option);
        this.addChild(layer);
    }
});