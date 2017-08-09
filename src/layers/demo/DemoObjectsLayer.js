let NUM_OBJECTS_ON_SCREEN = 6;
let NUM_COLUMNS = 3;
var DemoObjectsLayer = cc.LayerColor.extend({
    _isListening: false,
    _adi: null,
    _resultLabel: null,
    _allObjects: [],
    _objectPositions: [],
    _currentObjects: [],
    _currentObjectNodes: [],

    ctor:function() {
        this._super(cc.color(255,255,255));
        DemoObjectsLayer._instance = this;

        this._addAdi();
        this._hudLayer = new ShopHUDLayer(this);
        this.addChild(this._hudLayer);
        this._hudLayer.setBackBtnCallback(function(){
            cc.director.replaceScene(new HomeScene());
        })

        let self = this;
        this._addListenButton();

        var lb = new cc.LabelBMFont("", res.Grown_Up_fnt);
        lb.x = this._adi.x;
        lb.y = this._adi.y - 20;
        lb.scale = 0.4;
        lb.opacity = 200;
        this.addChild(lb);
        this._resultLabel = lb;

        this._resetToIdle();

        // positions
        let xPadding = cc.winSize.width / (NUM_COLUMNS + 1);
        let xStart = xPadding / 2 + 40;
        let yPadding = 240;
        let yStart = yPadding / 2 - 20;
        for (let i = 0; i < NUM_OBJECTS_ON_SCREEN; i++) {
            let row = Math.floor(i / NUM_COLUMNS);
            let col = i % NUM_COLUMNS;

            this._objectPositions.push({ x: col * xPadding + xStart, y: row * yPadding + yStart });
            cc.log("object position: %d, %d", this._objectPositions[i].x, this._objectPositions[i].y);
        }

        NativeHelper.callNative("changeAudioRoute");
    },

    _resetToIdle: function() {
        this._isListening = false;
        this._adi.onStoppedListening();
        this._listenButton.enabled = true;
        this._listenButton.opacity = 255;

        this._resultLabel.setString("");

        this._adi.adiIdling();
    },

    onEnterTransitionDidFinish: function() {
        let self = this;
        this._super();
       
        if (! NativeHelper.callNative("hasGrantPermission", ["RECORD_AUDIO"])) {
            NativeHelper.setListener("RequestPermission", this);
            NativeHelper.callNative("requestPermission", ["RECORD_AUDIO"]);
        };

        cc.loader.loadJson(res.Room_Config_JSON, function(err, data) {
            if (!err) {
                self._allObjects = data.items;
                cc.log("we have %d objects", self._allObjects.length);
                self._allObjects = shuffle(self._allObjects);

                self._showObjects();
            }
        });

        // NativeHelper.callNative("changeSpeechLanguageArray", ["en", JSON.stringify(VERBS)]);
        SpeechRecognitionListener._instance = this;
    },

    _showObject: function(index, object) {
        cc.log("gonna show object: %s at index %d", JSON.stringify(object), index);
            
        let sprite = new cc.Sprite("#square.png");
        sprite.x = this._objectPositions[index].x;
        sprite.y = this._objectPositions[index].y;
        sprite.anchorX = 0;
        sprite.anchorY = 0;
        sprite.cascadeOpacity = true

        // object name
        let nameLabel = new cc.LabelBMFont(object.imageName, res.Grown_Up_fnt);
        nameLabel.x = sprite.width/2;
        nameLabel.y = 50;
        let scale = Math.min(0.5, (sprite.width - 40) / nameLabel.width);
        nameLabel.scale = scale;
        sprite.addChild(nameLabel);

        // object image
        var imgPath = "objects/" + object.imageName + ".png";
        let objectImageNode = new cc.Sprite(imgPath);
        objectImageNode.x = sprite.width/2;
        objectImageNode.y = 80;
        objectImageNode.anchorY = 0;
        scale = Math.min(Math.min(1, (sprite.width - 40) / objectImageNode.width), Math.min(1, (sprite.height - 100) / objectImageNode.height));
        objectImageNode.scale = scale;
        sprite.addChild(objectImageNode);

        sprite.opacity = 0;
        sprite.runAction(cc.sequence(cc.delayTime(1), cc.fadeIn(0.5)));

        this.addChild(sprite);

        this._currentObjectNodes[index] = sprite;
    },

    _setVocab: function() {
        let vocab = [];

        for (let i = 0; i < this._currentObjects.length; i++) {
            vocab.push(this._currentObjects[i].imageName);
        }


        // noise
        for (let i = 0; i < NUM_OBJECTS_ON_SCREEN; i++) {
            vocab.push(this._allObjects[i].imageName);
        }

        cc.log("_setVocab: %s", JSON.stringify(vocab));

        NativeHelper.callNative("changeSpeechLanguageArray", ["en", JSON.stringify(vocab)]);
    },

    _showObjects: function() {
        for (let i = 0; i < NUM_OBJECTS_ON_SCREEN; i++) {
            let object = this._allObjects.splice(0, 1)[0];
            this._currentObjects.push(object);
            
            this._showObject(i, object);
        }
        this._setVocab();
    },

    onExit: function() {
        NativeHelper.removeListener("RequestPermission");
        NativeHelper.callNative("changeAudioRoute");
        SpeechRecognitionListener.setupInstance();

        this._super();
    },

    _addListenButton: function(){
        var self = this;

        var button = new ccui.Button("btn_yellow.png", "btn_yellow-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - 30;
        button.anchorX = 1;
        button.y = 80;
        this.addChild(button, 2);
        this._listenButton = button;
        button.addClickEventListener(function() {
            NativeHelper.callNative("startSpeechRecognition");
            self._adi.onStartedListening();
            self._isListening = true;
            self._listenButton.enabled = false;
            self._listenButton.opacity = 100;
        });

        var icon = new cc.Sprite(res.Demo_mic_png);
        button.addChild(icon);
        icon.x = button.width/2;
        icon.y = button.height/2;
        icon.scale = 0.4;
    },

    onRequestPermission: function(succeed) {
        if (succeed) {

        }
        else {
            NativeHelper.callNative("showMessage", ["Permission Required", "Please enable Microphone permission in Device Setting for TSOG"]);
        }
    },

    onResult: function(recognizedWord) {
        cc.log("onResult: " + recognizedWord);
        this._resultLabel.setString(recognizedWord);
        this.schedule(this._resetToIdle, 2, 1);

        for (let i = 0; i < this._currentObjects.length; i++) {
            if (recognizedWord.toUpperCase() == this._currentObjects[i].imageName.toUpperCase()) {
                this._adi.adiJump();
                jsb.AudioEngine.play2d(res.Succeed_sfx);

                let currentObjectNode = this._currentObjectNodes[i];
                currentObjectNode.runAction(cc.sequence(
                    cc.fadeOut(1),
                    cc.callFunc(function() { currentObjectNode.removeFromParent(); } )
                ));

                let object = this._allObjects.splice(0, 1)[0];
                this._currentObjects[i] = object;
                this._showObject(i, object); // make new object node

                this._setVocab();
                return;
            }
        }

        // incorrect
        AudioManager.getInstance().play(res.incorrect_word_mp3);
        this._adi.adiShakeHead();
    },

    _addAdi: function() {
        var adidogNode = new AdiDogNode(true);
        adidogNode.setPosition(cc.p(80, 50));
        this.addChild(adidogNode);
        this._adi = adidogNode;
        adidogNode.scale = 0.5;
    },
});

var DemoObjectsScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new DemoObjectsLayer();
        this.addChild(layer);
    }
});

DemoObjectsLayer._instance = null;
DemoObjectsLayer.getInstance = function () {
  return DemoObjectsLayer._instance;
};
