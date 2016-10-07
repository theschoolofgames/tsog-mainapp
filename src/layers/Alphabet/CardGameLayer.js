var kTagSelfCardAnimation = 1;
var kTagSlotIdleAnimation = 2;
// var MAX_OBJECT_ALLOWED = 5;
var MAX_OBJECT_ALLOWED = 50;
var MAX_SLOT_ALLOWED = 5;
var SLOT_WIDTH = 195;
var SLOT_OFFSET_X = 100;

var OBJECT_DEFAULT_WIDTH = 100;
var OBJECT_DEFAULT_HEIGHT = 70;

var CardGameLayer = TestLayer.extend({
    _data: null,
    _card: null,

    _currentObjectMoving: null,
    _currentAvailableSlot: null,
    _currentObjectOriginPos: null,
    _currentObjectOder: 1,

    _downSide: null,
    _upSide: null,
    _objectUnavailable: [],
    _activateObjects: [],
    _deactivateObjects: [],
    _objectCoordinates: [],

    _numberOfObjectWillShow: 0,

    _cardScale: 0.7,
    _slotScale: 0.5,
    _activateSlots: [],

    _flipCardResult: 0,
    _amountObjectShow: 0,

    _didCardFlipped: false,
    _didObjectAllowedToMove: false,

    amountObjectCanShow: 0,

    timePlayed: 0,
    timePlayedOderSound: 0,

    ctor: function(objArr, isTestScene, timePlayed) {
        this._super();
        // this._blockFlag = true;
        this.timePlayed = timePlayed || 0;
        this._activateObjects = [];
        this._deactivateObjects = [];
        this.amountObjectCanShow = MAX_SLOT_ALLOWED >= objArr.length ? objArr.length : MAX_SLOT_ALLOWED;
        this._fetchObjectData(objArr);
        this._setIsTestScene(isTestScene);
        this._loadTmx();
        this._addCard();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);

        // if (TSOG_DEBUG)
        //     this._addDebugButton();
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    _addCard: function() {
        this._downSide = "card_down.png";
        this._upSide = "card_up.png";
        this._card = new cc.Sprite("#" + this._downSide);
        this._card.scale = this._cardScale;
        this._card.x = cc.winSize.width/2;
        this._card.y = cc.winSize.height/2;
        this.addChild(this._card);

        // run self animation
        var action = cc.repeatForever(
                cc.sequence(
                    cc.delayTime(2),
                    cc.scaleTo(0.1, this._cardScale+0.05, this._cardScale-0.05),
                    cc.scaleTo(0.1, this._cardScale),
                    cc.scaleTo(0.1, this._cardScale+0.05, this._cardScale-0.05),
                    cc.scaleTo(0.1, this._cardScale)
                )
            );
        action.tag = kTagSelfCardAnimation;
        this._card.runAction(action);
    },

    _addSlots: function() {
        cc.log("_activateSlots: " + this._activateSlots.length);
        if(this._activateSlots){
            this._activateSlots.forEach(function(obj){
                obj.removeFromParent()
            });
        };
        this._activateSlots = [];
        var slotCoordinates = this._calcSlotCoordinates(this._amountObjectShow)
        for (var i = 0; i < this._amountObjectShow; i++) {
            var s = new cc.Sprite("#slot.png");
            s.scaleX = this._slotScale;
            s.x = slotCoordinates[i].x;
            s.y = slotCoordinates[i].y;
            this.addChild(s);
            this._activateSlots.push(s);
        }
        cc.log("SlOT: "+ this._activateSlots.length);
        this._currentAvailableSlot = this._activateSlots[0];
        this._runSlotAction(this._currentAvailableSlot);
    },

    _addObjects: function() {
        if(this._activateObjects){
            this._activateObjects.forEach(function(obj){
                obj.removeFromParent()
            });
            this._activateObjects = [];
        };
        if(this._deactivateObjects){
            this._deactivateObjects.forEach(function(obj){
                obj.removeFromParent()
            });
            this._deactivateObjects = [];
        };
        var numberObjectShowup = this._data.length;
        if (this._data.length > this._objectCoordinates.length)
            numberObjectShowup = this._objectCoordinates.length;

        // cc.log("data value: " + JSON.stringify(this._data));
        for (var i = 0; i < numberObjectShowup; i++) {
            var objImageName = this._data[i].value;
            var objType = this._data[i].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var rdmObjPos = this._objectCoordinates[i];
            var obj;
            // cc.log("imagepath" + imgPath);
            // cc.log("objType" + objType);
            // cc.log("objImageName" + objImageName);
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
            // cc.log("add objects tag: " + obj.tag);
            obj.scale = (obj.width > OBJECT_DEFAULT_WIDTH) ? OBJECT_DEFAULT_WIDTH/obj.width : OBJECT_DEFAULT_HEIGHT/obj.height;
            obj.x = rdmObjPos.x * Utils.getScaleFactorTo16And9();
            obj.y = rdmObjPos.y * Utils.getScaleFactorTo16And9();
            this.addChild(obj);
            this._activateObjects.push(obj);

            this.animateIn(obj, i);
        }
        // this._objectUnavailable = this._activateObjects;
    },

    _addCardNumber: function (card){
        var n = new cc.LabelBMFont(this._numberOfObjectWillShow, res.CustomFont_fnt); 
        n.x = card.width/2;
        n.y = card.height/2;
        card.addChild(n);
    },

    _doFlipCard: function (){
        this._didCardFlipped = true;
        // run action
        this._card.stopActionByTag(kTagSelfCardAnimation);
        var self = this;
        if(!this._flipCardResult) {
            cc.log("_doFlipCard");
            this._fetchCardResult();
            
            var cardPos = this._card.getPosition();
            var bezier = cc.bezierTo(1, [cardPos, cc.p(cardPos.x, cardPos.y + 100), cardPos]);
            
            this._card.runAction(
                cc.sequence(    
                    cc.spawn(
                        // bezier,
                        cc.scaleTo(0.25, 0, this._cardScale),
                        cc.moveBy(0.25, 0, 10)
                    ),
                    cc.callFunc(function() {
                        self._card.setSpriteFrame(self._upSide);
                    }),
                    cc.spawn(
                        cc.scaleTo(0.25, this._cardScale),
                        cc.moveBy(0.25, 0, -10)
                    ),
                    cc.callFunc(function() {
                        self._addCardNumber(self._card);
                        jsb.AudioEngine.play2d( "sounds/smoke.mp3"),
                        AnimatedEffect.create(self._card, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false, 2);
                        self._addSlots();
                        self._addObjects();
                    })
                )
            )
        } else {
            jsb.AudioEngine.play2d("sounds/smoke.mp3"),
            self._addSlots();       
            self._addObjects();
            this._blockFlag = false;
        }

    },

    _showNextObjects: function(){
        // run action
        cc.log("_showNextObjects");
        this.calcShowObjectAmount();
        this._addSlots();
        this._addObjects();
        this._loadTmx();
        this._blockFlag = false;
    },

    _fetchCardResult: function() {
        this._flipCardResult = Math.ceil(Math.random() * MAX_OBJECT_ALLOWED);
        this._numberOfObjectWillShow = this._flipCardResult;
        this.calcShowObjectAmount();
    },

    calcShowObjectAmount: function(){
        if(this._flipCardResult >= this.amountObjectCanShow) {
            this._amountObjectShow = this.amountObjectCanShow;
            this._flipCardResult -= this.amountObjectCanShow;
        }
        else 
        {
            this._amountObjectShow = this._flipCardResult;
            this._flipCardResult -=  this._amountObjectShow;
        };

    },

    _fetchObjectData: function(data) {
        // if (!this._isTestScene)
        //     data = JSON.parse(data);
        if (data)
            this._data = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                // cc.log("o" + JSON.stringify(o));
                if (o[0]) {
                    cc.log("o[0]: " + JSON.stringify(o[0]));
                    // cc.log("return o[0]");
                    return o[0];
                } else {
                    cc.log("return Id");
                    return id;
                }
            });
        else
            this._data = [];

        this.setData(JSON.stringify(this._data));
        // cc.log("data after map: " + JSON.stringify(this._data));
    },

    _loadTmx: function() {
        this._objectCoordinates = [];
        var csf = cc.director.getContentScaleFactor();
        var tiledMap = new cc.TMXTiledMap();
        tiledMap.initWithTMXFile(res.CardGame_TMX);

        var group = tiledMap.getObjectGroup("objectCoordinates");
        var self = this;
        group.getObjects().forEach(function (obj) {
            self._objectCoordinates.push({
                "x": obj.x,
                "y": obj.y
            }); 
        });
        shuffle(this._objectCoordinates);
    },

    _calcSlotCoordinates: function (totalSlots) {
        cc.log("totalSlots: " + totalSlots);
        var coors = [];
        var maxLine = Math.max(Math.floor(totalSlots/2), 1);
        

        for (var i = 0; i < maxLine; i++) {
            var maxSlotPerLine = (totalSlots >= 3) ? 3 : totalSlots;
            for (var j = 0; j < maxSlotPerLine; j++) {
                var coor = {};
                coor["x"] = cc.winSize.width/2 + (SLOT_WIDTH + SLOT_OFFSET_X)*(j - 1 + i/2)*this._slotScale;
                coor["y"] = cc.rectGetMinY(this._card.getBoundingBox()) - 150*(i+1) *this._slotScale;
                coors.push(coor);
            }
        }
        cc.log("coors: " + JSON.stringify(coors));
        return coors;
    },

    animateIn: function(obj, delay) {
        obj.scale = 0;
        var self = this;
        obj.runAction(
            cc.sequence(
                cc.delayTime(delay * ANIMATE_DELAY_TIME),
                cc.callFunc(function() {
                    jsb.AudioEngine.play2d( "sounds/smoke.mp3"),
                    AnimatedEffect.create(obj, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
                }),
                cc.scaleTo(0.7, this._slotScale).easing(cc.easeElasticOut(0.9))
            )
        );
    },

    _runSlotAction: function(slot) {
        var action = cc.repeatForever(
            cc.sequence(
                cc.scaleTo(1, this._slotScale+0.1).easing(cc.easeSineOut()),
                cc.scaleTo(1, this._slotScale-0.05).easing(cc.easeSineOut())
            )
        );
        action.tag = kTagSlotIdleAnimation;
        slot.runAction(action);
    },

    updateProgressBar: function() {
        var percent = this._deactivateObjects.length / this._numberOfObjectWillShow;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._deactivateObjects.length, this._numberOfObjectWillShow);

        var starEarned = 0;
        var objectCorrected = this._deactivateObjects.length;
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
        var starGoal1 = Math.ceil(this._numberOfObjectWillShow/3);
        var starGoal2 = Math.ceil(this._numberOfObjectWillShow/3 * 2);
        var starGoal3 = this._numberOfObjectWillShow;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },

    onTouchBegan: function (touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockFlag)
            return false;

        self._deactivateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
                self._didObjectAllowedToMove = false;
                // cc.log("touch _deactivateObjects with tag : " + obj.tag);
                return true;
            }
        });

        self._activateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
                // cc.log("touch _activateObjects with tag: " + obj.tag);
                self._didObjectAllowedToMove = true;
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
        var cardBBox = self._card.getBoundingBox();
        self.timePlayedOderSound = 0;
        var didTouchedCard = cc.rectContainsPoint(cardBBox, touchLoc);
        // if(self._flipCardResult == 0){
        //     cc.log("Dont Show next");
            if (didTouchedCard && !self._didCardFlipped) {
                self._doFlipCard();
                return;
            }

            if (self._blockFlag)
                return;

            if (!self._didObjectAllowedToMove)
                return;

            if (!self._currentAvailableSlot)
                return;
        // };
        

        self._blockFlag = true; // block touch, processing
        // calculate distance of object and slot
        var currSlotPos = self._currentAvailableSlot.getPosition();
        var currObjectPos = self._currentObjectMoving.getPosition();
        var distance = cc.pDistance(currObjectPos, currSlotPos);

        if (distance < 100) { // move succeed
            self._handleObjectSucceedDrop();
            if(self._activateSlots.length == 0 && self._flipCardResult > 0)
                self._showNextObjects();
        } else // return object to origin pos
            self._currentObjectMoving.setPosition(self._currentObjectOriginPos);

        self._renewPlayTurn();

        self._blockFlag = false; // unlock 
        cc.log("OBJECT ACTIVATE: " + self._activateSlots.length);
        if (self._activateSlots.length == 0) {
            self._blockFlag = true;
            if (self.timePlayed < 1)
                self.runAction(cc.sequence(
                    cc.delayTime(2),
                    cc.callFunc(function() {
                        // cc.director.runScene(new CardGameScene(CardGameLayer._testData, true, 1)); 
                        self._moveToNextScene();
                    })
                ));
        }

        // cc.log("_activateObjects: " + self._activateObjects);
        // cc.log("_deactivateObjects: " + self._deactivateObjects);
    },

    _playObjectOderSound: function(){
        if(this.timePlayedOderSound < 1)
            jsb.AudioEngine.play2d("res/sounds/numbers/" + this._currentObjectOder + ".mp3", false);
        this.timePlayedOderSound += 1;
    },

    _handleObjectSucceedDrop: function() {
        var self = this;
        var succeedAudioId = jsb.AudioEngine.play2d(res.Succeed_sfx);
        var path = "res/sounds/numbers/" + this._currentObjectOder + ".mp3";
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function() {
                if (jsb.fileUtils.isFileExist(path))
                    jsb.AudioEngine.play2d(path, false);
            }.bind(this))
        ));

        this._currentObjectMoving.setPosition(this._currentAvailableSlot.getPosition());
        this._activateObjects.splice(this._currentObjectMoving.tag, 1)
        this._deactivateObjects.push(this._currentObjectMoving);

        //set for playSoundObjectOder
        this._currentObjectOder += 1;
        
        // remove current slot
        this._currentAvailableSlot.removeFromParent();
        this._activateSlots.splice(0, 1);

        this._currentAvailableSlot = this._activateSlots[0];
        if (this._currentAvailableSlot)
            this._runSlotAction(this._currentAvailableSlot);
        this.updateProgressBar();
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

    _addDebugButton: function () {
        var b = new ccui.Button("table-name.png", "", "", ccui.Widget.PLIST_TEXTURE);
        b.x = cc.winSize.width-b.width/2 - 10;
        b.y = cc.winSize.height-b.height/2 - 10;
        b.setTitleText("RESET GAME");
        b.addClickEventListener(function() {
            cc.director.runScene(new CardGameScene(CardGameLayer._testData, true)); 
        });
        this.addChild(b);
    },
});
CardGameLayer._testData = null;
var CardGameScene = cc.Scene.extend({
    ctor: function(objArr, isTestScene, timePlayed) {
        this._super();
        CardGameLayer._testData = objArr;
        var l = new CardGameLayer(objArr, isTestScene, timePlayed);
        this.addChild(l);
    }
})