var TalkingAdiLayer = cc.Layer.extend({
    _allScale: 0,
    _adiDogSpine: null,
    _settingBtn: null,
    
    ctor:function() {
        this._super();
        this._createBackground();
        this._createTalkingAdi();
        this._addSettingButton();
        this._addCountDownClock();
        this._addNextButton();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {return true;}
        }, this);
    },

    _createTalkingAdi: function() {
        this._adiDogSpine = new sp.SkeletonAnimation(res.Adidog_json, res.Adidog_atlas);
        this._adiDogSpine.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 6));


        // this._adiDogSpine.addAnimation(0, 'Idle', true)
        this._adiDogSpine.setAnimation(0, 'ListeningFinish', true);
        //this._adiDogSpine.setAnimationListener(this, this.animationStateEvent);
        this._adiDogSpine.setScale(0.3);
        this.addChild(this._adiDogSpine, 4);
    },

    _adiStartListening: function() {
        this._adiDogSpine.setAnimation(0, 'Listening', false);
    },

    _adiStopListening: function() {
        // set to Idle if system does not receive anything
        this._adiDogSpine.setAnimation(0, 'Idle', true);
        // or start talking back
        this._adiStartTalking();
    },

    _adiStartTalking: function() {
        // adi dog keeps talking till the sound length receive
        this._adiDogSpine.setAnimation(0, 'Talking', true);
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

        nextBtn.addClickEventListener(function() {
            cc.director.replaceScene(new RoomScene());
        })
    }
});

var TalkingAdiScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var talkingAdiLayer = new TalkingAdiLayer();
        this.addChild(talkingAdiLayer);
    }
});