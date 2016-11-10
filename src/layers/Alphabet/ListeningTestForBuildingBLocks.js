var ListeningTestForBuildingBLocks = ListeningTestLayer.extend({
    _type: null,
    _objects: [],

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
        cc.log("_createOperation");
        // 1st row
        this._objects = [];
        this._operations = [];

        var firstObj = new cc.Layer();
        firstObj.width = FRUIDDITION_HOLDER_WIDTH;
        firstObj.height = 100;
        this._nameNode.addChild(firstObj);
        this._objects.push(firstObj);
        var string = "";
        if (this._data["firstOperation"][this._nameIdx] == "plus")
            string = "+";
        else
            string = "-";
        var firstOperation = new cc.LabelBMFont(string, res.CustomFont_fnt);
        firstOperation.scale = 0.5;
        firstOperation.x = firstObj.width + firstOperation.width/2;
        firstOperation.y = firstOperation.height/2;
        this._nameNode.addChild(firstOperation);
        this._operations.push(firstOperation);

        var secondObj = new cc.Layer();
        secondObj.width = 250;
        secondObj.x = firstOperation.x + secondObj.width/2;
        this._nameNode.addChild(secondObj);
        this._objects.push(secondObj);

        var objCount = this._names[this._nameIdx];
        cc.log("objCount: " + objCount);
        cc.log("this._names: " + this._names);
        
        for (var i = 0; i < this._objects.length; i++) {
            var objCount;
            if (i == 0)
                objCount = this._data["first"][this._nameIdx];
            else
                objCount = this._data["second"][this._nameIdx];
            cc.log("objCount " + objCount);
            if (!isNaN(objCount))
                objCount = parseInt(objCount);
            else {
                var rdmIndex = Math.floor(Math.random() * objCount.length)
                objCount = objCount[rdmIndex];
            }
            var heightIdx = -1;
            var labelAdded = false;
            for (var k = 0; k < objCount; k++) {
                if (k%3 == 0)
                    heightIdx++;
                var o = new cc.Sprite("#"+ this._type + "-empty.png");
                o.scale = (firstObj.height < o.height*objCount) ? (firstObj.height / (o.height*objCount)) : 0.7;
                o.y = (o.height - 10) *  (objCount-k) * o.scale;
                this._objects[i].addChild(o, STAND_OBJECT_ZORDER);
                this._objects[i].width = o.width*o.scale;
                if (k == Math.floor(objCount/2) || (objCount > 5 && k == Math.floor(5/2) )) {
                    if (!labelAdded) {
                        var lb = new cc.LabelBMFont(objCount, res.CustomFont_fnt);
                        lb.scale = (1/o.scale);
                        lb.x = o.width/2;
                        lb.y = o.height/2;
                        o.addChild(lb);

                        labelAdded = true;
                    }
                }
            }
        }
        firstOperation.x = this._objects[0].width + firstOperation.width/2;
        secondObj.x = firstOperation.x + this._objects[1].width/2;
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
        cc.log("remainingObj: " + remainingObj);
        var currentKeyNames = this._names[this._nameIdx];

        shownObjNames.push(currentKeyNames);
            
        remainingObj.splice(this._nameIdx, 1);
        remainingObj = shuffle(remainingObj);
        
        shownObjNames.push(remainingObj[0]);
        shownObjNames.push(remainingObj[1]);

        cc.log("shownObjNames: " + shownObjNames);

        shownObjNames = shuffle(shownObjNames);
        for (var i = 0; i < 3; i++) {
            var mostTopY = this._nameNode.y - this._nameNode.height/2 - 20;
            var node = new cc.Layer();
            node.setCascadeOpacityEnabled(true);
            var labelAdded = false;
            for (var k = 0; k < shownObjNames[i]; k++) {
                if (k > 5)
                    break;
                var o = new cc.Sprite("#" + this._type + "-empty" + ".png");
                o.x = o.width/2;
                o.y = (o.height - 10) *  (shownObjNames[i]-k) * o.scale;
                node.addChild(o, STAND_OBJECT_ZORDER);      
                node.width = o.width;
                node.height = o.height*shownObjNames[i];

                if (k == Math.floor(shownObjNames[i]/2) || (shownObjNames[i] > 5 && k == Math.floor(5/2) )) {
                    if (!labelAdded) {
                        o.setCascadeOpacityEnabled(true);
                        var lb = new cc.LabelBMFont(shownObjNames[i], res.CustomFont_fnt);
                        lb.scale = 0.5;
                        lb.x = o.width/2;
                        lb.y = o.height/2;
                        o.addChild(lb);

                        labelAdded = true;
                    }
                }
            }
            node.name = shownObjNames[i];
            node.scale = Math.min(100 / node.width, 250 / node.height) * Utils.screenRatioTo43();
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
                        cc.log("set finger tutorial");
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
        cc.log("data: " + data);
        this._type = data["type"];
        this._names = data["third"];
        this._data = data;
        cc.log("_fetchObjectData: " + this._objectName);
        cc.log("_fetchObjectData: " + this._keyObject);

        this.setData(this._data);
    },

    updateProgressBar: function() {
        cc.log("ListeningTestLayer - updateProgressBar");
        var percent = this._nameIdx / this._names.length;
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._nameIdx);

        this._super();
    },
});

var ListeningTestForBuildingBLocksScene = cc.Scene.extend({
    ctor: function(data, duration) {
        this._super();
        cc.log("listening: " + duration);
        var layer = new ListeningTestForBuildingBLocks(data, duration);
        this.addChild(layer);
    }
});