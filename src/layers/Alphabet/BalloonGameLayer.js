var BalloonGameLayer = cc.LayerColor.extend({

    _balloonsLimit: 15,
    _balloons: [],
    _enableSpawn: false,
    _waitForSpawn: 3.0,
    _balloonScale: 0.5,
    _balloonLifeTime: 12,
    _objectsArray: [],
    _tempArray: [],
    _objectIdArray: ["word_r", "number_6", "word_t", "color_red", "color_blue"],
    _currentObject: null, 
    _currentIdLabel: null,
    _hudLayer: null,
    _goalNumber: 10,
    _correctChoose: 0,

    ctor: function(objectIdArray) {
        this._super();
        this.init(objectIdArray);
    },

    init: function(objectIdArray) {
        cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan.bind(this),
        }, this);

        this._filterObjectsByType(objectIdArray);

        this._tempArray = shuffle(this._objectsArray).slice(0);

        this._currentObject = this._tempArray.pop();

        this._spawnBalloonPool();

        this.addHud();
        this._addCurrentIdHud(this._currentObject.id);

        this.schedule(this._spawnBalloons, this._waitForSpawn);
    },

    // only accept object with type: colors, numbers and alphabets
    _filterObjectsByType: function(objectIdArray) {
        this._parseGameObjectJSON();
        var tempArray = [];
        if (!this._gameObjectJson || this._gameObjectJson.length == 0)
            return;

        for (var i = 0; i < objectIdArray.length; i++){            
            let itemObject = this._gameObjectJson.find((gameObject) => {
                return gameObject.id === objectIdArray[i];
            });

            if (itemObject.type === "color" || itemObject.type === "number" || itemObject.type === "word")
                tempArray.push({"id": itemObject.id, "type": itemObject.type, "value": itemObject.value});
        }

        this._objectsArray = tempArray;
    },

    _parseGameObjectJSON: function() {
        let self = this;
        cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
            if (!err) {
                self._gameObjectJson = data;
            } else {
                cc.fileUtils.removeFile(Utils.getAssetsManagerPath() + res.Game_Object_JSON);
                cc.loader.loadJson(res.Game_Object_JSON, function(err, data) {
                    self._gameObjectJson = data;
                });
            }
        });
    },

    addHud: function() {
        var hudLayer = new HudLayer(this);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 99);
        this._hudLayer = hudLayer;
    },

    _addCurrentIdHud: function(text) {
        var label = new cc.LabelBMFont(text + "", "hud-font.fnt");
        
        label.color = cc.color("#ffd902");
        label.x = 200;
        label.y = cc.winSize.height - 100;
        this.addChild(label);

        this._currentIdLabel = label;
    },

    completedScene: function() {

    },

    onTouchBegan: function(touch, event) {
        var self = this;
        var touchedPos = touch.getLocation();

        this._balloons.forEach(function(obj) {
            // console.log("Bounding content size => " + obj.getChildByTag(101).getContentSize().height);
            var bounding = obj.getChildByTag(101).getBoundingBox();
            if (cc.rectContainsPoint(cc.rect(obj.x, obj.y, bounding.width, bounding.height), touchedPos)) {
                if (obj.name === self._currentObject.id){
                    console.log("Touch the right balloon => " + obj.name);
                    obj.stopAllActions();
                    obj.x = -100;
                    obj.y = -100;
                    obj.setVisible(false);

                    self._correctChoose++;
                    
                    var percent = self._correctChoose / self._goalNumber;
                    self._hudLayer.setProgressBarPercentage(percent);

                    if (self._correctChoose >= self._goalNumber){
                        
                    }
                }
                else {
                    console.log("Touch incorrect");
                }
            }
        });

        return true;
    },

    _getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    _spawnBalloons: function() {
        var winSize = cc.winSize;

        var balloon = this._getVisibleBalloon();
        if (!balloon)
            return;

        var randomBalloon = this._objectsArray[this._getRandomInt(0, this._objectsArray.length)];
        balloon.name = randomBalloon.id;
        balloon.setVisible(true);

        var labelBalloon = balloon.getChildByTag(100);
        if (labelBalloon && randomBalloon.type !== "color"){
            labelBalloon.setString(randomBalloon.value.toUpperCase());
            balloon.setTexture(cc.textureCache.addImage(res.Gray_balloon_png));
        }
        else {
            labelBalloon.setString("");

            if (randomBalloon.id.indexOf("red") !== -1){
                balloon.setTexture(cc.textureCache.addImage(res.Red_balloon_png));
            }
            else if (randomBalloon.id.indexOf("green") !== -1){
                balloon.setTexture(cc.textureCache.addImage(res.Green_balloon_png));
            }
            else if (randomBalloon.id.indexOf("blue") !== -1){
                balloon.setTexture(cc.textureCache.addImage(res.Blue_balloon_png));
            }
            else {
                balloon.setTexture(cc.textureCache.addImage(res.Gray_balloon_png));   
            }
        }

        var ranX = this._getRandomInt(balloon.width, winSize.width - balloon.width);
        balloon.attr({x: ranX, y: - balloon.width});

        //create the move action
        var actionTo = new cc.MoveTo(this._balloonLifeTime, cc.p(ranX, winSize.height + 100));
        balloon.runAction(new cc.Sequence(actionTo, cc.callFunc(() => {
            balloon.x = -100;
            balloon.y = -100;
            balloon.setVisible(false);
        }, this)));
    },

    _getVisibleBalloon: function() {
        for (var i = 0; i < this._balloons.length; i++){
            // console.log("Balloon name: " + this._balloons[i].name);
            if (!this._balloons[i].isVisible())
                return this._balloons[i];
        }
    },

    _spawnBalloonPool: function() {
        for (var i = 0; i < this._balloonsLimit; i++){
            var balloonSprite = new cc.Sprite(res.Gray_balloon_png);
            balloonSprite.attr({x: -100, y: -100});   
            balloonSprite.setVisible(false);
            balloonSprite.name = "Balloon" + i;
            balloonSprite.setScale(this._balloonScale);
            this._balloons.push(balloonSprite);
            this.addChild(balloonSprite); 

            var boundingBox = new cc.Sprite();
            boundingBox.setContentSize(balloonSprite.width, balloonSprite.height / 2);
            boundingBox.x = 0;
            boundingBox.y = balloonSprite.width / 2;
            boundingBox.tag = 101;
            balloonSprite.addChild(boundingBox);

            var lbBalloon = new cc.LabelBMFont("", res.CustomFont_fnt);
            lbBalloon.scale = 2.2;
            lbBalloon.x = balloonSprite.width/2;
            lbBalloon.y = balloonSprite.height - 100;
            lbBalloon.tag = 100;
            balloonSprite.addChild(lbBalloon);
        }
    },
});

var BalloonGameScene = cc.Scene.extend({
    ctor: function(objectIdArray) {
        this._super();
        var layer = new BalloonGameLayer(objectIdArray);
        this.addChild(layer);
    }
});