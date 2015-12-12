var SpeakingTestLayer = cc.LayerColor.extend({
    _objectsArray: [],
    _callback: null,
    _currentObjectShowUp: null,
    _itemArray: [],
    _soundName: null,

    currentObjectShowUpId: 0,
    currentObjectName: null,
    listener: null,

    ctor: function(objectsArray, callback) {
        this._super(cc.color(0, 0, 0, 200));

        this._itemArray = ["ant", "bear", "bee", "bird", "camel", "cat", "cheetah", "chicken", "cow", "crocodile", "deer", "dolphin", "duck", "eagle", "elephant", "fish", "fly", "fox", "frog", "giraffe", "goat", "goldfish", "hamster", "horse", "insect", "kangaroo", "kitten", "lion", "lobster", "monkey", "nest", "octopus", "owl", "panda", "pig", "puppy", "rabbit", "rat", "scorpion", "seal", "shark", "sheep", "snail", "snake", "squirrel", "tiger", "turtle", "wolf", "zebr"]
            .concat(["abacus","apple","banana","book","chair","computer","desk","duster","egg","eraser","feather","flag","gift","grape","hat","insect","jar","joker","juice","key","kite","lamp","lemon","map","medicine","nail","nest","onion","orange","pen","pencils","potato","queen","raspberry","sock","strawberry","table","tomato","towel","toytrain","umbrella","uniform","vegetable","vehicle","watch","watermelon","xylophone"]);

        this._callback = callback;
        this._objectsArray = objectsArray || [];
        cc.log("this._objectsArray" + JSON.stringify(this._objectsArray));
        SpeechRecognitionListener.getInstance().setSpeakingLayer(this);
    },

    onEnter: function() {
        this._super();

        cc.log("this.listener: " + this.listener);
        
        this._addAdiDog();

        this.showNextObject();
        this.startSpeechRecognizing();
    },

    _addAdiDog: function() {
        var adiDog = new AdiDogNode();
        adiDog.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));
        this.addChild(adiDog);
    },

    showNextObject: function() {
        if (this._currentObjectShowUp) {
            this._currentObjectShowUp.removeFromParent();
            this._currentObjectShowUp = null;
        }
        var objectName = "";
        this._soundName = "";
        if (cc.director.getRunningScene().name == "room") {
            objectName = "things/" + this._objectsArray[this.currentObjectShowUpId].name;
            this._soundName = "res/sounds/" + objectName + "-2.mp3";
        }
        else if (cc.director.getRunningScene().name == "forest") {
            objectName = "animals/" + this._objectsArray[this.currentObjectShowUpId].name;
            this._soundName = "res/sounds/" + objectName + ".mp3";
        }
        
        this.playObjectSound();
        
        this.currentObjectName = this._objectsArray[this.currentObjectShowUpId].name;

        this._currentObjectShowUp = new cc.Sprite(objectName + ".png");
        this._currentObjectShowUp.x = cc.winSize.width/3*2;
        this._currentObjectShowUp.y = cc.winSize.height/2;

        this.addChild(this._currentObjectShowUp);
        // this.listener.createWarnLabel(this._objectsArray[index].name);
        AnimatedEffect.create(this._currentObjectShowUp, "smoke", SMOKE_EFFECT_DELAY, SMOKE_EFFECT_FRAMES, false);
        this.currentObjectShowUpId +=1;
    },

    playObjectSound: function() {
        cc.audioEngine.playEffect(this._soundName);
    },

    checkCompleted: function() {
        if (this.currentObjectShowUpId >= this._objectsArray.length){
            cc.log("on callback");
            this._callback();
            return true;
        }
    },

    checkTimeUp: function() {
        var startTime = KVDatabase.getInstance().getInt("timeUp", 0);
        var now = Date.now()/1000;
        return (now - startTime) >= 2;
    },

    startSpeechRecognizing: function() {
        var self = this;
        this.runAction(
            cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function() {
                    NativeHelper.callNative("startSpeechRecognition", [JSON.stringify(self._itemArray), 5000]);
                    KVDatabase.getInstance().set("timeUp", Date.now()/1000);
                })
            )
        )
    }

});