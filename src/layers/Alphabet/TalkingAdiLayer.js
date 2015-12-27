var TalkingAdiLayer = cc.Layer.extend({
    _allScale: 0,
    _adiDogSpine: null,
    _settingBtn: null,
    _isListening: false,
    
    ctor:function() {
        this._super();

        this.tag = 1;
        this._createBackground();
        this._createTalkingAdi();
        this._addSettingButton();
        this._addCountDownClock();
        this._addNextButton();
        NativeHelper.callNative("startBackgroundSoundDetecting");

        // cc.audioEngine.playEffect("/sdcard/record_sound.wav");
    },

    _createTalkingAdi: function() {
        var adidogNode = new AdiDogNode(true);
        adidogNode.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));
        this.addChild(adidogNode);
    },

    _createBackground: function() {
        
        var background = new cc.Sprite( "Bedroom-screen.jpg");
        this._allScale = cc.winSize.width / background.width;

        background.setScale(this._allScale);
        background.x = cc.winSize.width / 2;
        background.y = 0;
        background.anchorY = 0;
        this.addChild(background);

        var roof = new cc.Sprite("bedroom-roof.png");
        roof.scale = this._allScale;
        roof.x = cc.winSize.width/2;
        roof.y = cc.winSize.height;
        roof.anchorY = 1;
        this.addChild(roof);

        var roomRibbon = new cc.Sprite("bedroom-ribbon.png");
        roomRibbon.x = 0
        roomRibbon.y = cc.winSize.height - 135;
        roomRibbon.anchorX = 0;
        roomRibbon.scale = this._allScale;
        this.addChild(roomRibbon);

        var roomClock = new cc.Sprite("bedroom-clock.png");
        roomClock.x = 350 * this._allScale;
        roomClock.y = cc.winSize.height - 195 / this._allScale;
        roomClock.scale = this._allScale;
        this.addChild(roomClock);

        var roomWindow = new cc.Sprite("bedroom-window.png");
        roomWindow.x = 620 * this._allScale;
        roomWindow.y = cc.winSize.height - 230 / this._allScale;
        roomWindow.scale = this._allScale;
        this.addChild(roomWindow);
    },

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
            self._stopBackgroundSoundDetecting();
            cc.director.replaceScene(new RoomScene());
        });
        clock.visible = false;
        this.addChild(clock, 99);

        this._clock = clock;
    },

    _addNextButton: function() {
        var nextBtn = new ccui.Button("next.png", "next-pressed.png", "", ccui.Widget.PLIST_TEXTURE);
        nextBtn.x = cc.winSize.width - nextBtn.width/2 - 20;
        nextBtn.y = cc.winSize.height/2;
        this.addChild(nextBtn);

        var self = this;
        nextBtn.addClickEventListener(function() {
            self._stopBackgroundSoundDetecting();
            cc.director.replaceScene(new RoomScene());
        })
    },

    onExit: function() {
        this._super();
        this._stopBackgroundSoundDetecting();
        cc.log("onExit");

    },

    _stopBackgroundSoundDetecting: function() {
        AudioListener.getInstance().removeListener();
        NativeHelper.callNative("stopBackgroundSoundDetecting");
    }
});

var TalkingAdiScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var talkingAdiLayer = new TalkingAdiLayer();
        this.addChild(talkingAdiLayer);
    }
});