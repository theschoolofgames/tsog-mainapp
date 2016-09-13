var AR_TAG_TILE_MAP = 1;
var AR_SCALE_NUMBER = 1;
var TEST_SPEED = 1;
var ENABLE_DEBUG_DRAW = false;
var AR_ADI_ZODER = 1002;
var AR_LANDS_ZODER = 1000;
var AR_WORD_ZODER = 1001;

var AlphaRacingLayer = cc.Layer.extend({
	
    _tmxMap: null,
    _player: null,
    _tileSize: cc.size(0,0),
    _landLayer: null,
    _playerBorder: null,
    _tileBorder: null,
    _alphabetPosArray: [],
    _alphabetObjectArray: [],
    _inputData: [
        {
          "type": "A",
          "value": "20"
        },
        {
          "type": "a",
          "value": "20"
        }
    ],    

	ctor: function() {
        this._super();

        this._init();
    },

    _init: function() {
        
        this.addHud();
        this.initPlatforms();

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
        this.checkForAlphabetCollisions();

        this.setViewpointCenter(this._player.getPosition());
    },

    initPlatforms: function() {
        this._tmxMap = new cc.TMXTiledMap(res.AR_Level_01_TMX);
        this._tmxMap.setScale(AR_SCALE_NUMBER);

        this._tileSize = cc.size(this._tmxMap.getTileSize().width * AR_SCALE_NUMBER, this._tmxMap.getTileSize().height * AR_SCALE_NUMBER);
        this.addChild(this._tmxMap, 0, 2);

        this._landLayer = this._tmxMap.getLayer("Lands");

        this._player = new ARPlayer();
        this._tmxMap.addChild(this._player, AR_ADI_ZODER);

        this._playerBorder = cc.DrawNode.create();
        this._playerBorder.retain();
        this._tmxMap.addChild(this._playerBorder, AR_ADI_ZODER+1);

        this._tileBorder = cc.DrawNode.create();
        this._tileBorder.retain();
        this.addChild(this._tileBorder);

        this.addAlphabet();
    },

    addHud: function() {
        var hudLayer = new HudLayer(this);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
    },

    _addButtons: function() {
        var self = this;

        // RESTART
        var btnRestart = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        btnRestart.x = btnRestart.width - btnRestart.width;
        btnRestart.y = cc.winSize.height - btnRestart.height*2/3
        btnRestart.setLocalZOrder(1000);
        this.addChild(btnRestart);
        btnRestart.addClickEventListener(function() {
            self.restart();
        });

        var lbRestart = new cc.LabelBMFont("RESTART", "yellow-font-export.fnt");
        lbRestart.scale = 0.6;
        lbRestart.x = btnRestart.width/2;
        lbRestart.y = btnRestart.height/2;
        btnRestart.getRendererNormal().addChild(lbRestart);
    },

    restart: function() {

    },

    completedScene: function() {

    },

    checkForAlphabetCollisions: function(){
        for (var i = 0; i < this._alphabetObjectArray.length; i++) {
            let pRect = this._player.getCollisionBoundingBox();
            let alphaRect = cc.rect(this._alphabetObjectArray[i].x,
                this._alphabetObjectArray[i].y,
                this._alphabetObjectArray[i].getBoundingBox().width, 
                this._alphabetObjectArray[i].getBoundingBox().height );
            if (cc.rectIntersectsRect(pRect, alphaRect)) {
                this._tmxMap.removeChild(this._alphabetObjectArray[i]);
                this._alphabetObjectArray.splice(i, 1);
                console.log("Eat eat eat");
            }
            
        }
    },

    addAlphabet: function() {
        this.getGroupPositions();
        let groupIndex = 0;
        var self = this;

        this._alphabetPosArray = shuffle(this._alphabetPosArray);

        for (var i = 0; i < this._inputData.length; i++) {
            let group = this._alphabetPosArray.pop();
            group.posArray.forEach((pos) => {
                var object = new cc.LabelBMFont(self._inputData[i].type, res.CustomFont_fnt);
                object.setScale(0.8);
                object.x = pos.x;
                object.y = pos.y;
                self._tmxMap.addChild(object, AR_WORD_ZODER);
                self._alphabetObjectArray.push(object);
            });
        }
    },

    getGroupPositions: function(){
        this._alphabetPosArray = [];
        this._csf = cc.director.getContentScaleFactor();

        var self = this;
        this._tmxMap.getObjectGroups().forEach(function(group) {
            var groupPos = {
                name: group.getGroupName(),
                posArray: [],
            };

            var that = self;
            group.getObjects().forEach(function(obj) {
                groupPos.posArray.push({
                    x: obj.x * that._csf,
                    y: obj.y * that._csf
                }); 
            });

            self._alphabetPosArray.push(groupPos);
        });

        // if (this._alphabetPosArray.length > 0)
        //     cc.log("Group Length: %d\nFirst Pos: (%d, %d) of Group %s", 
        //         this._alphabetPosArray.length, 
        //         this._alphabetPosArray[0].posArray[0].x, 
        //         this._alphabetPosArray[0].posArray[0].y, 
        //         this._alphabetPosArray[0].name);
    },

    onTouchBegan: function(touch, event) {
        var touchedPos = touch.getLocation();
        
        this._player.setMightJump(true);

        return true;
    },

    onTouchMoved: function(touch, event) {
        
    },

    onTouchEnded: function (touch, event) {
        var touchedPos = touch.getLocation();
        
        this._player.setMightJump(false);
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
        // cc.log("position: %d, %d -> plPos: %d, %d", position.x, position.y, plPos.x, plPos.y);
    
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

        return gids;
    },

    drawRectWithLabel: function(from, to, fillColor, lineSize, lineColor, label) {
        if (!ENABLE_DEBUG_DRAW)
            return;

        this._playerBorder.drawRect(from, to, fillColor, lineSize, lineColor);

        var lbl = new cc.LabelBMFont(label+"", "hud-font.fnt");
        lbl.color = cc.color("#ffd902");
        lbl.x = (to.x - from.x)/2 + from.x;
        lbl.y = (to.y - from.y)/2 + from.y;

        this._playerBorder.addChild(lbl);
    },

    drawRectPlatforms: function() {
        if (!ENABLE_DEBUG_DRAW)
            return;

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

    checkForAndResolveCollisions: function(p) {
        this._playerBorder.clear();
        this._playerBorder.removeAllChildren();

        var pRect = p.getCollisionBoundingBox();

        this.drawRectWithLabel(cc.p(pRect.x, pRect.y),
            cc.p(pRect.x + pRect.width, pRect.y + pRect.height),
            cc.color(255,0,100,0), 3, cc.color(0, 100, 100,255),
            "[]");

        this.drawRectPlatforms();
        
        var tiles = this.getSurroundingTilesAtPosition(p.getPosition(), this._landLayer);
        p.setOnGround(false);
        p.setOnRightCollision(false);

        let collisionArrayTiles = [];

        for (var i = 0; i < tiles.length; i++) {

            var dic = tiles[i];
            let _tileRect = cc.rect(dic.x, dic.y, this._tileSize.width, this._tileSize.height); 
            
            // cc.log("Gid Json => %s", JSON.stringify(dic));
            // cc.log("Player Rect => (%d, %d, %d, %d)", pRect.x, pRect.y, pRect.width, pRect.height);
            var gid = dic.gid;
            if (gid) {
                let tileRect = cc.rect(dic.x, dic.y, this._tileSize.width, this._tileSize.height); 
                if (cc.rectIntersectsRect(pRect, tileRect)) {               

                    collisionArrayTiles.push({
                        index: i + 1,
                        tileRect: tileRect,
                    });

                    this.drawRectWithLabel(cc.p(dic.x, dic.y),
                        cc.p(dic.x+this._tileSize.width, dic.y+this._tileSize.height),
                        cc.color(255,0,100,0), 3, cc.color(255, 0, 0,255),
                        i+1);

                    // continue;

                    let intersection = cc.rectIntersection(pRect, tileRect);

                    let desiredPosition = p.getDesiredPosition();
                    let velocity = p.getVelocity();
                    
                    if (i == 0) {
                        cc.log("tile is directly below player. i = %d", i + 1);
                        if (!p.onGround()){
                            p.setDesiredPosition( cc.p(desiredPosition.x, desiredPosition.y + intersection.height));
                            p.setVelocity(cc.p(velocity.x, 0.0));
                            p.setOnGround(true);
                        }
                    } else if (i == 1) {
                        //tile is directly above player
                        p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y - intersection.height));
                        p.setVelocity(cc.p(velocity.x, 0.0));
                    } else if (i == 2) {
                        cc.log("tile is left of player. i = %d", i + 1);
                        p.setDesiredPosition(cc.p(desiredPosition.x + intersection.width, desiredPosition.y));
                    } else if (i == 3) {
                        cc.log("tile is right of player. i = %d", i + 1);
                        p.setDesiredPosition(cc.p(desiredPosition.x - intersection.width, desiredPosition.y));
                        p.setOnRightCollision(true);
                        // p.setVelocity(cc.p(0.0, 0.0));
                    } else {
                        
                        if (intersection.width > intersection.height) {
                            cc.log("tile is diagonal, but resolving collision vertially. i = %d", i + 1);
                            p.setVelocity(cc.p(velocity.x, 0.0)); 
                            let resolutionHeight;
                            if (i > 5) {
                                resolutionHeight = intersection.height;
                                // p.setOnGround(true);
                            } else {
                                resolutionHeight = -intersection.height;
                            }
                            // p.setDesiredPosition(cc.p(desiredPosition.x, desiredPosition.y + resolutionHeight ));
                            
                        } else {
                            cc.log("tile is on right or left side. i = %d", i + 1);
                            let resolutionWidth;
                            if (i == 6 || i == 4 || !p.onGround()) {
                                resolutionWidth = intersection.width;
                            } else {
                                resolutionWidth = -intersection.width;
                            }
                            // p.setDesiredPosition(cc.p(desiredPosition.x , desiredPosition.y + resolutionWidth));
                        } 
                    } 

                    cc.log("yo, onground: ", p.onGround());
                    cc.log("Desired Position (%d, %d)", this._player.getDesiredPosition().x, this._player.getDesiredPosition().y);
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
        
        let centerOfView = cc.p(winSize.width/3, winSize.height/3);
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