var MAX_OBJECT_ALLOWED =  5;
var OBJECTS_ARRAY = ["fly", "fox", "pig", "puppy", "rat", "rabbit", "snail" ,"snake", "deer", "dog", "hat", "cat"];
var OBJECT_DEFAULT_WIDTH = 50;
var OBJECT_DEFAULT_HEIGHT = 50;

var MatchGameLayer = TestLayer.extend({
    amountObjectCanShow: null,
    _data: [],
    _objects: [],
    _objectsSlot: [],
    _disableObject : [],
    _deactivateObjects: [],
    _bloclFlag : false,

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
    },
    onTouchBegan: function(touch, event){

        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if(self._bloclFlag)
            return false;
        self._currentObjectMoving = null;
        self._currentObjectOriginPos = null;
        self.objectMatching = null;
        self._objects.forEach(function(obj){
            var bBox = obj.getBoundingBox();
            if (cc.rectContainsPoint(bBox, touchLoc)) {
                // cc.log("touch _activateObjects with tag: " + obj.tag);
                self._currentObjectMoving = obj;
                self._currentObjectOriginPos = obj.getPosition();
                cc.log(obj.tag);
                return true;
            };
        });
        return true;
    },

    onTouchMoved: function (touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        if(self._currentObjectMoving)
            self._currentObjectMoving.setPosition(touchLoc);
    },

    onTouchEnded: function(touch, event){
        var touchLoc = touch.getLocation();
        var self = event.getCurrentTarget();
        self._objectsSlot.forEach(function(obj){
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
        var self = this;
        if(this._currentObjectMoving.tag == this.objectMatching.tag) {
            var tag = this.objectMatching.tag;
            this._currentObjectMoving.setPosition(this.objectMatching.x - 60, this.objectMatching.y);
            this._objects.forEach(function(obj){
                if(obj.tag == tag){
                    var index = self._objects.indexOf(obj);
                    self._deactivateObjects.push(self._objects.splice(index,1));
                    self.createLabel(tag);
                    self._playSoundEffect(tag);
                };
            });
            cc.log("setPosition");
            self.updateProgressBar();
        }
        else {
            jsb.AudioEngine.play2d(res.Failed_sfx, false);
            this._currentObjectMoving.setPosition(this._currentObjectOriginPos);
        };
        this._currentObjectMoving = null;
        this._currentObjectOriginPos = null;
        this.objectMatching = null;
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
            this.addChild(obj);
            this._objects.push(obj);
            this.animateIn(obj,i);

        };
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
    }
});
MatchGameLayer._testData = null;
var MatchGameScene = cc.Scene.extend({
    ctor: function() {
        this._super();
        var l = new MatchGameLayer(OBJECTS_ARRAY);
        this.addChild(l);
    }
});