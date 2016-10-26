var BUILDINGBLOCKS_COMPLETED_TAG = 0;
var BUILDING_BLOCKS_TAG = 9;
var BuildingBlocksLayer = TestLayer.extend({
    _type: null,
    _data: null,

    _currentOperationId: 0,
    _objects: [],
    _draggingObjects: [],
    _operations: [],
    _dropSpots: [],
    _completedObjectsCount: 0,

    _dropSpotScale: 1,

    _draggingNode: null,
    _currentObjectMoving: null,
    _oldPosition: null,
    _oldScale: 1,

    _gameScale: 0.7,
    _labelScale: 0.3,

    _blockTouch: false,

    ctor: function(data) {
        this._super();

        this._draggingObjects = [];
        this._dropSpots = [];
        this._objects = [];
        this._operations = [];

        this._fetchObjectData(data);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this._onTouchBegan.bind(this),
            onTouchMoved: this._onTouchMoved.bind(this),
            onTouchEnded: this._onTouchEnded.bind(this)
        }, this);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        this._createOperation();
        this._showNextOperation();
    },

    _createOperation: function() {
        cc.log("_createOperation");
        // 1st row

        var firstObj = new cc.Node();
        firstObj.width = FRUIDDITION_HOLDER_WIDTH;
        firstObj.x = firstObj.width/4;
        firstObj.y = cc.winSize.height/2;
        this.addChild(firstObj);
        this._objects.push(firstObj);

        
        // this._operations.push(firstOperation);

        var secondObj = new cc.Node();
        secondObj.width = 250;
        secondObj.visible = false; // comment it later

        secondObj.x = cc.winSize.width/2;
        secondObj.y = cc.winSize.height/2;
        this.addChild(secondObj);
        this._objects.push(secondObj);

        var thirdObj = new cc.Node();
        thirdObj.width = FRUIDDITION_HOLDER_WIDTH;
        thirdObj.x = cc.winSize.width/2;
        thirdObj.y = cc.winSize.height/2 + 20;
        this.addChild(thirdObj);
        this._objects.push(thirdObj);
    },

    _showNextOperation: function() {
        // clear previous session
        this._cleanPreviousSession();
        var node = new cc.Node();
        node.tag = BUILDING_BLOCKS_TAG;
        this.addChild(node);
        // 1st node
        var firstObjectData = this._data["first"];
        var secondObjectData = this._data["second"];

        var firstObjectCounts = firstObjectData[this._currentOperationId];
        var secondObjectCounts = secondObjectData[this._currentOperationId];
        for (var i = 0; i < firstObjectCounts.length; i++) {
            var currentSpotX = i * cc.winSize.width/4*3 + 150;
            var currentSpotY = 0;

            var firstNodeBlocksCount = parseInt(firstObjectCounts[i]);
            var firstNodeBlocks = new cc.Node();
            firstNodeBlocks.x = currentSpotX;
            firstNodeBlocks.y = cc.winSize.height/2;
            firstNodeBlocks.tag = firstNodeBlocksCount;
            node.addChild(firstNodeBlocks);
            this._dropSpots.push(firstNodeBlocks);
            for (var k = 0; k < firstNodeBlocksCount; k++) {
                var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
                // o.x = currentSpotX;
                o.scale = this._gameScale;
                o.y = (o.height - 10) * (firstNodeBlocksCount-k) * o.scale;
                firstNodeBlocks.addChild(o, STAND_OBJECT_ZORDER);      
                this._dropSpotScale = o.scale;
                firstNodeBlocks.width = o.width * this._gameScale;
                firstNodeBlocks.height = o.height*firstNodeBlocksCount * this._gameScale;
            }

            var lb = new cc.LabelBMFont(firstNodeBlocksCount, res.CustomFont_fnt);
            lb.scale = this._labelScale * this._gameScale;
            lb.y = firstNodeBlocks.height/2 * (firstNodeBlocksCount) * lb.scale;
            // firstNodeBlocks.addChild(lb);

            // dragging node
            var draggingNode = new cc.Node();
            draggingNode.x = 100 + i * 300;
            draggingNode.y = 50;
            draggingNode.tag = firstNodeBlocksCount;
            node.addChild(draggingNode);
            this._draggingObjects.push(draggingNode);
            for (var k = 0; k < firstNodeBlocksCount; k++) {
                var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
                o.scale = this._gameScale;
                o.y = (o.height - 10) * (firstNodeBlocksCount-k) * o.scale;
                o.setUserData(k);
                draggingNode.addChild(o);
                draggingNode.width = o.width * this._gameScale;
                draggingNode.height = o.height*(k+1) * this._gameScale;
            }

            var lb = new cc.LabelBMFont(firstNodeBlocksCount, res.CustomFont_fnt);
            lb.scale = this._labelScale * this._gameScale;
            lb.y = draggingNode.height/2 * (firstNodeBlocksCount) * lb.scale;
            // draggingNode.addChild(lb);

            var firstOperation = new cc.LabelBMFont("+", res.CustomFont_fnt);
            firstOperation.scale = 0.5 * this._gameScale;
            firstOperation.x = currentSpotX;
            firstOperation.y = firstNodeBlocks.y - firstOperation.height*firstOperation.scale;
            node.addChild(firstOperation);

            var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
            secondOperation.scale = 0.5 * this._gameScale;
            secondOperation.x = cc.winSize.width/3 * (1 + i);
            secondOperation.y = cc.winSize.height/2;
            node.addChild(secondOperation);

            var secondNodeBlocksCount = parseInt(secondObjectCounts[i]);
            var secondNodeBlocks = new cc.Node();
            secondNodeBlocks.x = currentSpotX;
            secondNodeBlocks.y = firstOperation.y - firstOperation.height*firstOperation.scale - 50;
            secondNodeBlocks.tag = secondNodeBlocksCount;
            node.addChild(secondNodeBlocks);
            this._dropSpots.push(secondNodeBlocks);
            for (var k = 0; k < secondNodeBlocksCount; k++) {
                var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
                o.scale = this._gameScale;
                o.y = (o.height - 10) * (secondNodeBlocksCount-k) * o.scale;
                secondNodeBlocks.addChild(o, STAND_OBJECT_ZORDER);      
                this._dropSpotScale = o.scale;
                secondNodeBlocks.width = o.width * o.scale;
                secondNodeBlocks.height = o.height*secondNodeBlocksCount* o.scale;
            }

            var lb = new cc.LabelBMFont(secondNodeBlocksCount, res.CustomFont_fnt);
            lb.scale = this._labelScale * this._gameScale;
            lb.y = secondNodeBlocks.height/2 * (secondNodeBlocksCount) * lb.scale;
            // secondNodeBlocks.addChild(lb);

            var draggingNode = new cc.Node();
            draggingNode.x = 250 + i * 300;
            draggingNode.y = 50;
            draggingNode.tag = secondNodeBlocksCount;
            node.addChild(draggingNode);
            this._draggingObjects.push(draggingNode);
            for (var k = 0; k < secondNodeBlocksCount; k++) {
                var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
                o.scale = this._gameScale;
                o.y = (o.height - 10) * (secondNodeBlocksCount-k) * o.scale;
                o.setUserData(k);
                draggingNode.addChild(o);
                draggingNode.width = o.width;
                draggingNode.height = o.height*(k+1);
            }

            var lb = new cc.LabelBMFont(secondNodeBlocksCount, res.CustomFont_fnt);
            lb.scale = this._labelScale * this._gameScale;
            lb.y = draggingNode.height/2 * (secondNodeBlocksCount) * lb.scale;
            // draggingNode.addChild(lb);
        }
        this._objects[2].removeAllChildren();
        var thirdObjectData = this._data["third"];
        var thirdObjectCounts = thirdObjectData[this._currentOperationId];
        for (var i = 0; i < thirdObjectCounts; i++) {
            var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
            o.scale = this._gameScale;
            o.x = 0;
            o.y = -(o.height - 10) * i * o.scale;
            this._objects[2].addChild(o, STAND_OBJECT_ZORDER);
        }
        var lb = new cc.LabelBMFont(thirdObjectCounts, res.CustomFont_fnt);
        lb.scale = this._labelScale * this._gameScale;
        lb.y = this._objects[2].height/2 * (thirdObjectCounts) * lb.scale;
        // this._objects[2].addChild(lb);

        this._currentOperationId++;
    },

    _playOperationSound: function(completedObjectsCount) {
        var countAudioId = jsb.AudioEngine.play2d("res/sounds/numbers/" + completedObjectsCount + ".mp3");
        var self = this;
        jsb.AudioEngine.setFinishCallback(countAudioId, function(audioId, audioPath) {
            self._blockTouch = false;
            // jsb.AudioEngine.play2d("res/sounds/objects/" + self._type + ".mp3");
        });
    },

    _fetchObjectData: function(data) {
        // cc.log("data:" + JSON.stringify(data));
        this._type = data["type"];
        this._data = data["data"][0];

        this._data["first"] = this._prepareData(this._data["first"]);
        this._data["second"] = this._prepareData(this._data["second"]);
        this._data["third"] = this._prepareData(this._data["third"]);
    },

    _prepareData: function(array) {
        array = array.map(function(obj) {
            if (Array.isArray(obj)) {
                obj = obj.map(function(o) {
                    var object = GameObject.getInstance().findById(o);
                    return object[0].value;
                });
            }
            else {
                obj = GameObject.getInstance().findById(obj);
                obj = obj[0].value;
            }
            return obj;
        });
        return array;
    },

    _onTouchBegan: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockTouch || self._currentObjectMoving || self._draggingObjects.length == 0) {
            cc.log("onTouchBegan return false");
            return false;
        }

        self._draggingObjects.forEach(function(draggingObj) {
            // cc.log("draggingObj: " +draggingObj);
            var bBox = draggingObj.getBoundingBox();
            // cc.log("onTouchBegan ");
            var nodePoint = draggingObj.getParent().convertToNodeSpace(touchLoc);
            nodePoint = cc.p(nodePoint.x + draggingObj.width/2, nodePoint.y);
            if (draggingObj.tag > 0 && cc.rectContainsPoint(bBox, nodePoint)) {
                cc.log("onTouchBegan go in draggingObj loop");
                self._currentObjectMoving = draggingObj;
                self._oldPosition = draggingObj.getPosition();
                self._oldScale = draggingObj.scale;
                self._currentObjectMoving.scale = self._oldScale+0.2;
                return true;
            }
        });
        cc.log("onTouchBegan go to the end and return true");
        return true;
    },

    _onTouchMoved: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._currentObjectMoving) {
            self._currentObjectMoving.setLocalZOrder(MOVING_OBJECT_ZORDER);
            self._currentObjectMoving.setPosition(touchLoc);
        }
    },

    _onTouchEnded: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (!self._currentObjectMoving)
            return;
        for (var i = 0; i < self._dropSpots.length; i++) {
            var dropSpot = self._dropSpots[i];
            var objectPos = self._currentObjectMoving.getPosition();
            if (cc.pDistance(dropSpot.getPosition(), objectPos) < 100 && self._currentObjectMoving.tag == dropSpot.tag) {
                var parent = dropSpot.parent;
                self._handleSuccessfulAction(i, parent);
                return;
            }
        }
        self._currentObjectMoving.setLocalZOrder(STAND_OBJECT_ZORDER);
        self._currentObjectMoving.setPosition(self._oldPosition);
        self._currentObjectMoving.scale = self._oldScale;
        self._currentObjectMoving = null;
        cc.log("return object to _oldPosition");
    },

    _handleSuccessfulAction: function(index, parent) {
        cc.log("_handleSuccessfulAction");
        this._blockTouch = true;
        var scale = this._dropSpots[index].scale;
        var position = this._dropSpots[index].getPosition();
        this._dropSpots[index].removeFromParent();
        this._dropSpots.splice(index, 1);

        var blocksCount = this._currentObjectMoving.tag;
        this._currentObjectMoving.setLocalZOrder(STAND_OBJECT_ZORDER);
        this._currentObjectMoving.stopAllActions();
        this._currentObjectMoving.scale = scale;
        this._currentObjectMoving.tag = BUILDINGBLOCKS_COMPLETED_TAG;
        this._currentObjectMoving.setPosition(position);
        
        this._playOperationSound(blocksCount);
        this._currentObjectMoving = null;

        if (this._dropSpots.length == 0) {
            if (!this._checkWonGame()) {
                // play end of operation sound
                this._completeOperationAction();
                this.runAction(cc.sequence(
                    cc.delayTime(2),
                    cc.callFunc(function() {
                        this._showNextOperation();
                    }.bind(this))
                ));
            }
        }
    },

    _checkWonGame: function() {
        if (this._currentOperationId === (this._data["first"].length)) {
            this.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function() {
                    cc.director.replaceScene(new MapScene());
                })
            ));
            return true;
        } else
            return false;
    },

    _cleanPreviousSession: function() {
        cc.log("_cleanPreviousSession this._draggingObjects: " + this._draggingObjects);
        cc.log("_cleanPreviousSession this._objects: " + this._objects);
        this._completedObjectsCount = 0;
        this._objects.forEach(obj => obj.removeAllChildren());
        this._dropSpots.forEach(obj => obj.removeAllChildren());
        this.removeChildByTag(BUILDING_BLOCKS_TAG);

        this._draggingObjects = [];
        this._dropSpots = [];
    },

    _completeOperationAction: function() {
        for (var i = 0; i < this._draggingObjects.length;i++) {
            var obj = this._draggingObjects[i];
            var scale = obj.scale;
            obj.runAction(cc.sequence(
                cc.delayTime(i/3),
                cc.scaleTo(0.2, scale+0.15),
                cc.scaleTo(0.2, scale)
            ))
        };
    },

    _playDraggingObjectIdleAction: function(obj) {
        var scale = obj.scale;
        obj.runAction(cc.repeatForever(
            cc.sequence(
                cc.delayTime(3),
                cc.scaleTo(0.2, scale+0.1),
                cc.scaleTo(0.2, scale),
                cc.scaleTo(0.2, scale+0.1),
                cc.scaleTo(0.2, scale)
            )
        ))
    },

    _reorderArray: function(array) {
        cc.log("_reorderArray" + array);
        for (var i = 0; i < array.length; i++) {
            if (array[i])
                array[i].tag = i;
        }
    },
});

var BuildingBlocksScene = cc.Scene.extend({
    ctor: function(data) {
        this._super();

        var l = new BuildingBlocksLayer(data);
        this.addChild(l);
    }
});