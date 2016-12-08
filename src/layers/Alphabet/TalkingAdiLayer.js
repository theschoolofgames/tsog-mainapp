var TalkingAdiLayer = cc.LayerColor.extend({
    _allScale: 0,
    _adiDogSpine: null,
    _settingBtn: null,
    _isListening: false,
    _talkingAdi: null,
    _block: true,

    ctor:function() {
        this._super(cc.color(255,255,255));
        var self= this;
        this.tag = 1;
        this._createTalkingAdi();
        // this._addSettingButton();
        // this.runAction(cc.sequence(
        //     cc.delayTime(5),
        //     cc.callFunc(function(){
        //         self._addCountDownClock();
        //         self._addNextButton();
        //         NativeHelper.callNative("startFetchingAudio");
        //     })
        // ));
        // this._createBackground();

        // cc.audioEngine.playEffect("/sdcard/record_sound.wav");
        var self = this;
        Utils.showVersionLabel(this);
        this.addShopButton();
        NativeHelper.callNative("changeAudioRoute");
        this.addChild(new ShopHUDLayer());
        this.addButtonAnimation();
    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this.playBeginSound();
        this.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function() {Utils.startCountDownTimePlayed();})))
    },

    addShopButton: function() {
        var self = this;
        var shopBtn = new ccui.Button("shopping-basket.png", "", "");
        shopBtn.scale = 150/shopBtn.width;
        shopBtn.x = cc.winSize.width - shopBtn.width * shopBtn.scale;
        shopBtn.y = shopBtn.height/2 * shopBtn.scale + 10;
        this.addChild(shopBtn, 9999);
        shopBtn.addClickEventListener(function(){
            cc.director.runScene(new ShopScene());
        });

        var lbButton = new cc.LabelBMFont(localize("SHOP"), "yellow-font-export.fnt");
        // lbButton.scale = 0.5;
        lbButton.x = shopBtn.width/2;
        lbButton.y = shopBtn.height/2;
        shopBtn.getRendererNormal().addChild(lbButton);
    },

    addButtonAnimation: function(){
        var self = this;

        var buttonSitDown = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonSitDown.x = 120;
        buttonSitDown.y = cc.winSize.height - 180;
        this.addChild(buttonSitDown, 9999);
        buttonSitDown.addClickEventListener(function(){
            self._talkingAdi.adiSitdown();
        });
        var lb = new cc.LabelBMFont("1", res.CustomFont_fnt);
        lb.x = buttonSitDown.width/2;
        lb.y = buttonSitDown.height/2 + 3;
        lb.scale = 0.7;
        buttonSitDown.getVirtualRenderer().addChild(lb);

        var buttonSneeze = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonSneeze.x = buttonSitDown.x;
        buttonSneeze.y = buttonSitDown.y - 100;
        this.addChild(buttonSneeze, 9999);
        buttonSneeze.addClickEventListener(function(){
            self._talkingAdi.adiSneeze();
        });
        var lb = new cc.LabelBMFont("2", res.CustomFont_fnt);
        lb.x = buttonSneeze.width/2;
        lb.y = buttonSneeze.height/2 + 3;
        lb.scale = 0.7;
        buttonSneeze.getVirtualRenderer().addChild(lb);

        var buttonHifi = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonHifi.x = buttonSneeze.x;
        buttonHifi.y = buttonSneeze.y - 100;
        this.addChild(buttonHifi, 9999);
        buttonHifi.addClickEventListener(function(){
            self._talkingAdi.adiHifi();
        });
        var lb = new cc.LabelBMFont("3", res.CustomFont_fnt);
        lb.x = buttonHifi.width/2;
        lb.y = buttonHifi.height/2 + 3;
        lb.scale = 0.7;
        buttonHifi.getVirtualRenderer().addChild(lb);

        var buttonJump = new ccui.Button("btn-language.png", "", "", ccui.Widget.PLIST_TEXTURE);
        buttonJump.x = buttonHifi.x;
        buttonJump.y = buttonHifi.y - 100;
        this.addChild(buttonJump, 9999);
        buttonJump.addClickEventListener(function(){
            self._talkingAdi.adiJump();
        });
        var lb = new cc.LabelBMFont("4", res.CustomFont_fnt);
        lb.x = buttonJump.width/2;
        lb.y = buttonJump.height/2 + 3;
        lb.scale = 0.7;
        buttonJump.getVirtualRenderer().addChild(lb);
        
    },

    playBeginSound: function(){
        self = this;
        var nation = Utils.getLanguage();
        
        this._talkingAdi.adiTalk();
        var mask = new cc.LayerColor(cc.color(0, 0, 0, 0));
        this.addChild(mask, 1000);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) { return true; }
        }, mask);
        var timePlayBeginSound = KVDatabase.getInstance().getInt(TIME_PLAY_BEGIN_SOUND, 0);
        var audioId = "";
        if(timePlayBeginSound == 0) {
            KVDatabase.getInstance().set(TIME_PLAY_BEGIN_SOUND, 1);
            audioId = jsb.AudioEngine.play2d("res/sounds/sentences/" + localize("begin-talkingAdi") + ".mp3", false);
        };
        if(timePlayBeginSound == 0) {
            cc.log("audioId: " + audioId);
            jsb.AudioEngine.setFinishCallback(audioId, function(audioId, audioPath) {
                if(mask)
                    mask.removeFromParent();
                self._talkingAdi.adiIdling();

                // self._addCountDownClock();
                // self._addNextButton();
                if (NativeHelper.callNative("hasGrantPermission", ["RECORD_AUDIO"]))
                    self.startFetchingAudio();
                else {
                    NativeHelper.setListener("RequestPermission", self);
                    NativeHelper.callNative("requestPermission", ["RECORD_AUDIO"]);
                };
            });
        }
        else {
            if(mask)
                mask.removeFromParent();
            self._talkingAdi.adiIdling();

            // self._addCountDownClock();
            // self._addNextButton();
            if (NativeHelper.callNative("hasGrantPermission", ["RECORD_AUDIO"]))
                self.startFetchingAudio();
            else {
                NativeHelper.setListener("RequestPermission", self);
                NativeHelper.callNative("requestPermission", ["RECORD_AUDIO"]);
            };
        };
    },

    onRequestPermission: function(succeed) {
        if (succeed)
            self.startFetchingAudio();
        else {
            NativeHelper.callNative("showMessage", ["Permission Required", "Please enable Microphone permission in Device Setting for TSOG"]);
        }
    },

    startFetchingAudio: function() {
        NativeHelper.callNative("startFetchingAudio");
    },

    _createTalkingAdi: function() {
        var adidogNode = new AdiDogNode(true);
        adidogNode.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 6));
        this.addChild(adidogNode);
        this._talkingAdi = adidogNode;
    },

    // _createBackground: function() {
        
    //     var background = new cc.Sprite( "Bedroom-screen.jpg");
    //     this._allScale = cc.winSize.width / background.width;

    //     background.setScale(this._allScale);
    //     background.x = cc.winSize.width / 2;
    //     background.y = 0;
    //     background.anchorY = 0;
    //     this.addChild(background);

    //     var roof = new cc.Sprite("bedroom-roof.png");
    //     roof.scale = this._allScale;
    //     roof.x = cc.winSize.width/2;
    //     roof.y = cc.winSize.height;
    //     roof.anchorY = 1;
    //     this.addChild(roof);

    //     var roomRibbon = new cc.Sprite("bedroom-ribbon.png");
    //     roomRibbon.x = 0
    //     roomRibbon.y = cc.winSize.height - 135;
    //     roomRibbon.anchorX = 0;
    //     roomRibbon.scale = this._allScale;
    //     this.addChild(roomRibbon);

    //     var roomClock = new cc.Sprite("bedroom-clock.png");
    //     roomClock.x = 350 * this._allScale;
    //     roomClock.y = cc.winSize.height - 195 / this._allScale;
    //     roomClock.scale = this._allScale;
    //     this.addChild(roomClock);

    //     var roomWindow = new cc.Sprite("bedroom-window.png");
    //     roomWindow.x = 620 * this._allScale;
    //     roomWindow.y = cc.winSize.height - 230 / this._allScale;
    //     roomWindow.scale = this._allScale;
    //     this.addChild(roomWindow);
    // },

    _addSettingButton: function() {
        var settingBtn = new ccui.Button();
        settingBtn.loadTextures("btn_pause.png", "btn_pause-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        settingBtn.x = settingBtn.width - 20;
        settingBtn.y = cc.winSize.height - settingBtn.height/2 - 20;
        this.addChild(settingBtn);

        var self = this;
        settingBtn.addClickEventListener(function() {
            self.addChild(new SettingDialog(), 999);
        })
        this._settingBtn = settingBtn;
    },

    _addCountDownClock: function() {
        var self = this;
        var clockInitTime = GAME_CONFIG.talkingAdiTime;
        var clock = new Clock(clockInitTime, function(){
            self._moveToNextScene();
        });
        clock.setIsClockInTalkingAdi(true);
        clock.visible = true;
        clock.x = cc.winSize.width - 60;
        clock.y = 100;
        this.addChild(clock, 99);

        this._clock = clock;
    },

    _addNextButton: function() {
        var nextBtn = new ccui.Button("next.png", "next-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        nextBtn.x = cc.winSize.width - nextBtn.width/2 - 20;
        nextBtn.y = cc.winSize.height/2;
        this.addChild(nextBtn);
        nextBtn.scale = 0.5;
        var self = this;
        nextBtn.addClickEventListener(function() {
            self._moveToNextScene();
        })
    },

    onExit: function() {
        this._super();
        this._stopBackgroundSoundDetecting();
        NativeHelper.removeListener("RequestPermission");
        cc.log("onExit");
    },

    _stopBackgroundSoundDetecting: function() {
        AudioListener.getInstance().removeListener();
        NativeHelper.callNative("stopFetchingAudio");
    },

    _moveToNextScene : function(){
        this._stopBackgroundSoundDetecting();
        var nextSceneName = SceneFlowController.getInstance().getNextSceneName();
        var scene;
        if (nextSceneName != "RoomScene" && nextSceneName != "ForestScene" && nextSceneName != "TalkingAdiScene")
            scene = new RoomScene();
        else
            scene = new window[nextSceneName]();
        cc.director.replaceScene(new cc.TransitionFade(1, scene, cc.color(255, 255, 255, 255)));
    },
});

var TalkingAdiScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var talkingAdiLayer = new TalkingAdiLayer();
        this.addChild(talkingAdiLayer);
    }
});