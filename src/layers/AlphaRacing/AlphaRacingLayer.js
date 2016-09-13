var AR_TAG_TILE_MAP = 1;
var AR_SCALE_NUMBER = 1;
var TEST_SPEED = 2;

var AlphaRacingLayer = cc.Layer.extend({
	
    _tmxMap: null,
    _player: null,
    _tileSize: cc.size(0,0),
    _landLayer: null,
    _playerBorder: null,
    _tileBorder: null,

	ctor: function() {
        this._super();

        this._init();
    },

    _init: function() {

        this._tmxMap = new cc.TMXTiledMap(res.AR_Level_01_TMX);
        this._tmxMap.setScale(AR_SCALE_NUMBER);

        this._tileSize = cc.size(this._tmxMap.getTileSize().width * AR_SCALE_NUMBER, this._tmxMap.getTileSize().height * AR_SCALE_NUMBER);
        this.addChild(this._tmxMap, 0, AR_TAG_TILE_MAP);

        this._landLayer = this._tmxMap.getLayer("Lands");

        this._player = new ARPlayer(res.Duck_png);
        this._player.setPosition(cc.p(200,400));
        this._player.setDesiredPosition(cc.p(200,400));
        this._player.setLocalZOrder(1000);
        // this._player.setTextureRect(cc.rect(0,0, this._tileSize.width, this._tileSize.height));
        this._tmxMap.addChild(this._player);

        // var followAction = cc.Follow.create(this._player,cc.rect(100,100,1000,1000));
        // this._player.runAction(followAction);

        this._playerBorder = cc.DrawNode.create();
        this._playerBorder.retain();
        this._tmxMap.addChild(this._playerBorder, 1000+1);

        this._tileBorder = cc.DrawNode.create();
        this._tileBorder.retain();
        this.addChild(this._tileBorder);

        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
                onTouchMoved: this.onTouchMoved.bind(this),
                onTouchEnded: this.onTouchEnded.bind(this)
        }, this);

        this.scheduleUpdate();
    },

    update: function(dt) {
        this._player.updatea(dt / TEST_SPEED);
        this.checkForAndResolveCollisions(this._player);

        this.setViewpointCenter(this._player.getPosition());
        // this.movePlatforms(dt);
    },

    movePlatforms: function(dt) {
        let velocityStep = cc.pMult(cc.p(-400, 0), dt);

        let position = cc.p(this._tmxMap.getPosition().x, this._tmxMap.getPosition().y);
        this._tmxMap.setPosition(cc.pAdd(position, velocityStep));
    },

    onTouchBegan: function(touch, event) {
        var touchedPos = touch.getLocation();
        
        if (touchedPos.x > 240){
            this._player.setMightJump(true);
        }
        else {
            this._player.setForwardMarch(true);
        }

        return true;
    },

    onTouchMoved: function(touch, event) {
        
    },

    onTouchEnded: function (touch, event) {
        var touchedPos = touch.getLocation();
        
        if (touchedPos.x > 240){
            this._player.setMightJump(false);
        }
        else {
            this._player.setForwardMarch(false);
        }
    },

    tileCoordForPosition: function(position) {
        let x = Math.floor(position.x / this._tileSize.width);
        let levelHeightInPixels = this._tmxMap.getMapSize().height * this._tileSize.height;
        let y = Math.floor((levelHeightInPixels - position.y) / this._tileSize.height);
        return cc.p(x, y);
    },

    tileRectFromTileCoords: function(tileCoords) {
        let levelHeightInPixels = this._tmxMap.getMapSize().height * this._tileSize.height;
        let origin = cc.p(tileCoords.x * this._tileSize.width, levelHeightInPixels - ((tileCoords.y + 1) * this._tileSize.height));
        return cc.rect(origin.x, origin.y, this._tileSize.width, this._tileSize.height);
    },

    getSurroundingTilesAtPosition: function(position, layer) {
        let plPos = this.tileCoordForPosition(position);
        cc.log("position: %d, %d -> plPos: %d, %d", position.x, position.y, plPos.x, plPos.y);
    
        let gids = [];

        for (var j = 0; j < 9; j++) {
            let i = j;
            if (j == 4) {
                continue;
            } else if (j > 4) {
                i = j - 1;
            }

            let index = i;
            if (i == 0) {
                index = 6;
            } else if (i == 2) {
                index = 3
            } else if (i == 3) {
                index = 4
            } else if (i == 4) {
                index = 0
            } else if (i == 5) {
                index = 2
            } else if (i == 6) {
                index = 5
            } else if (i == 7) {
                index = 7
            } 

            let indexToCalculateRC = index
            if (index >= 4) {
                indexToCalculateRC = index + 1;
            }
            let c = indexToCalculateRC % 3;
            let r = Math.floor(indexToCalculateRC / 3);
            let tilePos = cc.p(plPos.x + (c - 1), plPos.y + (r - 1));
            let tgid = layer.getTileGIDAt(tilePos);
            
            let tileRect = this.tileRectFromTileCoords(tilePos);
            
            let tileDict = {gid: tgid, x: tileRect.x, y: tileRect.y, tilePos: tilePos, c: c, r: r};


            // cc.log("i = %d -> x = %d, y = %d, index = %d", i, c, r, index);

            // gids[index] = tileDict;
            gids.push(tileDict);
        }

        // for (var i = 0; i < gids.length; i++) {
        //     cc.log("%d: %d, %d", gids[i].i + 1, gids[i].c, gids[i].r);
        // }

        return gids;
    },

    drawRectWithLabel: function(from, to, fillColor, lineSize, lineColor, label) {
        this._playerBorder.drawRect(from, to, fillColor, lineSize, lineColor);

        var lbl = new cc.LabelBMFont(label+"", "hud-font.fnt");
        lbl.color = cc.color("#ffd902");
        lbl.x = (to.x - from.x)/2 + from.x;
        lbl.y = (to.y - from.y)/2 + from.y;

        this._playerBorder.addChild(lbl);
    },

    drawRectPlatforms: function() {
        this._tileBorder.clear();

        var ls = this._landLayer.getLayerSize();
        var offsetPos = this._tmxMap.getPosition();
        for (var y = 0; y < ls.height; y++) {
            for (var x = 0; x < ls.width; x++) {
                let tile = this._landLayer.getTileAt(cc.p(x, y));
                if (tile){
                    let tileRect = cc.rect(tile.x + offsetPos.x, tile.y + offsetPos.y, this._tileSize.width, this._tileSize.height);
                    this._tileBorder.drawRect(tileRect, cc.p(tileRect.x + tileRect.width 
                        ,tileRect.y + tileRect.height), cc.color(255,0,100,0), 3, cc.color(33, 33, 33, 100));
                }
            }
        }
    },

    /*
    *  Surround tiles like that 
    *       0 1 2
    *       3 4 5
    *       6 7 8
    *  Check colision of object with 8 tiles
    */
    checkForAndResolveCollisions: function(p) {
    
        // this.addChild(rectangle);
        // this._tileBorder.clear();
        this._playerBorder.clear();
        this._playerBorder.removeAllChildren();

        this.drawRectPlatforms();
        
        var tiles = this.getSurroundingTilesAtPosition(p.getPosition(), this._landLayer);
        p.setOnGround(false);

        for (var i = 0; i < tiles.length; i++) {

            var dic = tiles[i];
            let _tileRect = cc.rect(dic.x, dic.y, this._tileSize.width, this._tileSize.height); 
            
            // cc.log("Gid Json => %s", JSON.stringify(dic));
            let pRect = p.getCollisionBoundingBox();
            // cc.log("Player Rect => (%d, %d, %d, %d)", pRect.x, pRect.y, pRect.width, pRect.height);
            var gid = dic.gid;
            if (gid) {
                let tileRect = cc.rect(dic.x, dic.y, this._tileSize.width, this._tileSize.height); 
                
                if (cc.rectIntersectsRect(pRect, tileRect)) {
                    this.drawRectWithLabel(cc.p(dic.x, dic.y),
                        cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                        cc.color(255,0,100,0), 3, cc.color(255, 0, 0,255),
                        i+1);

                    let intersection = cc.rectIntersection(pRect, tileRect);

                    let desiredPosition = p.getDesiredPosition();
                    let velocity = p.getVelocity();
                    
                    if (i == 0) {
                        cc.log("tile is directly below player. i = %d", i);
                        p.setDesiredPosition( cc.p(desiredPosition.x, desiredPosition.y + intersection.height));
                        p.setVelocity(cc.p(velocity.x, 0.0));
                        p.setOnGround(true);
                    } else if (i == 1) {
                        //tile is directly above player
                        p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y - intersection.height));
                        p.setVelocity(cc.p(velocity.x, 0.0));
                    } else if (i == 2) {
                        cc.log("tile is left of player. i = %d", i);
                        p.setDesiredPosition(cc.p(desiredPosition.x + intersection.width, desiredPosition.y));
                    } else if (i == 3) {
                        cc.log("tile is right of player. i = %d", i);
                        p.setDesiredPosition(cc.p(desiredPosition.x - intersection.width, desiredPosition.y));
                        p.setVelocity(cc.p(0.0, 0.0));
                    } else {
                        if (intersection.width > intersection.height) {
                            cc.log("tile is diagonal, but resolving collision vertially. i = %d", i);
                            p.setVelocity(cc.p(velocity.x, 0.0)); 
                            let resolutionHeight;
                            if (i > 5) {
                                resolutionHeight = intersection.height;
                                p.setOnGround(true);
                            } else {
                                resolutionHeight = -intersection.height;
                            }
                            p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y + resolutionHeight ));
                            
                        } else {
                            cc.log("ahihi");
                            let resolutionWidth;
                            if (i == 6 || i == 4) {
                                resolutionWidth = intersection.width;
                            } else {
                                resolutionWidth = -intersection.width;
                            }
                            p.setDesiredPosition(cc.p(desiredPosition.x , desiredPosition.y + resolutionWidth));
                        } 
                    } 

                    cc.log("yo, onground: ", p.onGround());

                    // break;
                }
                else {
                    this.drawRectWithLabel(cc.p(dic.x, dic.y),
                        cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                        cc.color(255,0,100,0), 3, cc.color(0, 0, 255,255),
                        i+1);
                }
            }
            else {
                this.drawRectWithLabel(cc.p(dic.x, dic.y),
                    cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                    cc.color(255,0,100,0), 3, cc.color(33, 33, 33,255),
                    i+1);
            }
        }
        // cc.log("ARLayer desiredPosition => (%d, %d)", p.getDesiredPosition().x, p.getDesiredPosition().y);
        p.setPosition(p.getDesiredPosition());
    },

    setViewpointCenter: function(position) {
        let winSize = cc.winSize;

        let x = Math.max(position.x, winSize.width / 2);
        let y = Math.max(position.y, winSize.height / 2);
        x = Math.min(x, (this._tmxMap.getMapSize().width * this._tileSize.width) 
                - winSize.width / 2);
        y = Math.min(y, (this._tmxMap.getMapSize().height * this._tileSize.height) 
                - winSize.height/2);
        let actualPosition = cc.p(x, y);
        
        let centerOfView = cc.p(winSize.width/2, winSize.height/2);
        let viewPoint = cc.pSub(centerOfView, actualPosition);
        this._tmxMap.setPosition(viewPoint); 
    },

});

var AlphaRacingScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        this.name = "alpha-racing";
        var layer = new AlphaRacingLayer();
        this.addChild(layer);
    }
});