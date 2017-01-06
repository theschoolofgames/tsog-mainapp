var ListeningTestForFruiddition = ListeningTestLayer.extend({
    _type: null,
    _objects: [],

    _operations: [],

    ctor: function(data, duration) {
        this._super(data, duration);

        this._objCenter = cc.p(cc.winSize.width * 0.55, cc.winSize.height/2 * 0.8);
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
        this._nameNode.addChild(firstObj);
        this._objects.push(firstObj);

        var string = "";
        if (this._data["firstOperation"][this._nameIdx] == "plus")
            string = "+";
        else
            string = "-";
        cc.log("ListeningTestForFruiddition _createOperation");
        var firstOperation = new cc.LabelBMFont(string, res.CustomFont_fnt);
        firstOperation.scale = 1.3;
        firstOperation.x = firstObj.width + firstOperation.width/2 + firstOperation.width;
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

            objCount = Utils.getValueOfObjectById(objCount);
            var heightIdx = -1;
            cc.log("total apples:  \t " + objCount);
            for (var k = 0; k < objCount; k++) {
                if (k%3 == 0)
                    heightIdx++;
                var randomType = this._randomType();
                cc.log("randomType: " + randomType);
                var o = new cc.Sprite("res/SD/objects/"+ randomType + ".png");
                o.scale = 0.5;
                o.x = o.width/2 + o.width * (k%3) * o.scale;
                o.y = -(o.height + 10) * heightIdx * o.scale;
                this._objects[i].addChild(o, STAND_OBJECT_ZORDER);
            }
        }
    },

    _displayCurrentName: function() {
        var self = this;

        if (this._nameNode)
            this._nameNode.removeFromParent();

        this._nameNode = new cc.Node();
        this._nameNode.setCascadeOpacityEnabled(true);
        this._nameNode.x = cc.winSize.width/2;
        this._nameNode.y = cc.winSize.height - 150;
        this._nameNode.scale = 0.5;
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
        this._currentObject = null;

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
            // node.setAnchorPoint(0, 0.5);
            node.setContentSize(150, 300);
            node.setCascadeOpacityEnabled(true);
            var heightIdx = 0;

            for (var k = 0; k < shownObjNames[i]; k++) {
                if (k >= 3 && k%3 == 0)
                    heightIdx++;
                var randomType = this._randomType();
                var o = new cc.Sprite("res/SD/objects/"+ randomType + ".png");
                o.scale = Math.min(node.width / (o.width*shownObjNames[i]), node.height / (o.height*shownObjNames[i]));
                // node.setContentSize(o.width * 3 *o.scale, o.height*shownObjNames[i] * o.scale);
                o.x = node.width/2 - o.width/2* o.scale + o.width * (k%3) * o.scale;
                o.y = node.height/2 - (o.height + 10) * heightIdx * o.scale;
                node.addChild(o, STAND_OBJECT_ZORDER);
            }
            node.name = shownObjNames[i];
            // node.scale = Math.min(150 / node.width, 300 / node.height) * Utils.screenRatioTo43();
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

    _randomType: function() {
        if (!this._currentObject) {
            this._currentObject = this._type;
            if (cc.isArray(this._type))
                this._currentObject = this._type[Math.floor(Math.random() * this._type.length)];

            return this._currentObject;
        } else
            return this._currentObject;
    },

    _fetchObjectData: function(data) {
        // cc.log("data: " + data);
        this._super(data[0]["third"]);

        this._type = data[0]["type"];
        this._data = data[0];

        // cc.log("_fetchObjectData: " + this._objectName);
        // cc.log("_fetchObjectData: " + this._keyObject);

        // this.setData(this._data);
    },

    updateProgressBar: function() {
        cc.log("ListeningTestLayer - updateProgressBar");
        var percent = this._nameIdx / this._names.length;
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._nameIdx);

        this._super();
    },
});

var ListeningTestForFruidditionScene = cc.Scene.extend({
    ctor: function(data, duration) {
        this._super();
        cc.log("listening: " + duration);
        var layer = new ListeningTestForFruiddition(data, duration);
        this.addChild(layer);
    }
});