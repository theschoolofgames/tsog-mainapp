var kTagSelfCardAnimation = 1;
var kTagSlotIdleAnimation = 2;
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

    _downSide: null,
    _upSide: null,

    _activateObjects: [],
    _deactivateObjects: [],
    _objectCoordinates: [],

    _cardScale: 0.7,
    _slotScale: 0.5,

    _flipCardResult: 0,

    _didCardFlipped: false,
    _didObjectAllowedToMove: false,

    timePlayed: 0,

    ctor: function(objArr, isTestScene, timePlayed) {
        this._super();
        // this._blockFlag = true;
        this.timePlayed = timePlayed || 0;
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
        this._activateSlots = [];
        var slotCoordinates = this._calcSlotCoordinates(this._flipCardResult)
        for (var i = 0; i < this._flipCardResult; i++) {
            var s = new cc.Sprite("#slot.png");
            s.scaleX = this._slotScale;
            s.x = slotCoordinates[i].x;
            s.y = slotCoordinates[i].y;
            this.addChild(s);
            this._activateSlots.push(s);
        }

        this._currentAvailableSlot = this._activateSlots[0];
        this._runSlotAction(this._currentAvailableSlot);
    },

    _addObjects: function() {
        this._activateObjects = [];
        this._deactivateObjects = [];
        var numberObjectShowup = this._data.length;
        if (this._data.length > this._objectCoordinates.length)
            numberObjectShowup = this._objectCoordinates.length;
        for (var i = 0; i < numberObjectShowup; i++) {
            var objImageName = this._data[i].value;
            var objType = this._data[i].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var rdmObjPos = this._objectCoordinates[i];
            var obj;
            if (objType == "number")
                obj = new cc.LabelBMFont(objImageName, res.CustomFont_fnt);
            else
                obj = new cc.Sprite(imgPath);
            obj.tag = i;
            cc.log("add objects tag: " + obj.tag);
            obj.scale = (obj.width > OBJECT_DEFAULT_WIDTH) ? OBJECT_DEFAULT_WIDTH/obj.width : OBJECT_DEFAULT_HEIGHT/obj.height;
            obj.x = rdmObjPos.x;
            obj.y = rdmObjPos.y;
            this.addChild(obj);
            this._activateObjects.push(obj);

            this.animateIn(obj, i);
        }
    },

    _addCardNumber: function (card){
        var n = new cc.LabelBMFont(this._flipCardResult, res.CustomFont_fnt); 
        n.x = card.width/2;
        n.y = card.height/2;
        card.addChild(n);
    },

    _doFlipCard: function (){
        this._didCardFlipped = true;
        // run action
        this._card.stopActionByTag(kTagSelfCardAnimation);
        var self = this;
        this._fetchCardResult();
        
        this._card.runAction(
            cc.sequence(    
                cc.spawn(
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
        );

        this._blockFlag = false;
    },

    _fetchCardResult: function() {
        this._flipCardResult = Math.ceil(Math.random() * MAX_SLOT_ALLOWED);
    },

    _fetchObjectData: function(data) {
        if (data)
            this._data = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                if (o[0])
                    return o[0];
                else
                    return id;
            });
        else
            this._data = [];
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
        var percent = this._deactivateObjects.length / this._flipCardResult;
        this._hudLayer.setProgressBarPercentage(percent);
        this._hudLayer.setProgressLabelStr(this._deactivateObjects.length, this._flipCardResult);

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
        var starGoal1 = Math.ceil(this._flipCardResult/3);
        var starGoal2 = Math.ceil(this._flipCardResult/3 * 2);
        var starGoal3 = this._flipCardResult;
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
                cc.log("touch _deactivateObjects");
                return true;
            }
        });

        self._activateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
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

        self._currentObjectMoving.setPosition(touchLoc);
    },

    onTouchEnded: function (touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        var cardBBox = self._card.getBoundingBox();

        var didTouchedCard = cc.rectContainsPoint(cardBBox, touchLoc);

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

        self._blockFlag = true; // block touch, processing
        // calculate distance of object and slot
        var currSlotPos = self._currentAvailableSlot.getPosition();
        var currObjectPos = self._currentObjectMoving.getPosition();
        var distance = cc.pDistance(currObjectPos, currSlotPos);

        if (distance < 100) { // move succeed
            self._currentObjectMoving.setPosition(currSlotPos);
            self._activateObjects.splice(self._currentObjectMoving.tag, 1);
            cc.log("tag: " + self._currentObjectMoving.tag);
            self._deactivateObjects.push(self._currentObjectMoving);
            // remove current slot
            self._currentAvailableSlot.removeFromParent();
            self._activateSlots.splice(0, 1);

            self._currentAvailableSlot = self._activateSlots[0];
            if (self._currentAvailableSlot)
                self._runSlotAction(self._currentAvailableSlot);
            self.updateProgressBar();
        } else
            self._currentObjectMoving.setPosition(self._currentObjectOriginPos);

        self._currentObjectMoving = null;
        self._currentObjectOriginPos = null;
        self._didObjectAllowedToMove = false;

        self._blockFlag = false; // unlock 
        if (self._activateSlots.length == 0) {
            self._blockFlag = true;
            if (self.timePlayed < 1)
                self.runAction(cc.sequence(
                    cc.delayTime(2),
                    cc.callFunc(function() {
                        cc.director.runScene(new CardGameScene(CardGameLayer._testData, true, 1)); 
                    })
                ));
        }
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