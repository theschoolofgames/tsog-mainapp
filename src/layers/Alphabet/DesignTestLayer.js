var DesignTestLayer = TestLayer.extend({
    _data: null,

    _currentObjectMoving: null,
    _currentAvailableSlot: null,
    _currentObjectOriginPos: null,

    _activateObjects: [],
    _deactivateObjects: [],
    _slotInfos: [],

    _objectScale: 0.5,
    _slotScale: 0.5,

    _didObjectAllowedToMove: false,

    _stage: 1,

    ctor: function(stage, isTestScene) {
        this._super();

        this._stage = stage || 1;
        // this._fetchObjectData(objArr); // TODO check if object array params is needed
        this._setIsTestScene(isTestScene);
        this._loadTmx();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);

        if (TSOG_DEBUG)
            this._addDebugButton(); // TODO refactor me
    },

    _addObjects: function() {
        this._activateObjects = [];
        this._deactivateObjects = [];
        var numberObjectShowup = this._slotInfos.length;
        // if (this._slotInfos.length > this._objectInfos.length)
        //     numberObjectShowup = this._objectInfos.length;
        for (var i = 0; i < numberObjectShowup; i++) {
            var objInfo = this._objectInfos[i];
            var slotInfo = this._slotInfos[i];
            var objImageName = slotInfo.name;
            var objType = slotInfo.type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var obj;
            if (objType == "number")
                obj = new cc.LabelBMFont(objImageName, res.CustomFont_fnt);
            else if (objType == "animal" || objType == "object")
                obj = new cc.Sprite(imgPath);
            else
                obj = new cc.Sprite("#" + objImageName + ".png");
            obj.tag = i;
            cc.log("add objects tag: " + obj.tag);
            obj.scale = (obj.width > DesignTestLayer.OBJECT_DEFAULT_WIDTH) ? DesignTestLayer.OBJECT_DEFAULT_WIDTH/obj.width : DesignTestLayer.OBJECT_DEFAULT_HEIGHT/obj.height;
            obj.x = objInfo.x * Utils.getScaleFactorTo16And9();
            obj.y = objInfo.y * Utils.getScaleFactorTo16And9();
            obj.rotation = slotInfo.rotation || 0;
            this.addChild(obj);
            this._activateObjects.push(obj);

            this.animateIn(obj, i);
        }
    },

    _addSlots: function() {
        this._activateSlots = [];
        for (var i = 0; i < this._slotInfos.length; i++) {
            var slotInfo = this._slotInfos[i];
            var imgPath = "#" + slotInfo.name +".png";
            var s = new cc.Sprite(imgPath);
            s.scaleX = (slotInfo.width/s.width)*this._slotScale;
            s.scaleY = (slotInfo.height/s.height)*this._slotScale;
            // s.width = slotInfo.width;
            // s.height = slotInfo.height;
            s.x = slotInfo.x;
            s.y = slotInfo.y;
            s.rotation = slotInfo.rotation || 0;
            this.addChild(s);
            this._activateSlots.push(s);
        }

        this._currentAvailableSlot = this._activateSlots[0];
        this._runSlotAction(this._currentAvailableSlot);
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

    _loadTmx: function() {
        this._objectInfos = [];
        this._slotInfos = [];
        var csf = cc.director.getContentScaleFactor();
        var tiledMap = new cc.TMXTiledMap();
        var stage = "stage" + this._stage + "Slots";

        tiledMap.initWithTMXFile(res.DesignGame_TMX);
        var objGroup = tiledMap.getObjectGroup("object");
        var slotGroup = tiledMap.getObjectGroup(stage);

        var self = this;
        objGroup.getObjects().forEach(function(obj) {
            self._objectInfos.push(obj);
        });
        slotGroup.getObjects().forEach(function(obj) {
            self._slotInfos.push(obj);
            // cc.log("rotation: " + obj.rotation);
        });

        // shuffle(this._objectInfos);
        this._addSlots();
        this._addObjects();
    },

    _fetchObjectData: function(objArr) {
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

DesignTestLayer.OBJECT_DEFAULT_WIDTH = 100;
DesignTestLayer.OBJECT_DEFAULT_HEIGHT = 50;

var DesignTestScene = cc.Scene.extend({
    ctor:function(stage, isTestScene) {
        this._super();

        var l = new DesignTestLayer(stage, isTestScene);
        this.addChild(l);
    }
});