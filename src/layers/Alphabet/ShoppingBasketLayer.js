var SHOPPING_OBJECT_DEFAULT_WIDTH = 80;
var SHOPPING_OBJECT_DEFAULT_HEIGHT = 80;
var ShoppingBasketLayer = TestLayer.extend({
    _data: null,
    _basket: null,

    _activateObjects: [],
    _deactivateObjects: [],
    _activateSlots: [],

    timePlayed: 0,

    _basketScale: 0.8,
    _basketBBox: null,

    _blockFlag: false,
    _didObjectAllowedToMove: false,
    _currentObjectOder: 0,
    _currentObjectMoving: null,
    _currentAvailableSlot: null,
    _currentObjectOriginPos: null,
    _totalObjectCount: 0,
    _indexOfLastObject: 0,
    _requiredAmount: 10,

    ctor: function(data, timePlayed, timeForScene) {
        this._super();
        this.timePlayed = timePlayed || 0;
        this._currentObjectOder = 0;
        this._deactivateObjects = [];
        this._activateObjects = [];
        this._fetchObjectData(data);

        this._addBasket();
        this._showObjects();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
        this.playBackGroundMusic();
        this._hudLayer.setTotalGoals(this._requiredAmount);
    },

    _addBasket: function() {
        this._basket = new cc.Sprite(res.Basket_png);
        this._basket.scale = this._basketScale;
        this._basket.x = cc.winSize.width/2;
        this._basket.y = cc.winSize.height/2 - 50* Utils.getScaleFactorTo16And9();
        this.addChild(this._basket, 0);


        this._basketBBox = this._basket.getBoundingBox();
        this._calcPossibleSlots();
        var strap = new cc.Sprite(res.Basket_strap_png);
        strap.scale = this._basketScale;
        this.addChild(strap, 2);
        strap.setAnchorPoint(1,0.5);
        strap.x = this._basket.x;
        strap.y = this._basket.y;
    },

    _calcPossibleSlots: function() {
        this._activateSlots = [];

        let COL_ITEM_COUNT = 5;
        let ROW_ITEM_COUNT = 3;
        let DISTANCE_ITEM = 70;
        for (var i = 0; i < this._totalObjectCount; i++) {
            var col = (i % COL_ITEM_COUNT);
            var row = Math.floor(i / COL_ITEM_COUNT);
            if (row > ROW_ITEM_COUNT - 1)
                row = row % ROW_ITEM_COUNT;

            cc.log("slot #" + i + ": " + col + ", " + row);

            var x = this._basket.x - this._basket.width/2 * this._basketScale + 70 + col * DISTANCE_ITEM;
            var y = this._basket.y + this._basket.height/2 * this._basketScale - 70 - row * DISTANCE_ITEM;
            this._activateSlots.push(cc.p(x, y));
            // cc.log("x : %f - y: %f", x, y);
        }
        this._currentAvailableSlot = this._activateSlots[0];
    },

    _showObjects: function() {
        var currentX = 0;
        var tempX = 0;
        var tempY = 1;
        var lastObjX = 0;
        var inSecondRow = false;
        var firstIndex = this._indexOfLastObject;
        if(this._indexOfLastObject + 20 < this._data.length)
            this._indexOfLastObject = this._indexOfLastObject + 20;
        else
            this._indexOfLastObject = this._data.length;

        for (var i = firstIndex ; i < this._indexOfLastObject; i++) {
            var objImageName = this._data[i].value;
            var objType = this._data[i].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var obj;
            if (objType == "number") {
                // cc.log("create LabelBMFont -> " + imgPath);
                obj = new cc.LabelBMFont(objImageName, res.CustomFont_fnt);
            }
            else if (objType == "object" || objType == "animal") {
                // cc.log("create normal sprite -> " + imgPath);
                obj = new cc.Sprite(imgPath);
            }
            else
                continue;
            obj.tag = i;
            obj.z = 3;
            // cc.log("add objects tag: " + obj.tag);
            obj.scale = Math.min(SHOPPING_OBJECT_DEFAULT_WIDTH/obj.width, SHOPPING_OBJECT_DEFAULT_HEIGHT/obj.height);
            obj.x = SHOPPING_OBJECT_DEFAULT_WIDTH * 2 + (SHOPPING_OBJECT_DEFAULT_WIDTH + 20) * tempX;
            obj.y = (inSecondRow) ? (cc.rectGetMinY(this._basketBBox) - 60) : (cc.rectGetMaxY(this._basketBBox) + 50);
            obj.setUserData(objImageName);

            if (obj.x > (cc.winSize.width - 200)) {
                inSecondRow = true;
                tempX = 0;
            } else
                tempX = tempX+1;
            
            // cc.log("obj.x: " + obj.x);
            // cc.log("cc.winSize.width: " + cc.winSize.width);
            this.addChild(obj, 1);
            this._activateObjects.push(obj);
        };
    },

    _fetchObjectData: function(data) {
        ShoppingBasketLayer._data = data;
        this.setData(data);
        if (data) {
            if (data[0].requiredShoppingAmount) {
                this._requiredAmount = data[0].requiredShoppingAmount;
            }
            data = data[0].dataShopping;
            this._data = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                // cc.log("o" + JSON.stringify(o));
                if (o[0]) {
                    // cc.log("o[0]: " + JSON.stringify(o[0]));
                    // cc.log("return o[0]");
                    return o[0];
                } else {
                    // cc.log("return Id");
                    return id;
                }
            });
        }
        else
            this._data = [];

        this._totalObjectCount = this._data.length;
    },

    onTouchBegan: function (touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockFlag)
            return false;

        if (self._currentObjectMoving)
            return false;

        self._deactivateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
                self._didObjectAllowedToMove = false;
                return true;
            }
        });

        self._activateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
                // cc.log("touch _activateObjects with tag: " + obj.tag);
                self._didObjectAllowedToMove = true;
                var objName = obj.getUserData();
                cc.log("objName" + objName);
                var path =  "res/sounds/words/" + localize(objName) + ".mp3";
                cc.log("Path: " + path);
                if (!jsb.fileUtils.isFileExist(path)) {
                    path = "res/sounds/numbers/" + objName + ".mp3";
                }
                if (!jsb.fileUtils.isFileExist(path)) {
                    path = "res/sounds/alphabets/" + localize(objName) + ".mp3";
                }
                if (!jsb.fileUtils.isFileExist(path)) {
                    path = "res/sounds/colors/" + objName + ".mp3";
                }
                if (!jsb.fileUtils.isFileExist(path))
                    path = "";
                cc.log("path ->>>" + path);
                if(jsb.fileUtils.isFileExist(path))
                    jsb.AudioEngine.play2d(path, false);
                self._currentObjectMoving = obj;
                self._currentObjectOriginPos = obj.getPosition();
                return true;
            }
        });

        return true;
    },

    onTouchMoved: function (touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (!self._didObjectAllowedToMove)
            return;
        // self._playObjectOderSound();
        self._currentObjectMoving.setPosition(touchLoc);
    },

    onTouchEnded: function (touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockFlag)
            return;

        if (!self._didObjectAllowedToMove)
            return;

        if (!self._currentAvailableSlot)
            return;

        self._blockFlag = true; // block touch, processing
        // calculate distance of object and slot
        // // var currSlotPos = self._currentAvailableSlot;
        var currObjectPos = self._currentObjectMoving.getPosition();
        // // var distance = cc.pDistance(currObjectPos, currSlotPos);
        // cc.log("currentslotPos: " + JSON.stringify(currSlotPos));
        // cc.log("distance: " + distance);
        if (cc.rectContainsPoint(self._basketBBox, currObjectPos)) { // move succeed
            self._handleObjectSucceedDrop();
        } else // return object to origin pos
            self._currentObjectMoving.setPosition(self._currentObjectOriginPos);

        self._renewPlayTurn();

        self._blockFlag = false; // unlock 
        // cc.log("OBJECT ACTIVATE: " + self._activateSlots.length);
        // cc.log("_activateObjects: " + self._activateObjects);
        // cc.log("_deactivateObjects: " + self._deactivateObjects);
    },


    _checkCompletedScene: function() {
        // if(this._indexOfLastObject == this._data.length && this._activateObjects.length == 0) {
        if (this._deactivateObjects.length == this._requiredAmount){// && this._activateObjects.length == 0) {
            this._blockFlag = true;
            this.doCompletedScene();
            // this.playWinSound();
            // this.createWinLabel();
            // if (this.timePlayed < 3)
            //     this.runAction(cc.sequence(
            //         cc.delayTime(2),
            //         cc.callFunc(function() {
            //             this.timePlayed++;
            //             cc.director.runScene(new ShoppingBasketScene(ShoppingBasketLayer._data, this.timePlayed)); 
            //         })
            //     ));
            // else {
            //     Utils.updateStepData();
            //     SceneFlowController.getInstance().clearData();
            //     cc.director.runScene(new MapScene());
            // }
        }
    },

    _redefineActiveObjectTag: function() {
        for (var i = 0; i < this._activateObjects.length; i++) {
            var obj = this._activateObjects[i];
            obj.tag = i;
        }
    },

    _renewPlayTurn: function() {
        this._currentObjectMoving = null;
        this._currentObjectOriginPos = null;
        this._didObjectAllowedToMove = false;
        this._redefineActiveObjectTag();
    },

    _handleObjectSucceedDrop: function() {
        this.popGold(this._currentAvailableSlot);

        this._currentObjectMoving.setPosition(this._currentAvailableSlot);
        this._activateObjects.splice(this._currentObjectMoving.tag, 1)
        this._deactivateObjects.push(this._currentObjectMoving);
        cc.log("_deactivateObjects: " + this._deactivateObjects.length);
        this._currentObjectMoving.setLocalZOrder(1);
        //set for playSoundObjectOder
        this._currentObjectOder += 1;
        
        // remove current slot
        this._currentAvailableSlot = null;
        this._activateSlots.splice(0, 1);
        //paly soundCorrect
        jsb.AudioEngine.play2d(res.Succeed_sfx);
        var path = "res/sounds/numbers/" + localize(this._currentObjectOder) + ".mp3";
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function() {
                if (jsb.fileUtils.isFileExist(path))
                    jsb.AudioEngine.play2d(path, false);
            }.bind(this))
        ));
        this._currentAvailableSlot = this._activateSlots[0];
        // if (this._currentAvailableSlot)
        //     this._runSlotAction(this._currentAvailableSlot);
        // cc.log("_activateSlots: %d", this._activateSlots.length);
        this.updateProgressBar();
        if(this._activateObjects.length == 0 && this._indexOfLastObject < this._data.length)
            this._showObjects();
        this._checkCompletedScene();
    },

    updateProgressBar: function() {
        var percent = this._deactivateObjects.length / this._requiredAmount;
        
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._deactivateObjects.length);

        this._super();
    },
});
ShoppingBasketLayer._data = null;

var ShoppingBasketScene = cc.Scene.extend({
    ctor: function(data, timePlayed, timeForScene) {
        this._super();

        var l = new ShoppingBasketLayer(data, timePlayed, timeForScene);
        this.addChild(l);
    }
});