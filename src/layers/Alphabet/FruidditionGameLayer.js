var FRUIDDITION_DATA = {
    "type": "apple",
    "data": [{
        "first": ["number_1", "number_2", "number_3", "number_4"],
        "second": ["number_1", "number_1", "number_1", "number_1"],
        "third": ["number_2", "number_3", "number_4", "number_5"],
        "firstOperation": ["plus","plus","plus","plus"],
        "secondOperation": ["equal", "equal", "equal", "equal"]
    }]
};
var FRUIDDITION_UNCOMPLETED_TAG = 0;
var FRUIDDITION_COMPLETED_TAG = 1;
var MOVING_OBJECT_ZORDER = 10;
var STAND_OBJECT_ZORDER = 2;
var FRUIDDITION_HOLDER_WIDTH = 250;
var FRUIDDITION_HOLDER_HEIGHT = 150;
var FruidditionGameLayer = TestLayer.extend({
    _type: null,
    _data: null,

    _currentOperationId: 0,
    _objects: [],
    _draggingObjects: [],
    _operations: [],
    _dropSpots: [],
    _completedObjectsCount: 0,
    _standObject:[],
    _dropSpotScale: 1,

    _draggingNode: null,
    _currentObjectMoving: null,
    _oldPosition: null,
    _oldScale: 1,
    audioEffect: null,
    _blockTouch: false,
    _operationSoundReadyToPlay: false,
    _operationSoundPath: null,
    _currentObject: null,

    ctor: function(data, timeForScene) {
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

        var firstObj = new cc.Node();
        firstObj.width = FRUIDDITION_HOLDER_WIDTH;
        firstObj.x = 0;
        firstObj.y = cc.winSize.height/2 + 40;
        this.addChild(firstObj);
        this._objects.push(firstObj);

        var firstOperation = new cc.LabelBMFont("+", res.CustomFont_fnt);
        firstOperation.x = firstObj.width + firstOperation.width/2;
        firstOperation.y = cc.winSize.height/2;
        this.addChild(firstOperation);
        this._operations.push(firstOperation);

        var secondObj = new cc.Node();
        secondObj.width = 250;
        secondObj.x = cc.winSize.width/2 - secondObj.width/2;
        secondObj.y = cc.winSize.height/2 + 40;
        this.addChild(secondObj);
        this._objects.push(secondObj);

        var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
        secondOperation.x = cc.winSize.width/4 *3 - secondOperation.width/2 - 20;
        secondOperation.y = cc.winSize.height/2;
        this.addChild(secondOperation);

        var thirdObj = new cc.Node();
        thirdObj.width = FRUIDDITION_HOLDER_WIDTH;
        thirdObj.x = secondOperation.x + secondOperation.width/2 + 10;
        thirdObj.y = cc.winSize.height/2 + 40;
        this.addChild(thirdObj);
        this._objects.push(thirdObj);

        // 2nd row
        var draggingNode = new cc.Node();
        draggingNode.width = cc.winSize.width;
        draggingNode.x = draggingNode.width/2;
        draggingNode.y = cc.winSize.height/2;
        this.addChild(draggingNode);
        this._draggingNode = draggingNode;
    },

    _showNextOperation: function() {
        if(this.audioEffect)
            jsb.AudioEngine.stop(this.audioEffect);
        // clear previous session
        this._cleanPreviousSession();
        this._currentObject = this._type;
        if (cc.isArray(this._type)) {
            this._currentObject = this._type[Math.floor(Math.random() * this._type.length)];
            cc.log(this._type);
        }

        // 1st row
        var idx = 0;
        for (var key in this._data) {
            if (key.indexOf("operation") > -1)
                continue;

            var d = this._data[key];
            cc.log("d ->>>>" + JSON.stringify(d));
            cc.log("this._currentOperationId ->>>> " +this._currentOperationId);
            var objCount = d[this._currentOperationId];
            if (!isNaN(objCount))
                objCount = parseInt(objCount);

            cc.log("objCount: " + objCount);
            var heightIdx = -1;
            for (var i = 0; i < objCount; i++) {
                if (i%3 == 0)
                    heightIdx++;
                
                var o = new cc.Sprite("res/SD/objects/"+ this._currentObject + ".png");
                o.scale = 0.4;
                o.x = this._objects[idx].x + o.width/2 * o.scale + o.width * (i%3) * o.scale;
                o.y = this._objects[idx].y - (o.height + 10) * heightIdx * o.scale;
                this.addChild(o, STAND_OBJECT_ZORDER);
                // this._objects[idx].addChild(o, STAND_OBJECT_ZORDER);
                if (key.indexOf("third") > -1) {
                    var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.Outline_fsh);
                    var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
                    shaderState.setUniformFloat("width", o.width * o.scale * cc.contentScaleFactor());
                    shaderState.setUniformFloat("height", o.height * o.scale * cc.contentScaleFactor());
                    o.shaderProgram = shader;

                    this._dropSpots.push(o);
                }
                else
                    this._standObject.push(o);
                this._dropSpotScale = o.scale;
            }
            idx++;
        }

        var firstOperation = this._data["firstOperation"][this._currentOperationId];
        cc.log("firstOperation: " + firstOperation);
        var string = "-";
        if (firstOperation.indexOf("plus") > -1)
            string = "+";

        var lb = new cc.LabelBMFont(string, res.CustomFont_fnt);
        lb.x = this._operations[0].x;
        lb.y = this._operations[0].y;
        this.addChild(lb);
        this._operations[0].removeFromParent();
        this._operations[0] = lb;

        // 2nd row
        this._draggingObjects = [];
        var goal = this._data["third"][this._currentOperationId];
        if (!isNaN(goal))
            goal = parseInt(goal);
        for (var i = 0; i < goal; i++) {
            var obj = new cc.Sprite("res/SD/objects/"+ this._currentObject + ".png");
            if ((cc.winSize.width - FRUIDDITION_HOLDER_WIDTH) >= (obj.width*goal))
                obj.scale = 1;
            else
                obj.scale = (cc.winSize.width - FRUIDDITION_HOLDER_WIDTH) / (obj.width*goal);
            cc.log("goal scale" + obj.scale);
            obj.x = obj.width/2 + i*(obj.width + 5) * obj.scale;
            obj.y = obj.height/2;
            obj.tag = FRUIDDITION_UNCOMPLETED_TAG;
            obj.setUserData(i);
            this.addChild(obj);
            this._draggingObjects.push(obj);
            this._playDraggingObjectIdleAction(obj);
        }

        var completedOperationId = this._currentOperationId;
        this._operationSoundPath = this._data["first"][completedOperationId] + "_" 
                        + this._data["firstOperation"][completedOperationId] + "_"
                        + this._data["second"][completedOperationId];

        this._operationSoundPath = "res/sounds/sentences/" + localize(this._operationSoundPath) + "-0.mp3";
        cc.log("this._operationSoundPath: " + this._operationSoundPath);
        this._currentOperationId++;
    },

    _playOperationSound: function(completedObjectsCount, callback) {
        // jsb.AudioEngine.stopAll();
        cc.log("completedObjectsCount: " + completedObjectsCount);
        this.audioEffect = jsb.AudioEngine.play2d("res/sounds/numbers/" + localize(completedObjectsCount) + ".mp3");
        var self = this;
        jsb.AudioEngine.setFinishCallback(this.audioEffect, function(audioId, audioPath) {
            // jsb.AudioEngine.stopAll();
            this.audioEffect = jsb.AudioEngine.play2d("res/sounds/words/" + localize(self._currentObject) + ".mp3");
            jsb.AudioEngine.setFinishCallback(this.audioEffect, function(audioId, audioPath) {
                self._blockTouch = false;
                if (!self._operationSoundReadyToPlay)
                    return;
                if (!self._operationSoundExist) {
                    self._blockTouch = false;
                    self._showNextOperation();
                    cc.log("_operationSoundExist");
                }
                else {
                    if(self.audioEffect)
                        jsb.AudioEngine.stop(self.audioEffect);
                    this.audioEffect = jsb.AudioEngine.play2d(self._operationSoundPath);
                    jsb.AudioEngine.setFinishCallback(this.audioEffect, function(audioId, audioPath) {
                        // jsb.AudioEngine.stopAll();
                        self._blockTouch = false;
                        cc.log("callback->>");
                        self._showNextOperation();
                    });
                };
            });
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
            if (obj)
                obj = GameObject.getInstance().findById(obj);
            if (obj && obj[0] && obj[0].value)
                return obj[0].value;
            else
                return obj;
        });
        return array;
    },

    _onTouchBegan: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if(self.audioEffect)
            jsb.AudioEngine.stop(self.audioEffect);
        // cc.log("self._draggingObjects.length: " + self._draggingObjects.length);
        // cc.log("self._currentObjectMoving: " + self._currentObjectMoving);
        // cc.log("self._blockTouch: " + self._blockTouch);
        if (self._blockTouch || self._currentObjectMoving || self._draggingObjects.length == 0) {
            cc.log("onTouchBegan return false");
            return false;
        }

        self._draggingObjects.forEach(function(draggingObj) {
            var bBox = draggingObj.getBoundingBox();
            cc.log("onTouchBegan ");
            if (draggingObj.tag == FRUIDDITION_UNCOMPLETED_TAG && cc.rectContainsPoint(bBox, touchLoc)) {
                cc.log("onTouchBegan go in draggingObj loop");
                self._currentObjectMoving = draggingObj;
                self._oldPosition = draggingObj.getPosition();
                self._oldScale = draggingObj.scale;
                self._currentObjectMoving.scale = self._dropSpotScale;
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
            var spotWorldPos = dropSpot.convertToWorldSpace(dropSpot.getPosition());
            var objectPos = self._currentObjectMoving.getPosition();

            if (cc.pDistance(dropSpot.getPosition(), objectPos) < 100) {
                var parent = dropSpot.parent;
                // spotWorldPos = cc.p(spotWorldPos.x - dropSpot.width/2*dropSpot.scale * i, spotWorldPos.y + dropSpot.height/2*dropSpot.scale);
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

        this.popGold(cc.p(position.x + parent.x, position.y + parent.y));
        this.updateProgressBar();

        this._currentObjectMoving.removeFromParent(false);
        parent.addChild(this._currentObjectMoving);
        this._currentObjectMoving.setLocalZOrder(STAND_OBJECT_ZORDER);
        this._currentObjectMoving.stopAllActions();
        this._currentObjectMoving.scale = scale;
        this._currentObjectMoving.setPosition(position);
        this._currentObjectMoving.tag = FRUIDDITION_COMPLETED_TAG;
        this._currentObjectMoving = null;

        this._dropSpots.splice(index, 1);

        // this._reorderArray(this._draggingObjects);
        
        if (this._dropSpots.length == 0) {
            if (!this._checkWonGame()) {
                this._completeOperationAction();
                this._operationSoundReadyToPlay = true;
                if (jsb.fileUtils.isFileExist(this._operationSoundPath))
                    this._operationSoundExist = true;
            }
        } else
            this._blockTouch = false;

        this._completedObjectsCount++;
        this._playOperationSound(this._completedObjectsCount);
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
        this._completedObjectsCount = 0;
        this._objects.forEach(obj => obj.removeAllChildren());
        this._operations.forEach(obj => obj.removeAllChildren());
        this._dropSpots.forEach(obj => obj.removeAllChildren());
        this._draggingObjects.forEach(obj => obj.removeFromParent());
        this._standObject.forEach(obj => obj.removeFromParent());
        
        this._standObject = [];
        this._draggingObjects = [];
        this._dropSpots = [];
        this._operationSoundPath = null;
        this._operationSoundReadyToPlay = false;
        this._currentObject = null;
        cc.log("_cleanPreviousSession");
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
        for (var i = 0; i < array.length;i++) {
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

var FruidditionGameScene = cc.Scene.extend({
    ctor: function(data, timeForScene) {
        this._super();

        var l = new FruidditionGameLayer(data, timeForScene);
        this.addChild(l);
    }
});