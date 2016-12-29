let BUILDINGBLOCKS_COMPLETED_TAG = 0;
let BUILDING_BLOCKS_TAG = 9;
let BUILDING_BLOCKS_HEIGHT = 25;
let MAX_BLOCK = 5;
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

    _operationSoundExist: false,
    _operationSoundReady: false,
    _operationSoundPath: null,

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
        this.playBackGroundMusic();
        this._createOperation();
        this._showNextOperation();

        this._hudLayer.setTotalGoals(this._data["first"].length);
    },

    _createOperation: function() {
        cc.log("_createOperation");
        // 1st row

        var firstObj = new cc.Layer();
        firstObj.width = FRUIDDITION_HOLDER_WIDTH;
        firstObj.x = firstObj.width/4;
        firstObj.y = cc.winSize.height/2;
        this.addChild(firstObj);
        this._objects.push(firstObj);

        
        // this._operations.push(firstOperation);

        var secondObj = new cc.Layer();
        secondObj.width = 250;
        // secondObj.visible = false; // comment it later

        secondObj.x = cc.winSize.width/2;
        secondObj.y = cc.winSize.height/2;
        this.addChild(secondObj);
        this._objects.push(secondObj);

        var thirdObj = new cc.Layer();
        thirdObj.width = FRUIDDITION_HOLDER_WIDTH;
        thirdObj.x = cc.winSize.width/2;
        thirdObj.y = cc.winSize.height/2 + 20;
        this.addChild(thirdObj);
        this._objects.push(thirdObj);
    },

    _showNextOperation: function() {
        // clear previous session
        this._cleanPreviousSession();
        var node = new cc.Layer();
        node.tag = BUILDING_BLOCKS_TAG;
        this.addChild(node);
        // 1st node
        var firstObjectData = this._data["first"];
        var secondObjectData = this._data["second"];

        var firstObjectCounts = firstObjectData[this._currentOperationId];
        var secondObjectCounts = secondObjectData[this._currentOperationId];
        for (var i = 0; i < firstObjectCounts.length; i++) {
            var currentSpotX = i * cc.winSize.width/4*3 + 150;
            var currentSpotY = cc.winSize.height/2 + 50;

            var firstNodeBlocksCount = parseInt(firstObjectCounts[i]);
            this._createSpotNodeBlocks(firstNodeBlocksCount, node, currentSpotX, currentSpotY);
            this._createDraggingNodeBlocks(firstNodeBlocksCount, node, i, 100);
            // cc.log("currentSpotY " + currentSpotY);
            var currentOperation = this._data["firstOperation"][this._currentOperationId];
            var string = "+";
            if (currentOperation.indexOf("sub") > -1)
                string = "-";
            var firstOperation = new cc.LabelBMFont(string, res.CustomFont_fnt);
            firstOperation.scale = this._gameScale;
            firstOperation.x = currentSpotX;
            firstOperation.y = currentSpotY - firstOperation.height*firstOperation.scale;
            node.addChild(firstOperation);

            var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
            secondOperation.scale = this._gameScale;
            secondOperation.x = cc.winSize.width/3 * (1 + i);
            secondOperation.y = cc.winSize.height/2;
            node.addChild(secondOperation);

            var secondNodeBlocksCount = parseInt(secondObjectCounts[i]);
            currentSpotY = currentSpotY - firstOperation.height*firstOperation.scale - 100 - secondNodeBlocksCount*BUILDING_BLOCKS_HEIGHT;
            this._createSpotNodeBlocks(secondNodeBlocksCount, node, currentSpotX, currentSpotY, true);
            this._createDraggingNodeBlocks(secondNodeBlocksCount, node, i, 250);
        }
        this._objects[2].removeAllChildren();
        var thirdObjectData = this._data["third"];
        var thirdObjectCounts = thirdObjectData[this._currentOperationId];
        var labelAdded = false;
        var totalHeight = 0;
        for (var i = 0; i < thirdObjectCounts; i++) {
            if (i >= MAX_BLOCK)
                break;
            var o = new cc.Sprite("#" + this._type + (Math.floor(Math.random() * 4) + 1) + ".png");
            o.scale = this._gameScale;
            o.x = 0;
            o.y = -(o.height - 10) * i * o.scale;
            this._objects[2].addChild(o, STAND_OBJECT_ZORDER);
                
            totalHeight = o.y;
        }
        var lb = new cc.LabelBMFont(thirdObjectCounts, res.HomeFont_fnt);
        lb.scale = (thirdObjectCounts == 1) ? 0.4 : 1;
        lb.y = totalHeight/2 + 10;
        this._objects[2].addChild(lb, 9);

        var completedOperationId = this._currentOperationId;
        this._operationSoundPath = this._data["first"][completedOperationId][0] + "_" 
                        + this._data["firstOperation"][completedOperationId] + "_"
                        + this._data["second"][completedOperationId][0];

        this._operationSoundPath = "res/sounds/sentences/" + localize(this._operationSoundPath) + "-0.mp3";

        this._currentOperationId++;
    },

    _createSpotNodeBlocks: function(count, parent, currentSpotX, currentSpotY, isSecondPart) {
        var isSecondOperationPart = isSecondPart || false;
        var labelAdded = false;
        var totalHeight = 0;
        var nodeBlocks = new cc.Layer();
        nodeBlocks.x = currentSpotX;
        nodeBlocks.y = currentSpotY;
        nodeBlocks.tag = count;
        parent.addChild(nodeBlocks);
        this._dropSpots.push(nodeBlocks);
        for (var k = 0; k < count; k++) {
            if (k >= MAX_BLOCK)
                break;
            var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
            o.scale = this._gameScale;
            o.y = (o.height - 10) * (count-k) * o.scale;
            nodeBlocks.addChild(o, STAND_OBJECT_ZORDER);      
            this._dropSpotScale = o.scale;
            nodeBlocks.width = o.width * this._gameScale;
            nodeBlocks.height = o.height*count * o.scale;
    
            totalHeight = o.height * o.scale * count;
        }
        var lb = new cc.LabelBMFont(count, res.CustomFont_fnt);
        lb.scale = (count == 1) ? 0.38 : 1;
        lb.y = totalHeight/2 + 25 * this._gameScale;
        nodeBlocks.addChild(lb, 9);
    },

    _createDraggingNodeBlocks: function(count, parent, i, startWidth) {
        var draggingNode = new cc.Node();
        draggingNode.x = startWidth + i * 300;
        draggingNode.y = 50;
        draggingNode.tag = count;
        draggingNode.scale = 0.5;
        parent.addChild(draggingNode);
        this._draggingObjects.push(draggingNode);
        var totalHeight = 0;
        var labelAdded = false;
        for (var k = 0; k < count; k++) {
            if (k >= MAX_BLOCK)
                break;
            var o = new cc.Sprite("#" + this._type + (Math.floor(Math.random() * 4) + 1) + ".png");
            o.scale = Math.min(1, (BUILDING_BLOCKS_HEIGHT * MAX_BLOCK * this._gameScale) / (BUILDING_BLOCKS_HEIGHT * count));
            o.y = (o.height - 10) * (count-k) * o.scale;
            o.setUserData(k);
            draggingNode.addChild(o);
            draggingNode.width = o.width * this._gameScale;
            draggingNode.height = o.height*(k+1) * this._gameScale;
     
            totalHeight = o.height * o.scale * count;
        }
        var lb = new cc.LabelBMFont(count, res.HomeFont_fnt);
        lb.scale = (count == 1) ? 0.5 : 1;
        lb.y = totalHeight/2 + 25 * this._gameScale;
        draggingNode.addChild(lb, 9);
    },

    _playOperationSound: function(completedObjectsCount) {
        var countAudioId = jsb.AudioEngine.play2d("res/sounds/numbers/" + localize(completedObjectsCount) + ".mp3");
        var self = this;
        jsb.AudioEngine.setFinishCallback(countAudioId, function(audioId, audioPath) {
            // jsb.AudioEngine.stopAll();
            if (!self._operationSoundReady)
                return;
            if (!self._operationSoundExist) {
                self._blockTouch = false;
                self._showNextOperation();
            }
            cc.log("self._operationSoundPath: " + self._operationSoundPath);
            var audio = jsb.AudioEngine.play2d(self._operationSoundPath);
            jsb.AudioEngine.setFinishCallback(audio, function(audioId, audioPath) {
                // jsb.AudioEngine.stopAll();
                self._blockTouch = false;
                self._showNextOperation();
            })
        });
    },

    _fetchObjectData: function(data) {
        this._type = data["type"];
        this._data = data["data"][0];

        this._data["first"] = this._prepareData(this._data["first"]);
        this._data["second"] = this._prepareData(this._data["second"]);
        this._data["third"] = this._prepareData(this._data["third"]);

        this._data["type"] = this._type;
        this.setData(this._data);
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
            cc.log("bBox: " + JSON.stringify(bBox));
            var newBBox = cc.rect(bBox.x - bBox.width/2, bBox.y + bBox.height/2, bBox.width*1.5, bBox.height*1.5);
            cc.log("newBBox: " + JSON.stringify(newBBox));
            // cc.log("onTouchBegan ");
            // var nodePoint = draggingObj.getParent().convertToNodeSpace(touchLoc);
            // nodePoint = cc.p(nodePoint.x + draggingObj.width/2, nodePoint.y + draggingObj.height/2);
            if (draggingObj.tag > 0 && cc.rectContainsPoint(newBBox, touchLoc)) {
                cc.log("onTouchBegan go in draggingObj loop");
                self._currentObjectMoving = draggingObj;
                self._oldPosition = draggingObj.getPosition();
                self._oldScale = draggingObj.scale;
                self._currentObjectMoving.scale = 1;
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
        cc.log("this._currentObjectMoving.scale: " + this._currentObjectMoving.scale);
        this._currentObjectMoving = null;

        if (this._dropSpots.length == 0) {
            this.popGold(cc.p(position.x + parent.x, position.y + parent.y));
            this.updateProgressBar();
            if (!this._checkWonGame()) {
                // play end of operation sound
                this._completeOperationAction();
                this._operationSoundReady = true;
                if (jsb.fileUtils.isFileExist(this._operationSoundPath))
                    this._operationSoundExist = true;
            }
        } else
            this._blockTouch = false;
        this._playOperationSound(blocksCount);
    },

    _checkWonGame: function() {
        var self = this;
        if (this._currentOperationId === (this._data["first"].length)) {
            this.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function() {
                    self.doCompletedScene();
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

        this._operationSoundReady = false;
        this._operationSoundPath = "";
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

    updateProgressBar: function() {
        cc.log("ListeningTestLayer - updateProgressBar");
        var percent = this._currentOperationId / this._data["first"].length;
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._currentOperationId);

        this._super();
    },
});

var BuildingBlocksScene = cc.Scene.extend({
    ctor: function(data) {
        this._super();

        var l = new BuildingBlocksLayer(data);
        this.addChild(l);
    }
});