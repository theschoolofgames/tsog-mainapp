var TalkingAdiLayer = cc.Layer.extend({
    _allScale: 0,
    _adiDogSpine: null,
    
    ctor:function() {
        this._super();
        this.createBackground();
        this.createTalkingAdi();
    },

    createTalkingAdi: function() {
        cc.log("before new");

        this._adiDogSpine = new sp.SkeletonAnimation(res.Adidog_json, res.Adidog_atlas);
        this._adiDogSpine.setPosition(cc.p(cc.winSize.width / 3, cc.winSize.height / 4));

        cc.log("after new");
        // this._adiDogSpine.setMix('walk', 'jump', 0.2); 
        // this._adiDogSpine.setMix('jump', 'run', 0.2);
        this._adiDogSpine.setAnimation(0, 'Idle', true);
        //this._adiDogSpine.setAnimationListener(this, this.animationStateEvent);
        // this._adiDogSpine.setScale(0.5);
        this.addChild(this._adiDogSpine, 4);
    },

    createBackground: function() {
        
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
});

var TalkingAdiScene = cc.Scene.extend({
    ctor: function(){
        this._super();

        var talkingAdiLayer = new TalkingAdiLayer();
        this.addChild(talkingAdiLayer);
    }
});