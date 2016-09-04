var TREE_GAME_ADI_ZORDER = 5;
var TREE_GAME_TREE_ZORDER = 3;
var TREE_GAME_GROUND_ZORDER = 2;
var TreeGameLayer = cc.Layer.extend({
    _data: null,

    _ground: null,

    _treeGroup: [],
    _numberGroup: [],
    _treeCoors: [],
    _numberCoors: [],
    _numberOfTrees: 1,

    _lastNumberJumpIdx: 0,
    _isAdiJumping: false,

    ctor: function(data, isTestScene) {
        this._super();

        // this._setIsTestScene(isTestScene);
        this._fetchObjectData(data);
        this._loadTmx();
        this._addBackground();
        this._addAdi();
        this._addTrees();
        this._addHudLayer();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchEnded: this.onTouchEnded
        }, this);
    },

    _addHudLayer: function(){
        var hudLayer = new HudLayer(this, true);
        hudLayer.x = 0;
        hudLayer.y = cc.winSize.height - 80;
        this.addChild(hudLayer, 4);
        this._hudLayer = hudLayer;
    },

    _addTrees: function() {
        this._treeGroup = [];
        this._numberGroup = [];
        if (this._data[0])
            this._numberOfTrees = Math.max(parseInt(this._data[0].value), 1);

        for (var i = 0; i < this._numberOfTrees; i++) {
            var treeIdx = (i % 2 == 0) ? 0 : 1;
            var tree = new cc.Sprite("#tree_game_" + treeIdx + ".png");
            tree.anchorY = 0;
            tree.scale = Utils.getScaleFactorTo16And9();
            tree.x = cc.winSize.width/(this._numberOfTrees+1) * (i+1);
            tree.y = this._ground.height - 12 * Utils.getScaleFactorTo16And9();
            this.addChild(tree, TREE_GAME_TREE_ZORDER);
            this._treeGroup.push(tree);

            // Got numbers array has been shuffled 
            var randomNumberArray = this._createRandomNumberArray();

            for (var j = 0; j < randomNumberArray.length; j++) {
                var index = j + 1 + i*5;
                var pos = this._numberCoors[randomNumberArray[j] + treeIdx*5]; // Random pos for numbers each tree
                var lb = new cc.LabelBMFont(index, res.CustomFont_fnt);
                lb.x = pos.x*tree.scale + tree.x;
                lb.y = pos.y*tree.scale + tree.y;
                lb.scale = 0.5 * tree.scale;
                this.addChild(lb, TREE_GAME_TREE_ZORDER + 1);
                this._numberGroup.push(lb);
            }
        }
    },

    _createRandomNumberArray: function() {
        var numbersArray = [];
        for (var j = 0; j < TreeGameLayer.TOTAL_NUMBERS_IN_A_TREE; j++) {
            numbersArray.push(j);
        }
        return shuffle(numbersArray);
    },

    _addBackground:function() {
        // bg
        var bg = new cc.Sprite(res.Bg_account_jpg);
        bg.x = cc.winSize.width/2;
        bg.y = cc.winSize.height/2;
        this.addChild(bg);

        // ground
        var ground = new cc.Sprite("#tree_game_ground.png");
        ground.x = cc.winSize.width/2;
        ground.y = ground.height/2;
        this.addChild(ground, TREE_GAME_GROUND_ZORDER);
        this._ground = ground;

        // grass
        var grass = new cc.Sprite("#tree_game_grass.png");
        grass.anchorY = 0;
        grass.x = cc.winSize.width/2;
        grass.y = 0;
        this.addChild(grass, 1);

        // cloud
        var cloud = new cc.Sprite("#tree_game_cloud.png");
        cloud.anchorY = 1;
        cloud.x = cc.winSize.width/2;
        cloud.y = cc.winSize.height;
        this.addChild(cloud);
    },

    _loadTmx: function() {
        this._treeCoors = [];
        this._numberCoors = [];
        var csf = cc.director.getContentScaleFactor();
        var tiledMap = new cc.TMXTiledMap();
        tiledMap.initWithTMXFile(res.TreeGame_TMX);

        var self = this;
        tiledMap.getObjectGroups().forEach(function(group) {
            group.getObjects().forEach(function(obj) {
                if (obj.name.startsWith("tree")){
                    self._treeCoors.push(obj);
                    cc.log(obj.x + "-" + obj.y);
                }
                if (obj.name.startsWith("number")) {
                    self._numberCoors.push({
                        "x": obj.x,
                        "y": obj.y
                    });
                    cc.log(obj.x + "-" + obj.y);    
                }
            });
        });
        cc.log("self._numberCoors " + JSON.stringify(self._numberCoors));
    },

    _addAdi: function() {
        this._adiDog = new AdiDogNode();
        this._adiDog.scale = Utils.screenRatioTo43() * 0.25;
        this._adiDog.setPosition(cc.p(cc.winSize.width * 0.15, this._ground.height * this._adiDog.scale));
        this.addChild(this._adiDog, TREE_GAME_ADI_ZORDER);
    },

    onTouchBegan: function(touch, event) {
        var self = event.getCurrentTarget();
        self._prevTouchLoc = touch.getLocation();

        if (self._isAdiJumping)
            return false;
        cc.log("onTouchBegan");
        return true;
    },

    onTouchEnded: function(touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if((touchLoc.y - self._prevTouchLoc.y) > 50 && self._lastNumberJumpIdx < self._numberGroup.length) {
            self._isAdiJumping = true;
            var endPoint = self._numberGroup[self._lastNumberJumpIdx];
            self._makeAdiJump(endPoint);

            self._lastNumberJumpIdx++;

            self.updateProgressBar();
            if (self._lastNumberJumpIdx == self._numberGroup.length) { // win case 
                self.runAction(cc.sequence(
                    cc.delayTime(2),
                    cc.callFunc(function() {
                        cc.director.runScene(new GameTestScene());
                    })
                ));
            }
        };
    },

    _makeAdiJump: function(endPoint) {
        cc.log("_makeAdiJump to : " + JSON.stringify(endPoint));
        var bezier = cc.bezierTo(0.5, [this._adiDog.getPosition(), cc.p(this._adiDog.x + 2, this._adiDog.y + 5), endPoint]);
        this._adiDog.adiJump();
        this._adiDog.runAction(
            cc.sequence(
                // cc.moveTo(0.5, endPoint),
                bezier,
                cc.delayTime(0.5),
                cc.callFunc(function(){
                    this._adiDog.adiIdling();
                    this._isAdiJumping = false;
                }.bind(this))
            )
        );
    },

    _fetchObjectData: function(data) {
        cc.log("data - > " + JSON.stringify(data)); 
        if (data) {
            this._data = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0];
            });

            var temp = 5;
            for (var i = 0; i < this._data.length; i++) {
                cc.log("this._data -> i : " + this._data[i]);
                var obj = this._data[i];
                var value = parseInt(obj.value);
                if (value && value <= temp) {
                    temp = parseInt(obj.value);
                } else{
                    this._data.splice(i, 1);
                }
            }
            // cc.log("this._data - > " + JSON.stringify(this._data)); 

        } else
            this._data = [{
                "id": "number_1",
                "type": "number",
                "value": "1"
            }];
    },

    updateProgressBar: function() {
        var percent = this._lastNumberJumpIdx / (this._numberOfTrees*5);
        cc.log("percent: " + percent);
        this._hudLayer.setProgressBarPercentage(percent);
        if (Math.round(this._lastNumberJumpIdx/(this._numberOfTrees/5)))
            this._hudLayer.setProgressLabelStr(this._lastNumberJumpIdx, this._numberOfTrees*5);

        var starEarned = 0;
        var objectCorrected = this._lastNumberJumpIdx;
        var starGoals = this.countingStars();
        if (objectCorrected >= starGoals.starGoal1 && objectCorrected < starGoals.starGoal2)
            starEarned = 1;
        if (objectCorrected >= starGoals.starGoal2 && objectCorrected < starGoals.starGoal3)
            starEarned = 2;
        if (objectCorrected >= starGoals.starGoal3)
            starEarned = 3;

        this._hudLayer.setStarEarned(starEarned);

        if (starEarned > 0)
            this._hudLayer.addStar("light", starEarned);
    },

    countingStars: function() {
        var starGoal1 = Math.ceil(this._numberOfTrees*5/3);
        var starGoal2 = Math.ceil(this._numberOfTrees*5/3 * 2);
        var starGoal3 = this._numberOfTrees*5;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },
});

TreeGameLayer.TOTAL_TREE_APPEAR = 5;
TreeGameLayer.TOTAL_NUMBERS_IN_A_TREE = 5;

var TreeGameScene = cc.Scene.extend({
    ctor:function(data, isTestScene){
        this._super();

        var l = new TreeGameLayer(data, isTestScene);
        this.addChild(l);
    }
});