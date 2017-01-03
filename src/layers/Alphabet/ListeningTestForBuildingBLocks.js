var ListeningTestForBuildingBLocks = ListeningTestLayer.extend({
    _type: null,
    _objects: [],
    _rdmIndex: null,
    _operations: [],

    ctor: function(data, duration) {
        this._super(data, duration);

        this._objCenter = cc.p(cc.winSize.width * 0.65, cc.winSize.height/2 * 0.8);
    },

    onEnterTransitionDidFinish: function() {
        this._super();

        this._hudLayer.setTotalGoals(this._names.length);
    },

    _createOperation: function() {
        // cc.log("_createOperation");
        // 1st row
        this._objects = [];
        this._operations = [];
        this._rdmIndex = null;
        var firstObj = new cc.Layer();
        this._nameNode.addChild(firstObj);
        this._objects.push(firstObj);

        var secondObj = new cc.Layer();
        this._nameNode.addChild(secondObj);
        this._objects.push(secondObj);

        var string = "";
        if (this._data["firstOperation"][this._nameIdx] == "plus")
            string = "+";
        else
            string = "-";
        var firstOperation = new cc.LabelBMFont(string, res.HomeFont_fnt);
        firstOperation.scale = 0.8;
        this._nameNode.addChild(firstOperation);
        this._operations.push(firstOperation);


        var objCount = this._names[this._nameIdx];
        var blockNumberY;

        for (var i = 0; i < this._objects.length; i++) {
            var operationPartIndex = (i == 0) ? "first" : "second";

            var objCount = this._data[operationPartIndex][this._nameIdx];

            objCount = Utils.getValueOfObjectById(objCount);
            // cc.log("objCount " + objCount);

            if (!isNaN(objCount))
                objCount = parseInt(objCount);
            else {
                if(this._rdmIndex == null) 
                    this._rdmIndex = Math.floor(Math.random() * objCount.length);
                objCount = objCount[this._rdmIndex];
            };

            var labelAdded = false;
            for (var k = 0; k < objCount; k++) {
                if (k > 4)
                    break;
                var rdmColorIndex = Math.ceil(Math.random() * 4);
                var o = new cc.Sprite("#block" + rdmColorIndex + ".png");
                o.scale = (firstObj.height < o.height*objCount) ? (firstObj.height / (o.height*objCount)) : 0.7;
                o.y = (o.height - 10) *  (objCount-k) * o.scale;
                this._objects[i].addChild(o, STAND_OBJECT_ZORDER);
                this._objects[i].width = o.width*o.scale;

                if (!labelAdded) {
                    var lb = new cc.LabelBMFont(objCount, res.HomeFont_fnt);
                    lb.scale = (objCount/3 < MAX_BLOCK_NUMBER_SCALE) ? (objCount/3) : MAX_BLOCK_NUMBER_SCALE;
                    blockNumberY = ((o.height - 10) * objCount/2 * o.scale)/2 + lb.height/2;

                    if (objCount == 1) {
                        blockNumberY = o.y + 4;
                    }

                    lb.y = blockNumberY;

                    this._objects[i].addChild(lb, STAND_OBJECT_ZORDER + 1);

                    labelAdded = true;

                    firstOperation.y = (blockNumberY > firstOperation.y) ? blockNumberY : firstOperation.y;
                }
            }
        }

        
        firstOperation.x = this._objects[0].width;
        secondObj.x = firstOperation.x + this._objects[0].width;
    },

    _displayCurrentName: function() {
        var self = this;

        if (this._nameNode)
            this._nameNode.removeFromParent();

        this._nameNode = new cc.Node();
        this._nameNode.setCascadeOpacityEnabled(true);
        this._nameNode.x = cc.winSize.width/2;
        this._nameNode.y = cc.winSize.height - 150;
        this._nameNode.scale = 0.7;
        this.addChild(this._nameNode);

        this._createOperation();

        // var objName = text.toLowerCase();
        // play operation sound
        this._objSoundPath = null;

        this.runAction(cc.sequence(
            cc.delayTime(ANIMATE_DELAY_TIME * 3 + 0.5),
            cc.callFunc(function() {
                self._playObjSound();
            }))); 
    },

    _showObjects: function() {
        this._objectNodes.forEach(function(obj) { obj.removeFromParent(); });
        this._objectNodes = [];

        var self = this;
        var shownObjNames = [];

        var remainingObj = this._names.slice(0);
        // cc.log("remainingObj: " + remainingObj);
        var currentKeyNames = this._names[this._nameIdx];

        shownObjNames.push(currentKeyNames);
            
        remainingObj.splice(this._nameIdx, 1);
        remainingObj = shuffle(remainingObj);
        
        shownObjNames.push(remainingObj[0]);
        shownObjNames.push(remainingObj[1]);

        // cc.log("shownObjNames: " + shownObjNames);

        shownObjNames = shuffle(shownObjNames);
        for (var i = 0; i < 3; i++) {
            var mostTopY = this._nameNode.y - this._nameNode.height/2 - 20;
            var node = new cc.Layer();
            node.setContentSize(150, 300);
            node.setCascadeOpacityEnabled(true);
            var labelAdded = false;
            for (var k = 0; k < shownObjNames[i]; k++) {
                if (k > 4)
                    break;
                var rdmColorIndex = Math.ceil(Math.random() * 4);
                var o = new cc.Sprite("#block" + rdmColorIndex + ".png");
                o.scale = Math.min(node.width / o.width, node.height / (o.height*shownObjNames[i]));
                o.x = o.width/2;
                o.y = (o.height - 10) *  (shownObjNames[i]-k) * o.scale;
                node.addChild(o, STAND_OBJECT_ZORDER);      

                var blockNumberY;
                if (!labelAdded) {
                    var lb = new cc.LabelBMFont(shownObjNames[i], res.HomeFont_fnt);
                    lb.scale = (shownObjNames[i]/3 < MAX_BLOCK_NUMBER_SCALE) ? (shownObjNames[i]/3) : MAX_BLOCK_NUMBER_SCALE;

                    blockNumberY = ((o.height - 10) * shownObjNames[i] * o.scale)/2 + lb.height/2;

                    lb.x = o.x;
                    lb.y = blockNumberY;

                    node.addChild(lb, STAND_OBJECT_ZORDER + 1);

                    labelAdded = true;
                }
            }
            node.name = shownObjNames[i];
            // node.scale = Math.min(100 / node.width, 250 / node.height) * Utils.screenRatioTo43();
            node.x = this._objCenter.x + (i-1) * 200 * Utils.screenRatioTo43() - node.width/2;
            node.y = this._objCenter.y - node.height/2;

            if (cc.rectGetMaxY(node.getBoundingBox()) > mostTopY) {
                node.scale = (mostTopY - this._objCenter.y) / node.height * 2;
            }

            this._objectNodes.push(node);
            this.addChild(node);

            this._animateObject(node, i);
            this._animateObjectIn(node, i);

            if (node.name == this._names[this._nameIdx]) {
                node.runAction(cc.sequence(
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowHand || UPDATED_CONFIG.listeningTestWaitToShowHand),
                    cc.callFunc(function(sender) {
                        // cc.log("set finger tutorial");
                        self._tutorial = new TutorialLayer([sender]);
                        self.addChild(self._tutorial, 999);
                    }),
                    cc.delayTime(GAME_CONFIG.listeningTestWaitToShowNextObj || UPDATED_CONFIG.listeningTestWaitToShowNextObj),
                    cc.callFunc(function(sender) {
                        if (self._tutorial) {
                            self._tutorial.removeFromParent();
                            self._tutorial = null;
                        }

                        self._nameIdx++;
                        if (self._nameIdx >= self._names.length) {
                            self._moveToNextScene();
                        } else {
                            self._displayCurrentName();
                            self._showObjects();
                        }
                    })
                ));
            }
        }
    },

    _fetchObjectData: function(data) {
        // cc.log("ListeningTestForBuildingBLocks \t _fetchObjectData -> DATA: " + JSON.stringify(data));
        this._super(data[0]["third"]);

        this._type = data[0]["type"];
        this._data = data[0];
        // cc.log("ListeningTestForBuildingBLocks \t this._type: " + JSON.stringify(this._type));
        // cc.log("ListeningTestForBuildingBLocks \t this._third: " + JSON.stringify(this._names));

        // this.setData(this._data);
    },

    updateProgressBar: function() {
        // cc.log("ListeningTestLayer - updateProgressBar");
        var percent = this._nameIdx / this._names.length;
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._nameIdx);

        this._super();
    },
});

var ListeningTestForBuildingBLocksScene = cc.Scene.extend({
    ctor: function(data, duration) {
        this._super();
        // cc.log("listening: " + duration);
        var layer = new ListeningTestForBuildingBLocks(data, duration);
        this.addChild(layer);
    }
});