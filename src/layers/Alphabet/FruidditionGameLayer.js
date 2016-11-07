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
var FRUIDDITION_HOLDER_WIDTH = 350;
var FruidditionGameLayer = TestLayer.extend({
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

    _blockTouch: false,

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

        this._createOperation();
        this._showNextOperation();
    },

    _createOperation: function() {
        cc.log("_createOperation");
        // 1st row

        var firstObj = new cc.Node();
        firstObj.width = FRUIDDITION_HOLDER_WIDTH;
        firstObj.x = 0;
        firstObj.y = cc.winSize.height/2;
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
        secondObj.y = cc.winSize.height/2;
        this.addChild(secondObj);
        this._objects.push(secondObj);

        var secondOperation = new cc.LabelBMFont("=", res.CustomFont_fnt);
        secondOperation.x = cc.winSize.width/4 *3 - secondOperation.width/2;
        secondOperation.y = cc.winSize.height/2;
        this.addChild(secondOperation);

        var thirdObj = new cc.Node();
        thirdObj.width = FRUIDDITION_HOLDER_WIDTH;
        thirdObj.x = secondOperation.x + secondOperation.width/2;
        thirdObj.y = cc.winSize.height/2;
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
        // clear previous session
        this._cleanPreviousSession();

        // 1st row
        var idx = 0;
        
        for (var key in this._data) {
            if (key.indexOf("operation") > -1)
                continue;

            var d = this._data[key];
            var objCount = d[this._currentOperationId];
            if (!isNaN(objCount))
                objCount = parseInt(objCount);
            var heightIdx = -1;
            for (var i = 0; i < objCount; i++) {
                if (i%3 == 0)
                    heightIdx++;
                var objectName = this._type;
                if (Array.isArray(this._type))
                    objectName = this._type[Math.floor(Math.random() * this._type.length)];
                var o = new cc.Sprite("res/SD/objects/"+ objectName + ".png");
                o.scale = 0.5;
                o.x = o.width/2 + o.width * (i%3) * o.scale;
                o.y = -(o.height + 10) * heightIdx * o.scale;
                this._objects[idx].addChild(o, STAND_OBJECT_ZORDER);

                if (key.indexOf("third") > -1) {
                    var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.Outline_fsh);
                    var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
                    shaderState.setUniformFloat("width", o.width * o.scale * cc.contentScaleFactor());
                    shaderState.setUniformFloat("height", o.height * o.scale * cc.contentScaleFactor());
                    o.shaderProgram = shader;

                    this._dropSpots.push(o);
                }
                this._dropSpotScale = o.scale;
            }
            idx++;
        }

        var firstOperation = this._data["firstOperation"][this._currentOperationId];
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
            var objectName = this._type;
            if (Array.isArray(this._type))
                objectName = this._type[Math.floor(Math.random() * this._type.length)];
            var o = new cc.Sprite("res/SD/objects/"+ objectName + ".png");
            if ((cc.winSize.width - FRUIDDITION_HOLDER_WIDTH) >= (o.width*goal))
                o.scale = 1;
            else
                o.scale = (cc.winSize.width - FRUIDDITION_HOLDER_WIDTH) / (o.width*goal);
            cc.log("goal scale" + o.scale);
            o.x = o.width/2 + i*(o.width + 5) * o.scale;
            o.y = o.height/2;
            o.tag = FRUIDDITION_UNCOMPLETED_TAG;
            o.setUserData(i);
            this.addChild(o);
            this._draggingObjects.push(o);
            this._playDraggingObjectIdleAction(o);
        }

        this._currentOperationId++;
    },

    _playOperationSound: function(completedObjectsCount) {
        var countAudioId = jsb.AudioEngine.play2d("res/sounds/numbers/" + completedObjectsCount + ".mp3");
        var self = this;
        jsb.AudioEngine.setFinishCallback(countAudioId, function(audioId, audioPath) {
            self._blockTouch = false;
            jsb.AudioEngine.play2d("res/sounds/objects/" + self._type + ".mp3");
        });
    },

    _fetchObjectData: function(data) {
        // if (!data)
        //     return;
        cc.log("fruiddition _fetchObjectData");
        // this._type = FRUIDDITION_DATA["type"];
        // this._data = JSON.parse(JSON.stringify(FRUIDDITION_DATA["data"][0]));
        // if (data)
        //     data = JSON.parse(data);
        cc.log("data:" + JSON.stringify(data));
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

            if (cc.pDistance(spotWorldPos, objectPos) < 100) {
                var parent = dropSpot.parent;
                spotWorldPos = cc.p(spotWorldPos.x - dropSpot.width/2*dropSpot.scale * i, spotWorldPos.y + dropSpot.height/2*dropSpot.scale);
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

        // this._draggingObjects.splice(this._currentObjectMoving.getUserData(), 1);
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
        
        this._completedObjectsCount++;
        this._playOperationSound(this._completedObjectsCount);

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
        var self = this;
        if (this._currentOperationId === (this._data["first"].length)) {
            this.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function() {
                    self._moveToNextScene();
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
        for (var i = 0; i < array.length;i++) {
            array[i].tag = i;
        }
    },
});

var FruidditionGameScene = cc.Scene.extend({
    ctor: function(data, timeForScene) {
        this._super();

        var l = new FruidditionGameLayer(data, timeForScene);
        this.addChild(l);
    }
});