var SpeakingTestLayer = cc.LayerColor.extend({
    _objectsArray: [],
    _callback: null,
    _currentObjectShowUp: null,
    _currentObjectShowUpId: 0,

    listener: null,

    ctor: function(objectsArray, callback) {
        this._super(cc.color(0, 0, 0, 140));

        cc.log("objectsArray: " + JSON.stringify(objectsArray));
        this._callback = callback;
        this._objectsArray = objectsArray || [];
    },

    onEnter: function() {
        this._super();

        cc.log("this.listener: " + this.listener);
        
        this._addAdiDog();

        this.showNextObject(0);
    },

    _addAdiDog: function() {
        var adiDog = new AdiDogNode();
        adiDog.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));
        this.addChild(adiDog);
    },

    showNextObject: function(index) {
        if (this._currentObjectShowUpId >= this._objectsArray.length)
            callback();

        if (this._currentObjectShowUp) {
            this._currentObjectShowUp.removeFromParent();
            this._currentObjectShowUp = null;
        }
        var objectName = "";
        if (cc.director.getRunningScene().name == "room")
            objectName = "things/" + this._objectsArray[index].name + ".png";
        else if (cc.director.getRunningScene().name == "forest")
            objectName = "animals/" + this._objectsArray[index].name + ".png";

        this._currentObjectShowUp = new cc.Sprite(objectName);
        this._currentObjectShowUp.x = cc.winSize.width/3*2;
        this._currentObjectShowUp.y = cc.winSize.height/2;

        this.addChild(this._currentObjectShowUp);

        // this.listener.createWarnLabel(this._objectsArray[index].name);
        AnimatedEffect.create(this._currentObjectShowUp, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
        this._currentObjectShowUpId +=1;
    },

});