var MAX_OBJECT_ALLOWED =  5;
var OBJECTS_ARRAY = ["fly", "fox", "pig", "puppy", "rat", "rabbit", "snail" ,"snake", "deer", "dog", "hat", "cat"];
var OBJECT_DEFAULT_WIDTH = 50;
var OBJECT_DEFAULT_HEIGHT = 50;
var kTagSlotAction = 1;

var MatchGameLayer = TestLayer.extend({
    amountObjectCanShow: null,
    _data: [],
    _objects: [],
    _objectsSlot: [],
    _disableObject : [],
    _deactivateObjects: [],
    _bloclFlag : false,
    _timeWrong: 0,
    _index: 0,

    _oldZOrder: -1,
    _defaultSlotScale: 1,
    _slotHighlighting: false,
    _objectCompleted: 0,

    ctor: function(array) {
        this._super();
        this.amountObjectCanShow = MAX_SLOT_ALLOWED >= array.length ? array.length : MAX_SLOT_ALLOWED;
        data = this._fetchObjectData(array);
        for(var i = 0; i < data.length; i ++) {
            cc.log(this._data[Math.floor(i)]);
            cc.log(Math.floor(i/2));
            if(this._data[Math.floor(i/2)] == undefined)
                this._data.push([Math.floor(i/2)]);
            this._data[Math.floor(i/2)].push(data[i])
        };
        this.createLeftObjects();
        this.createRightObjects();
        cc.log("data: " + JSON.stringify(this._data));
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
        var self = this;
        this.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function(){
                self.runAnimation(self._objects[0]);
            })
        ));
    },
    onTouchBegan: function(touch, event){

        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if(self._bloclFlag)
            return false;
        self._currentObjectMoving = null;
        self._currentObjectOriginPos = null;
        self.objectMatching = null;
        // self._objects.forEach(function(obj){
        //     var bBox = obj.getBoundingBox();
        //     if (cc.rectContainsPoint(bBox, touchLoc)) {
        //         // cc.log("touch _activateObjects with tag: " + obj.tag);
        //         self._currentObjectMoving = obj;
        //         self._currentObjectOriginPos = obj.getPosition();
        //         cc.log(obj.tag);
        //         return true;
        //     };
        // });

        var obj = self._objects[self._index];
        var bBox = self._objects[self._index].getBoundingBox();
        if (cc.rectContainsPoint(bBox, touchLoc)) {
            // cc.log("touch _activateObjects with tag: " + obj.tag);
            self._oldZOrder = obj.getLocalZOrder();
            self._currentObjectMoving = obj;
            self._currentObjectMoving.setLocalZOrder(999);
            self._currentObjectOriginPos = obj.getPosition();
            cc.log(obj.tag);
            return true;
        };

        return true;
    },

    onTouchMoved: function (touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if(self._currentObjectMoving) {
            self._currentObjectMoving.setPosition(touchLoc);

            self._objectsSlot.forEach(function(obj) {
                if (self._currentObjectMoving.tag == obj.tag)
                    self._highlightSlot(obj);
            });
        }
    },

    onTouchEnded: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if (!self._currentObjectMoving)
            return;

        self._currentObjectMoving.setLocalZOrder(self._oldZOrder);
        self._oldZOrder = -1;
        self._objectsSlot.forEach(function(obj){
            obj.stopAllActions();
            obj.scale = self._currentObjScale;
            if(self._currentObjectMoving){
                var objectPos = obj.getPosition();
                var distance = cc.pDistance(touchLoc, objectPos);
                if (distance < 50){
                    self.objectMatching = obj;
                    cc.log(obj.tag);
                    self._handleObjectDrop();
                    return true;
                }
                else
                {
                    cc.log("else");
                    self._currentObjectMoving.setPosition(self._currentObjectOriginPos);
                    return true;
                }
            }
        });
        return true;
    },

    runAnimation: function(obj){
        this._currentObjScale = obj.scale;
        obj.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.3, this._currentObjScale + 0.1),
                    cc.scaleTo(0.2, this._currentObjScale),
                    cc.scaleTo(0.3, this._currentObjScale + 0.1),
                    cc.scaleTo(0.2, this._currentObjScale)
                )
            )
        );
    },
    _playSoundEffect: function(tag){
        this._bloclFlag = true;
        var self = this;
        var index = null;
        this._data.forEach(function(d){
            if(d[0] == tag)
                index = self._data.indexOf(d);
        });

        var objSoundNameLeft = this._data[index][1].value;
        var objTypeLeft = this._data[index][1].type;
        var soundPathLeft = "res/sounds/" + objTypeLeft + "s/" + objSoundNameLeft + ".mp3";
        var objSoundNameRight = this._data[index][2].value;
        var objTypeRight = this._data[index][2].type;
        var soundPathRight = "res/sounds/" + objTypeRight + "s/" + objSoundNameRight + ".mp3";

        this.runAction(cc.sequence(
            cc.callFunc(function(){
                jsb.AudioEngine.play2d(res.Succeed_sfx);
            }),
            cc.delayTime(0.5),
            cc.callFunc(function(){
                jsb.AudioEngine.play2d(soundPathLeft, false);
            }),
            cc.delayTime(1),
            cc.callFunc(function(){
                jsb.AudioEngine.play2d(soundPathRight, false);
            })
        ))
    },

    createLabel: function(index){
        this._bloclFlag = true;
        var self = this;
        var string = "";
        this._data.forEach(function(d){
            if(d[0] == index)
                string = d[1].value + " - " + d[2].value;
        })
        var lb = new cc.LabelBMFont(string, res.CustomFont_fnt);
        lb.scale = 2;
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height/2 + 80;
        this.addChild(lb);
        lb.runAction(cc.sequence(
            cc.callFunc(function() { 
                AnimatedEffect.create(lb, "sparkles", 0.02, SPARKLE_EFFECT_FRAMES, true)
            }), 
            cc.scaleTo(3, 2).easing(cc.easeElasticOut(0.5)),
            cc.delayTime(1),
            cc.callFunc(function(){
                lb.removeFromParent();
                self._bloclFlag = false;
            })
        ));
    },


    _handleObjectDrop: function(){
        cc.log("_timeWrong: " + this._timeWrong + "_index: " + this._index);
        var self = this;
        if(this._currentObjectMoving.tag == this.objectMatching.tag) {
            var tag = this.objectMatching.tag;
            this._currentObjectMoving.setPosition(this.objectMatching.x - 60, this.objectMatching.y);
            this._currentObjectMoving.stopAllActions();
            this._objects.forEach(function(obj){
                if(obj.tag == tag){
                    var index = self._objects.indexOf(obj);
                    self._deactivateObjects.push(self._objects.splice(index,1));
                    obj.scale = self._currentObjScale;
                    self.createLabel(tag);
                    self._playSoundEffect(tag);
                    this._timeWrong = 0;
                    if(self._objects.length > 0)
                        self.runAnimation(self._objects[self._index]);
                };
            });
            cc.log("setPosition");
            self.updateProgressBar();
            this._objectCompleted++;
            this._checkCompletedScene();
        }
        else {
            this._timeWrong +=1;
            if(this._timeWrong == 3){
                self._objects[this._index].scale = self._currentObjScale;
                self._objects.splice(this._index,1)
                this._timeWrong = 0;
                self.runAnimation(self._objects[self._index]);
            }
            jsb.AudioEngine.play2d(res.Failed_sfx, false);
            this._currentObjectMoving.setPosition(this._currentObjectOriginPos);
        };

        this._currentObjectMoving = null;
        this._currentObjectOriginPos = null;
        this.objectMatching = null;
        this._slotHighlighting = false;
    },

    createLeftObjects:function(){
        for(var i = 0; i < this._data.length; i ++) {
            var objImageName = this._data[i][1].value;
            var objType = this._data[i][1].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var obj = new cc.Sprite(imgPath);
            obj.x = 100;
            obj.y = cc.winSize.height - 90 * i - 100;
            obj.tag = this._data[i][0];
            cc.log("Left: " +obj.tag );
            obj.scale = (obj.width > OBJECT_DEFAULT_WIDTH) ? OBJECT_DEFAULT_WIDTH/obj.width : OBJECT_DEFAULT_HEIGHT/obj.height;
            this._objects.push(obj);
            
            this.addChild(obj);
            this.animateIn(obj,i);
        };
        cc.log("scale: " + this._currentObjScale);
    },

    createRightObjects: function(){
        var data = this._data;
        data  = shuffle(data);
        cc.log("DAta: " + JSON.stringify(this._data));
        for(var i = 0; i < data.length; i ++) {
            var objImageName = this._data[i][2].value;
            var objType = this._data[i][2].type;
            var imgPath = objType + "s/" + objImageName + ".png";
            var obj = new cc.Sprite(imgPath);
            obj.x = cc.winSize.width - 100;
            obj.y = cc.winSize.height - 90 * i - 100;
            obj.tag = data[i][0];
            cc.log("Right: " +obj.tag );
            obj.scale = (obj.width > OBJECT_DEFAULT_WIDTH) ? OBJECT_DEFAULT_WIDTH/obj.width : OBJECT_DEFAULT_HEIGHT/obj.height;
            this.addChild(obj);
            this._objectsSlot.push(obj);
            this.animateIn(obj,i);
        };
    },
    _fetchObjectData: function(data) {
        // if (!this._isTestScene)
        //     data = JSON.parse(data);
        if (data)
            var dataReturn = data.map(function(id) {
                var o = GameObject.getInstance().findById(id);
                cc.log("o" + JSON.stringify(o));
                if (o[0]) {
                    return o[0];
                }
                else {
                    return id;
                }
            });
        else
            var dataReturn = [];

        this.setData(data);
        return dataReturn;
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
                cc.scaleTo(0.7, 0.5).easing(cc.easeElasticOut(0.9))
            )
        );
    },
    updateProgressBar: function() {
        var percent = this._deactivateObjects.length / this._data.length;
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
        var starGoal1 = Math.ceil(this._data.length/3);
        var starGoal2 = Math.ceil(this._data.length/3 * 2);
        var starGoal3 = this._data.length;
        return {starGoal1: starGoal1,
                starGoal2: starGoal2, 
                starGoal3: starGoal3};
    },

    _highlightSlot: function(obj) {
        if (this._slotHighlighting)
            return;
        this._slotHighlighting = true;
        this._defaultSlotScale = obj.scale;
        var action = cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.25, this._defaultSlotScale+0.1),
                cc.scaleTo(0.25, this._defaultSlotScale),
                cc.scaleTo(0.25, this._defaultSlotScale+0.1),
                cc.scaleTo(0.25, this._defaultSlotScale)
            )
        );
        action.tag = kTagSlotAction;
        obj.runAction(action);
    },

    _checkCompletedScene: function() {
        cc.log("this._objectCompleted: " + this._objectCompleted);
        if (this._objectCompleted >= Math.floor(OBJECTS_ARRAY.length/2))
            this._completedScene();
    },

    _completedScene: function() {
        this.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function() {
                cc.director.replaceScene(new GameTestScene());
            })
        ));
    },
});
MatchGameLayer._testData = null;
var MatchGameScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        var l = new MatchGameLayer(OBJECTS_ARRAY);
        this.addChild(l);
    }
});