var kTagSelfCardAnimation = 1;
var MAX_SLOT_ALLOWED = 5;

var SLOT_WIDTH = 195;
var SLOT_OFFSET_X = 50;

var OBJECT_DEFAULT_WIDTH = 100;
var OBJECT_DEFAULT_HEIGHT = 80

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

    ctor: function(objArr, isTestScene) {
        this._super();

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
    },

    _addCard: function() {
        this._downSide = "card_down.png";
        this._upSide = "card_up.png";
        this._card = new cc.Sprite("#" + this._downSide);
        this._card.scale = this._cardScale;
        this._card.x = cc.winSize.width/2;
        this._card.y = cc.winSize.height/2;
        this.addChild(this._card);
        //this._card.setSpriteFrame()

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
            s.scale = this._slotScale;
            s.x = slotCoordinates[i].x;
            s.y = slotCoordinates[i].y;
            this.addChild(s);
            this._activateSlots.push(s);
        }

        this._currentAvailableSlot = this._activateSlots[0];
    },

    _addObjects: function() {
        this._activateObjects = [];
        for (var i = 0; i < this._data.length; i++) {
            var objImageName = this._data[i].value;
            var objType = this._data[i].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var rdmObjPos = this._objectCoordinates[i];
            var obj = new cc.Sprite(imgPath);
            obj.tag = i;
            obj.scale = (obj.width > OBJECT_DEFAULT_WIDTH) ? OBJECT_DEFAULT_WIDTH/obj.width : OBJECT_DEFAULT_HEIGHT/obj.height;
            obj.x = rdmObjPos.x;
            obj.y = rdmObjPos.y;
            this.addChild(obj);
            this._activateObjects.push(obj);
        }
    },

    _doFlipCard: function (){
        this._didCardFlipped = true;
        // run action
        this._card.stopActionByTag(kTagSelfCardAnimation);

        var self = this;

        this._card.setSpriteFrame(this._upSide);
        this._fetchCardResult();
        this._addSlots();
        this._addObjects();
        // this.runAction(cc.sequence(
        //     cc.delayTime(3), 
        //     cc.callFunc(function (){
        //             cc.director.runScene(new CardGameScene(["cat","hat", "ant", "banana", "cow", "key"], true));
        //         })
        //     )
        // );
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
                coor["y"] = cc.rectGetMinY(this._card.getBoundingBox()) - 100*(i+1) *this._slotScale;
                coors.push(coor);
            }
        }
        cc.log("coors: " + JSON.stringify(coors));
        return coors;
    },

    onTouchBegan: function (touch, event) {
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();

        if (self._blockFlag)
            return false;

        self._deactivateObjects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc))
                return false;
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

        if (!self._didCardFlipped)
            return;

        if (!self._didObjectAllowedToMove)
            return;

        if (!self._currentAvailableSlot)
            return;

        // calculate distance of object and slot
        var currSlotPos = self._currentAvailableSlot.getPosition();
        var currObjectPos = self._currentObjectMoving.getPosition();
        var distance = cc.pDistance(currObjectPos, currSlotPos);

        if (distance < 100) { // move succeed
            self._currentObjectMoving.setPosition(currSlotPos);
            self._activateObjects.splice(self._currentObjectMoving.tag, 1);
            self._deactivateObjects.push(self._currentObjectMoving);
            // remove current slot
            self._currentAvailableSlot.removeFromParent();
            self._activateSlots.splice(0, 1);

            self._currentAvailableSlot = self._activateSlots[0];
        } else
            self._currentObjectMoving.setPosition(self._currentObjectOriginPos);

        self._currentObjectMoving = null;
        self._currentObjectOriginPos = null;
        self._didObjectAllowedToMove = null;

        if (self._activateSlots.length == 0)
            self._blockFlag = true;
    },
});

var CardGameScene = cc.Scene.extend({
    ctor: function(objArr, isTestScene) {
        this._super();

        var l = new CardGameLayer(objArr, isTestScene);
        this.addChild(l);
    }
})