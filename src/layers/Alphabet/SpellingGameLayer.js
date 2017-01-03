var kTagTrainSlotAction = 1;
var kTagMaxZOrder = 999999;
var SpellingGameLayer = TestLayer.extend({

    _slotScale: 0.4,
    _objectScale: 0.35,

    _activateObjects: [],
    _activateSlots: [],

    _deactivateSlots: [],
    _deactivateObjects: [],

    _objectsPosition: [],

    _currentObjectMoving: null,
    _currentObjectOriginPos: null,
    _currentObjectRotation: 0,
    _currentObjectOldZOrder: -1,
    _currentAvailableSlot: null,

    _didObjectAllowedToMove: false,
    _blockFlag: false,
    _data: [],
    _wordLength: 0,
    _currentLetters: [],
    _successLettersAmount: 0,
    _totalLetters: 0,

    ctor: function(objArr, isTestScene, timeForScene) {
        this._super();
        // this._data = this._filterObjectData(objArr);
        this._data = objArr;
        for (var i = 0; i < this._data.length; i++) {
            cc.log("Data %s", this._data[i]);
        }

        if (this._data.length == 0)
            return;

        this.setData(this._data);
        this._totalLetters = this._checkTotalLetters(this._data);
        this._currentLetters = localizeForWriting(this._data.shift()).split('');
        this._wordLength = this._currentLetters.length;
        this._setIsTestScene(isTestScene);
        this._addLetterSlots();
        this._addLetterObjects();

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
        this.playBackGroundMusic();
        this._hudLayer.setTotalGoals(this._totalLetters);
    },

    _checkTotalLetters: function(data){
        let totalLetter = 0;
        for (var i = 0; i < data.length; i++){
            totalLetter += data[i].length;
        }

        return totalLetter;
    },

    _removeAllObjects: function(){
        this._activateObjects.forEach((obj) => {
            this.removeChild(obj);
        });

        this._activateSlots.forEach((obj) => {
            this.removeChild(obj);
        });

        this._deactivateObjects.forEach((obj) => {
            this.removeChild(obj);
        });

        this._deactivateSlots.forEach((obj) => {
            this.removeChild(obj);
        });

        this._activateSlots = [];
        this._activateObjects = [];
        this._deactivateSlots = [];
        this._deactivateObjects = [];

        this._currentObjectMoving = null;
        this._currentAvailableSlot = null;
    },

    _checkAndLoadNextWords: function(){
        if (this._deactivateObjects.length == this._wordLength){
            // Finish one word
            if (this._data.length > 0){
                this._removeAllObjects();
                this._currentLetters = localizeForWriting(this._data.shift()).split('');
                cc.log("this._currentLetters: " +this._currentLetters);
                this._wordLength = this._currentLetters.length;

                this._addLetterSlots();
                this._addLetterObjects();
            }
            else {
                // Completed game
            }
        }
    },

    _generateSlotPosArray: function(letterAmount) {
        let blockAmount = (letterAmount % 2 == 0) ? 10 : 9;
        let widthScreen = cc.winSize.width;
        let blockWidth = Math.floor(widthScreen / blockAmount);
        let startBlockIndex = (blockAmount - letterAmount) / 2;
        let posArray = [];
        for (var i = 0; i < letterAmount; i++) {
            let posX = (startBlockIndex + i) * blockWidth + blockWidth / 2;
            posArray.push(cc.p(posX, 0));
        }

        return posArray;
    },

    _generateObjectPosArray: function(letterAmount) {
        let blockAmount = (letterAmount % 2 == 0) ? 10 : 9;
        let widthScreen = cc.winSize.width;
        let blockWidth = Math.floor(widthScreen / blockAmount);
        let posBlockArray = [];

        for (var i = 0; i < blockAmount; i++) {
            let posX = i * blockWidth + blockWidth / 2;
            posBlockArray.push(cc.p(posX, 0));
        }

        posBlockArray = shuffle(posBlockArray);

        let posObjectArray = [];

        for (var i = 0; i < letterAmount; i++) {
            posObjectArray.push(posBlockArray[i]);
        }

        return posObjectArray;
    },

    _addLetterSlots: function() {
        this._activateSlots = [];
        this._deactivateSlots = [];
        let posArray = this._generateSlotPosArray(this._wordLength);
        for (var i = 0; i < this._wordLength; i++) {
            var name = this._currentLetters[i].toUpperCase();
            var s = new cc.Sprite("#" + name + ".png");
            s.setAnchorPoint(0.5, 0);
            s.scale = this._slotScale;
            s.x = posArray[i].x;
            s.y = cc.winSize.height/2;
            s.tag = i;

            var shader = cc.GLProgram.createWithFilenames(res.PositionTextureColor_noMVP_vsh, res.SolidColor_fsh);
            s.shaderProgram = shader;
            var shaderState = cc.GLProgramState.getOrCreateWithGLProgram(shader);
            shaderState.setUniformInt("enabled", 0);
            s.color = cc.color(140, 130, 200);

            this.addChild(s);
            this._activateSlots.push(s);
        }
    },

    _addLetterObjects: function() {
        this._activateObjects = [];
        this._deactivateObjects = [];
        this._objectsPosition = [];
        let posArray = this._generateObjectPosArray(this._wordLength);
        for (var i = 0; i < this._wordLength; i++) {
            var name = this._currentLetters[i].toUpperCase();
            var s = new cc.Sprite("#" + name + ".png");
            s.scale = this._objectScale;
            s.x = posArray[i].x;
            s.y = s.height;
            s.tag = i;
            this.addChild(s);
            this._activateObjects.push(s);
            
            this._objectsPosition.push(s.getPosition());
        }

        this._randomLetterObjectPos();
    },

    _randomLetterObjectPos: function() {
        let tempObjectsPosArray = this._objectsPosition.slice(0);
        tempObjectsPosArray = shuffle(tempObjectsPosArray);

        for (var i = 0; i < this._activateObjects.length; i++) {
            let obj = this._activateObjects[i];
            let rdmRotation = Math.floor(Math.random() * 360);
            let newPos = tempObjectsPosArray[i];
            newPos.y = Utils.getRandomInt(100, cc.winSize.height / 2 - 100);
            obj.setPosition(newPos);
            obj.rotation = rdmRotation;
        }
    },

    onTouchBegan: function(touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockFlag)
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
                if (self._isSlotRunningAction)
                    return false;
                self._didObjectAllowedToMove = true;
                self._currentObjectMoving = obj;
                self._currentObjectOriginPos = obj.getPosition();
                self._currentObjectRotation = self._currentObjectMoving.rotation;
                self._currentObjectOldZOrder = self._currentObjectMoving.getLocalZOrder();
                self._currentObjectMoving.rotation = 0;
                self._currentObjectMoving.setLocalZOrder(kTagMaxZOrder);

                self._currentAvailableSlot = self._activateSlots[obj.tag];
                self._runSlotAction(self._currentAvailableSlot);
                self._runObjectPickUpAction(self._currentObjectMoving);
                return true;
            }
        });

        return true;
    },

    onTouchMoved: function(touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (!self._didObjectAllowedToMove)
            return;

        self._currentObjectMoving.setPosition(touchLoc);
    },

    onTouchEnded: function(touch, event) {
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
        var currSlotPos = self._currentAvailableSlot.getPosition();
        var currObjectPos = self._currentObjectMoving.getPosition();
        var distance = cc.pDistance(currObjectPos, currSlotPos);
        
        self._currentObjectMoving.setLocalZOrder(self._currentObjectOldZOrder);

        if (distance < 150) // move succeed
            self._handleObjectSucceedDrop();
        else// return object to origin pos
            self._handleObjectFailedDrop();
        self._renewPlayTurn();

        self._blockFlag = false; // unlock 
        if (self._activateSlots.length == 0) {
            self._blockFlag = true;
            self.doCompletedScene();
            // self._addDebugButton();
        }
    },

    _renewPlayTurn: function() {
        this._currentObjectMoving = null;
        this._currentObjectOriginPos = null;
        this._didObjectAllowedToMove = false;
        this._currentObjectRotation = 0;
        this._currentAvailableSlot = null;
        this._isSlotRunningAction = false;
        this._currentObjectOldZOrder = -1;
        this._redefineActiveObjectTag();
    },

    _redefineActiveObjectTag: function() {
        for (var i = 0; i < this._activateObjects.length; i++) {
            var obj = this._activateObjects[i];
            obj.tag = i;
        }

        for (var i = 0; i < this._activateSlots.length; i++) {
            var slot = this._activateSlots[i];
            slot.tag = i;
        }
    },

    _handleObjectSucceedDrop: function() {
        this.popGold(this._currentAvailableSlot.getPosition());

        jsb.AudioEngine.play2d(res.Succeed_sfx);
        this._currentObjectMoving.setAnchorPoint(0.5, 0);
        this._currentObjectMoving.setPosition(this._currentAvailableSlot.getPosition());
        this._runObjectDropAction(this._currentObjectMoving, this._slotScale);
        this._activateObjects.splice(this._currentObjectMoving.tag, 1);
        this._deactivateObjects.push(this._currentObjectMoving);
        
        // remove current slot from array
        this._activateSlots.splice(this._currentAvailableSlot.tag, 1);
        this._currentAvailableSlot.removeFromParent();

        this._successLettersAmount++;

        this._checkAndLoadNextWords();

        this.updateProgressBar();
    },

    _handleObjectFailedDrop: function() {
        jsb.AudioEngine.play2d(res.Failed_sfx);
        this._currentObjectMoving.setPosition(this._currentObjectOriginPos);
        this._runObjectDropAction(this._currentObjectMoving, this._objectScale);
        this._currentObjectMoving.rotation = this._currentObjectRotation;
        this._currentAvailableSlot.stopAllActions();
        this._currentAvailableSlot.color = cc.color(140, 130, 200);
       
    },

    _runSlotAction: function(slot) {
        if (this._isSlotRunningAction)
            return;

        this._isSlotRunningAction = true;
        var action = cc.repeatForever(
                cc.sequence(
                    cc.tintTo(0.25, 255, 100, 100),
                    cc.tintTo(0.25, 255, 255, 255)
                )
            );
        action.tag = kTagTrainSlotAction;
        slot.runAction(action);
    },

    updateProgressBar: function() {
        // cc.log("Progress (%d / %d)", this._successLettersAmount, this._totalLetters);
        var percent = this._successLettersAmount / this._totalLetters;
        
        this.setHUDProgressBarPercentage(percent);
        this.setHUDCurrentGoals(this._successLettersAmount);

        this._super();
    },

    _runObjectPickUpAction: function(obj) {
        if (this._isObjectRunningAction)
            return;
        this._isObjectRunningAction = true;
        obj.runAction(
            cc.sequence(
                cc.scaleTo(0.2, this._objectScale+0.15).easing(cc.easeElasticOut(0.8)),
                cc.scaleTo(0.2, this._objectScale)
            )
        );
    },

    _runObjectDropAction: function(obj, scale) {
        var self = this;
        obj.runAction(
            cc.sequence(
                cc.scaleTo(0.2, scale-0.05).easing(cc.easeBackIn(0.8)),
                cc.scaleTo(0.2, scale),
                cc.callFunc(function() {
                    self._isObjectRunningAction = false;
                })
            )
        );
    },

    _addDebugButton: function () {
        var b = new ccui.Button("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.x = cc.winSize.width-b.width/2 - 10;
        b.y = cc.winSize.height-b.height/2 - 10;
        b.setTitleText("RESET GAME");
        b.addClickEventListener(function() {
            cc.director.runScene(new SpellingGameScene());
        });
        this.addChild(b);
    },

    _filterObjectData: function(data) {
        let validObjectArray = [];

        for (var i = 0; i < data.length; i++){
            let object = GameObject.getInstance().findById(data[i]);
            if (object.length == 0)
                continue;

            if (object[0].type == "animal" || object[0].type == "object")
                validObjectArray.push(data[i]);
        }
        
        cc.log("validObjectArray: " + validObjectArray);
        return validObjectArray;
    },
});

var SpellingGameScene = cc.Scene.extend({
    ctor:function (data, isTestScene, timeForScene){
        this._super();

        var l = new SpellingGameLayer(data, isTestScene, timeForScene);
        this.addChild(l);
    }
});