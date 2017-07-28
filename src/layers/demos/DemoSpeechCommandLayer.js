let VERBS = ["sit", "dance", "jump", "fly", "walk", "swim", "talk", "sleep", "eat", "love", "wave"];
var DemoSpeechCommandLayer = cc.LayerColor.extend({
    _isListening: false,
    _adi: null,
    _resultLabel: null,

    ctor:function() {
        this._super(cc.color(255,255,255));
        DemoSpeechCommandLayer._instance = this;

        this._addAdi();
        this._hudLayer = new ShopHUDLayer(this);
        this.addChild(this._hudLayer);
        this._hudLayer.setBackBtnCallback(function(){
            cc.director.replaceScene(new HomeScene());
        })

        let self = this;

        this._animations = [
            {
                text: "CoreML",
                func: function(){
                    NativeHelper.callNative("showCoreMLDemo");
                }
            },
            {
                text: "SIT",
                func: function(){
                    self._adi.adiSitdown();
                    self.schedule(self._resetToIdle, 2, 1);
                }
            },
            {
                text: "FLY",
                func: function(){
                    self._adi.adiSneeze();
                    self.schedule(self._resetToIdle, 2, 1);
                }
            },
            {
                text: "DANCE",
                func: function(){
                    self._adi.adiHifi();
                    self.schedule(self._resetToIdle, 2, 1);
                }
            },
            {
                text: "JUMP",
                func: function(){
                    self._adi.adiJump();
                    self.schedule(self._resetToIdle, 2, 1);
                }
            },
        ];

        this._addAnimationButtons();
        this._addListenButton();

        var lb = new cc.LabelBMFont("", res.Grown_Up_fnt);
        lb.x = cc.winSize.width/2;
        lb.y = cc.winSize.height - 100;
        this.addChild(lb);
        this._resultLabel = lb;

        this._resetToIdle();

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
        this._super();
       
        if (! NativeHelper.callNative("hasGrantPermission", ["RECORD_AUDIO"])) {
            NativeHelper.setListener("RequestPermission", this);
            NativeHelper.callNative("requestPermission", ["RECORD_AUDIO"]);
        };

        NativeHelper.callNative("changeSpeechLanguageArray", ["en", JSON.stringify(VERBS)]);
        SpeechRecognitionListener._instance = this;
    },

    onExit: function() {
        NativeHelper.removeListener("RequestPermission");
        NativeHelper.callNative("changeAudioRoute");
        SpeechRecognitionListener.setupInstance();

        this._super();
    },

    _addAnimationButtons: function(){
        var self = this;

        for (let i = 0; i < this._animations.length; i++) {
            var button = new ccui.Button("res/SD/grownup/button-grown-up.png", "res/SD/grownup/button-grown-up-pressed.png", "");
            button.x = 20;
            button.anchorX = 0;
            button.y = 100 + i * 60;
            button.cascadeOpacity = true;
            this.addChild(button, 2);
            button.addClickEventListener(this._animations[i].func);

            var text = this._animations[i].text;
            var lb = new cc.LabelBMFont(text, res.Grown_Up_fnt);
            lb.scale = 0.3;
            lb.x = button.width/2;
            lb.y = button.height/2 + 3;
            button.addChild(lb);
        }
    },

    _addListenButton: function(){
        var self = this;

        var button = new ccui.Button("btn_yellow.png", "btn_yellow-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        button.x = cc.winSize.width - 30;
        button.anchorX = 1;
        button.y =  100;
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

        for (let i = 0; i < this._animations.length; i++) {
            if (recognizedWord == this._animations[i].text) {
                this._animations[i].func();
                jsb.AudioEngine.play2d(res.Succeed_sfx);
                return;
            }
        }

        // incorrect
        AudioManager.getInstance().play(res.incorrect_word_mp3);
        this._adi.adiShakeHead();
    },

    _addAdi: function() {
        var adidogNode = new AdiDogNode(true);
        adidogNode.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 6));
        this.addChild(adidogNode);
        this._adi = adidogNode;
    },
});

var DemoSpeechCommandScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var layer = new DemoSpeechCommandLayer();
        this.addChild(layer);
    }
});

DemoSpeechCommandLayer._instance = null;
DemoSpeechCommandLayer.getInstance = function () {
  return DemoSpeechCommandLayer._instance;
};
